import { getStudioProApi } from "@mendix/extensions-api";
import { getPathInfo, normalizePath } from "./pathUtils";

type StudioProApi = ReturnType<typeof getStudioProApi>;

interface MendixDocument {
    id: string;
    name: string;
    moduleName: string;
    type: string;
}


const MENDIX_STRUCTURAL_MAP: Record<string, string> = {
    "javascriptsource": "JavaScriptActions$JavaScriptAction",
    "javasource": "JavaActions$JavaAction",
    "microflows": "Microflows$Microflow",
    "nanoflows": "Nanoflows$Nanoflow",
    "pages": "Pages$Page",
    "theme": "WebStyles$StyleSheet"
};


async function getAllDocuments(studioPro: StudioProApi): Promise<MendixDocument[]> {
    const allDocs: MendixDocument[] = [];
    const modules = await studioPro.app.model.projects.getModules();

    for (const module of modules) {
        await collectFromContainer(studioPro, module.$ID, module.name, allDocs);
    }
    return allDocs;
}

async function collectFromContainer(
    studioPro: StudioProApi,
    containerId: string,
    moduleName: string,
    allDocs: MendixDocument[]
) {
    try {
        const docs = await studioPro.app.model.projects.getDocumentsInfo(containerId);
        for (const doc of docs) {
            if (doc.name) {
                allDocs.push({
                    id: doc.$ID,
                    name: doc.name,
                    moduleName: moduleName,
                    type: doc.$Type
                });
            }
        }

        const folders = await studioPro.app.model.projects.getFolders(containerId);
        for (const folder of folders) {
            await collectFromContainer(studioPro, folder.$ID, moduleName, allDocs);
        }
    } catch (e) { /* Skip unreadable containers */ }
}

/**
 * Matching Algorithm:
 * 1. Analyzes the path structure to infer Module and Document Type.
 * 2. Strips repository-level prefixes (e.g., -main/).
 * 3. Only matches if Name, Module, and inferred Type align.
 */
export async function openFile(studioPro: StudioProApi, filePath: string): Promise<void> {
    if (!filePath || !studioPro) return;

    const normalizedPath = normalizePath(filePath).toLowerCase();
    const { stem, segments } = getPathInfo(filePath);
    const lowerSegments = segments.map(s => s.toLowerCase());

    // --- 1. Identify the App Root and Inferred Type ---
    let inferredType = "";
    let cleanSegments = [...lowerSegments];
    
    const rootIndex = lowerSegments.findIndex(seg => MENDIX_STRUCTURAL_MAP[seg]);
    
    if (rootIndex !== -1) {
        inferredType = MENDIX_STRUCTURAL_MAP[lowerSegments[rootIndex]];
        cleanSegments = lowerSegments.slice(rootIndex);
    }

    try {
        const candidates = await getAllDocuments(studioPro);
        const lowerStem = stem.toLowerCase();

        // --- 2. Filter by Name ---
        const nameMatches = candidates.filter(doc => doc.name.toLowerCase() === lowerStem);
        if (nameMatches.length === 0) return;

        // --- 3. Filter by Module Context ---
        const contextMatches = nameMatches.filter(doc => 
            cleanSegments.includes(doc.moduleName.toLowerCase())
        );

        // --- 4. Disambiguate by Type (Highest Accuracy) ---
        let finalMatch = null;

        if (contextMatches.length === 1) {
            finalMatch = contextMatches[0];
        } else if (contextMatches.length > 1 && inferredType) {
            finalMatch = contextMatches.find(doc => doc.type === inferredType);
        } else if (nameMatches.length === 1 && rootIndex === -1) {
            finalMatch = nameMatches[0];
        }

        // --- 5. Navigate ---
        if (finalMatch) {
            await studioPro.ui.editors.editDocument(finalMatch.id);
        }
    } catch (e) {
        // Navigation failed
    }
}

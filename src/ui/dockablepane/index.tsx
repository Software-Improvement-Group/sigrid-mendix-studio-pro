import React, {StrictMode, useCallback, useEffect, useMemo, useState} from "react";
import {createRoot} from "react-dom/client";
import {getStudioProApi, type ActiveDocumentInfo, type IComponent} from "@mendix/extensions-api";
import {useSigridStore} from "../../store/sigridStore";
import {ensureGlobalStyles} from "./styles";
import {PrimaryTabs} from "./components/PrimaryTabs";
import {SecurityTable} from "./components/SecurityTable";
import {OpenSourceHealthTable} from "./components/OpenSourceHealthTable";
import {PRIMARY_TABS, type PrimaryTabType} from "./tabConfig";
import {MaintainabilityTable} from "./components/MaintainabilityTable";
import {FileSelectionDialog} from "./components/FileSelectionDialog";
import {openFile} from "./utils/fileNavigation";
import {getPathInfo} from "./utils/pathUtils";

type ScopeOption = "system" | "activeFile";

type SigridFindingsProps = {
    studioPro: ReturnType<typeof getStudioProApi>;
};

const STORAGE_KEYS = new Set([
    'sigridToken',
    'sigridCustomer',
    'sigridSystem',
    'sigridSecurityFindings',
    'sigridOshDependencies',
    'sigridRefactoringCandidates',
    'sigridAnalysisDate'
]);

export function SigridFindings({ studioPro }: SigridFindingsProps) {
    const [activePrimaryTab, setActivePrimaryTab] = useState<PrimaryTabType>('maintainability');
    const [scope, setScope] = useState<ScopeOption>('system');
    const [activeFile, setActiveFile] = useState<ActiveDocumentInfo | null>(null);
    const [dialogFiles, setDialogFiles] = useState<string[] | null>(null);

    useEffect(() => {
        ensureGlobalStyles();
    }, []);

    useEffect(() => {
        let isUnmounted = false;

        const editors = studioPro.ui?.editors;

        if (!editors) {
            return () => {
                isUnmounted = true;
            };
        }

        const updateActiveFile = (info: ActiveDocumentInfo | null) => {
            if (!isUnmounted) {
                setActiveFile(info);
            }
        };

        const initialize = async () => {
            try {
                const info = await editors.getActiveDocument();
                updateActiveFile(info ?? null);
            } catch (error) {
                console.warn("Failed to read selected file", error);
            }
        };

        void initialize();

        const handleActiveFileChanged = ({ info }: { info: ActiveDocumentInfo | null }) => {
            updateActiveFile(info ?? null);
        };

        editors.addEventListener?.("activeDocumentChanged", handleActiveFileChanged);

        return () => {
            isUnmounted = true;
            editors.removeEventListener?.("activeDocumentChanged", handleActiveFileChanged);
        };
    }, [studioPro]);

    const handleOpenFiles = useCallback((files: string[]) => {
        if (!files || files.length === 0) {
            return;
        }

        if (files.length === 1) {
            openFile(studioPro, files[0]);
        } else {
            setDialogFiles(files);
        }
    }, [studioPro]);

    const handleDialogSelect = useCallback((file: string) => {
        setDialogFiles(null);
        openFile(studioPro, file);
    }, [studioPro]);

    const handleDialogClose = useCallback(() => {
        setDialogFiles(null);
    }, []);
    
    const {
        securityFindings,
        oshDependencies,
        refactoringCandidates,
        analysisDate,
        isLoading,
        error,
        settings,
        loadSettingsFromStorage,
        loadAllData
    } = useSigridStore();

    const scopeEnabled = activePrimaryTab !== 'openSourceHealth';

    const shouldFilterByFile = scopeEnabled && scope === "activeFile" && Boolean(activeFile?.documentName);

    const matchesActiveFile = useCallback((filePath?: string | null) => {
        if (!shouldFilterByFile || !filePath || !activeFile?.documentName) {
            return false;
        }

        const { fileName, stem, segments } = getPathInfo(filePath.toLowerCase());
        if (segments.length === 0) return false;

        const targetFileName = activeFile.documentName.toLowerCase();

        if (stem === targetFileName || fileName === targetFileName) {
            return true;
        }

        if (activeFile.moduleName) {
            const targetModule = activeFile.moduleName.toLowerCase();
            // Check if any segment matches the module name AND the filename matches the target
            const hasModuleMatch = segments.some(s => s === targetModule);
            if (hasModuleMatch && (fileName.includes(targetFileName) || targetFileName.includes(stem))) {
                return true;
            }
        }

        return false;
    }, [activeFile, shouldFilterByFile]);

    const filteredSecurityFindings = useMemo(() => {
        if (!shouldFilterByFile) {
            return securityFindings;
        }

        return securityFindings.filter((finding) => matchesActiveFile(finding.filePath));
    }, [matchesActiveFile, securityFindings, shouldFilterByFile]);

    const filteredRefactoringCandidates = useMemo(() => {
        if (!shouldFilterByFile) {
            return refactoringCandidates;
        }

        return (Object.keys(refactoringCandidates) as Array<keyof typeof refactoringCandidates>)
            .reduce((acc, category) => {
                acc[category] = refactoringCandidates[category].filter((candidate) => {
                    if (matchesActiveFile(candidate.file)) {
                        return true;
                    }

                    return candidate.locations.some((location) => matchesActiveFile(location.file));
                });
                return acc;
            }, {} as typeof refactoringCandidates);
    }, [matchesActiveFile, refactoringCandidates, shouldFilterByFile]);

    const maintainabilityCount = useMemo(
        () => Object.values(filteredRefactoringCandidates).reduce((total, items) => total + items.length, 0),
        [filteredRefactoringCandidates]
    );

    const securityCount = filteredSecurityFindings.length;
    const openSourceHealthCount = oshDependencies.length;

    useEffect(() => {
        const syncFromStorage = () => loadSettingsFromStorage();

        syncFromStorage();

        const handleStorage = (event: StorageEvent) => {
            if (event.key && STORAGE_KEYS.has(event.key)) {
                syncFromStorage();
            }
        };

        window.addEventListener('storage', handleStorage);
        return () => window.removeEventListener('storage', handleStorage);
    }, [loadSettingsFromStorage]);

    useEffect(() => {
        if (!settings) {
            return;
        }
        void loadAllData();
    }, [settings?.token, settings?.customer, settings?.system, loadAllData]);

    return (
        <div>
            <div className="sigrid-top-row">
                <PrimaryTabs
                    activeTab={activePrimaryTab}
                    onSelect={setActivePrimaryTab}
                    tabs={PRIMARY_TABS}
                    counts={{
                        maintainability: maintainabilityCount,
                        security: securityCount,
                        openSourceHealth: openSourceHealthCount
                    }}
                />

                <div className="analysis-date">Latest analysis: <span>{analysisDate}</span></div>
            </div>
            {scopeEnabled && (
                <div className="scope-toggle" aria-label="Findings scope selector">
                    <div className="scope-toggle-buttons">
                        <button
                            type="button"
                            className={`scope-button${scope === "system" ? " active" : ""}`}
                            onClick={() => setScope("system")}
                            disabled={scope === "system"}
                        >
                            Entire system
                        </button>
                        <button
                            type="button"
                            className={`scope-button${scope === "activeFile" ? " active" : ""}`}
                            onClick={() => setScope("activeFile")}
                            disabled={!activeFile?.documentName}
                        >
                            Selected file
                        </button>
                    </div>
                </div>
            )}
            {scopeEnabled && scope === "activeFile" && !activeFile?.documentName && (
                <div className="status-message warning">Open a file in Studio Pro to filter findings.</div>
            )}
            {isLoading && <div className="status-message">Loading data...</div>}
            {error && <div className="status-message error">{error}</div>}
            
            {!isLoading && !error && (
                <>
                    {activePrimaryTab === 'security' && (
                        <SecurityTable 
                            findings={filteredSecurityFindings}
                            onOpenFiles={handleOpenFiles}
                        />
                    )}
                    
                    {activePrimaryTab === 'openSourceHealth' && (
                        <OpenSourceHealthTable dependencies={oshDependencies} />
                    )}
                    
                    {activePrimaryTab === 'maintainability' && (
                        <MaintainabilityTable 
                            refactoringCandidates={filteredRefactoringCandidates} 
                            onOpenFiles={handleOpenFiles}
                        />
                    )}
                </>
            )}

            <div className="reload-button-row">
                <button
                    className="reload-button"
                    onClick={() => loadAllData({ requireSettings: true })}
                    disabled={isLoading}
                >
                    {isLoading ? 'Loading...' : 'Reload data'}
                </button>
            </div>
            
            {dialogFiles && (
                <FileSelectionDialog 
                    files={dialogFiles} 
                    onSelect={handleDialogSelect} 
                    onClose={handleDialogClose} 
                />
            )}
        </div>
    );
}

export const component: IComponent = {
    async loaded(componentContext) {
        const studioPro = getStudioProApi(componentContext);
        createRoot(document.getElementById("root")!).render(
            <StrictMode>
                <SigridFindings studioPro={studioPro}/>
            </StrictMode>
        );
    }
}

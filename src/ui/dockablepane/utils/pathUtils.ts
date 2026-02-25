export function normalizePath(path: string | null | undefined): string {
    if (!path) return "";
    return path
        .replace(/[\u200B-\u200D\uFEFF]/g, "") // Remove zero-width spaces, BOM, etc.
        .trim()
        .replace(/\\/g, "/")
        .replace(/\/+/g, "/");
}

export function getPathInfo(path: string | null | undefined): { fileName: string; stem: string; segments: string[] } {
    const normalized = normalizePath(path);
    const segments = normalized.split("/").filter(Boolean);
    
    if (segments.length === 0) {
        return { fileName: "", stem: "", segments: [] };
    }

    const fileName = segments[segments.length - 1];
    const lastDotIndex = fileName.lastIndexOf(".");
    const stem = lastDotIndex !== -1 ? fileName.substring(0, lastDotIndex) : fileName;

    return { fileName, stem, segments };
}

export function toDisplayPath(path: string | null | undefined): string {
    const { fileName } = getPathInfo(path);
    return fileName ? `.../${fileName}` : "";
}

export function stripMendixExtensions(path: string | null | undefined): string {
    const normalized = normalizePath(path);
    if (!normalized) return "";
    
    return normalized
        .replace(/\.mx\.json$/i, "")
        .replace(/\.mendix/i, "");
}

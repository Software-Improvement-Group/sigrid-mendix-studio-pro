import { create } from "zustand";

const SIGRID_API_BASE = "https://sigrid-says.com/rest/analysis-results/api/v1";

const SECURITY_FINDINGS_KEY = "sigridSecurityFindings";
const OSH_DEPENDENCIES_KEY = "sigridOshDependencies";
const OSH_METADATA_KEY = "sigridOshMetadata";
const REFACTORING_CANDIDATES_KEY = "sigridRefactoringCandidates";
const ANALYSIS_DATE_KEY = "sigridAnalysisDate";

export type SecurityFindingReference = {
    title?: string;
    url?: string;
    type?: string;
};

export type SecurityFinding = {
    id: string;
    name: string;
    type?: string;
    status: string;
    severity?: string;
    model?: string;
    category?: string;
    owaspCategory?: string;
    cweId?: string;
    businessImpact?: string;
    firstSeenSnapshotDate?: string;
    lastSeenSnapshotDate?: string;
    filePath?: string;
    displayFilePath?: string;
    lineNumber?: number;
    component?: string;
    technology?: string;
    reviewStatus?: string;
    references: SecurityFindingReference[];
};

export type OshLicense = {
    id?: string;
    name?: string;
    url?: string;
};

export type OshComponentVulnerability = {
    id?: string;
    source?: string;
    severity?: string;
    url?: string;
    title?: string;
};

export type OshDependency = {
    name: string;
    version: string;
    type?: string;
    dependencyType?: string;
    status?: string;
    supplier?: string;
    group?: string;
    purl?: string;
    licenses: OshLicense[];
    vulnerabilityRisk: string;
    licenseRisk: string;
    freshnessRisk: string;
    activityRisk: string;
    stabilityRisk: string;
    managementRisk: string;
    libraryFreshness?: string;
    risk?: string;
    releaseDate?: string;
    nextVersion?: string;
    nextReleaseDate?: string;
    latestVersion?: string;
    latestReleaseDate?: string;
    transitive?: string;
    vulnerabilities: OshComponentVulnerability[];
};

export type OshMetadata = {
    exportDate?: string;
    systemRating?: string;
    vulnerabilityRating?: string;
    licenseRating?: string;
    freshnessRating?: string;
    managementRating?: string;
    activityRating?: string;
};

export type RefactoringCandidateLocation = {
    component: string;
    file: string;
    displayFilePath?: string;
    moduleId?: number;
    startLine?: number;
    endLine?: number;
};

export type RefactoringCandidateLineRange = {
    startLine?: number;
    endLine?: number;
    refactoringCandidateId?: string;
};

export type RefactoringCategory =
    | "duplication"
    | "unitSize"
    | "unitComplexity"
    | "unitInterfacing"
    | "moduleCoupling"
    | "componentIndependence"
    | "componentEntanglement";

// Reminder: finding out what each endpoint returns was time consuming as the Sigrid API docs only give unitSize as an example, the docs need to be updated
export type RefactoringCandidate = {
    id: string;
    category: RefactoringCategory;
    summary: string;
    severity: string;
    status: string;
    technology?: string;
    snapshotDate: string;
    sameComponent?: boolean;
    sameFile?: boolean;
    component?: string;
    file?: string;
    name?: string;
    moduleId?: number;
    startLine?: number;
    endLine?: number;
    mcCabe?: number;
    parameters?: number;
    lineRanges?: RefactoringCandidateLineRange[];
    fanIn?: number;
    type?: string;
    loc?: number;
    weight?: number;
    estimatedEffortHours?: number;
    valueScore?: number;
    description?: string;
    rationale?: string;
    locations: RefactoringCandidateLocation[];
};

export type SigridSettings = {
    token: string;
    customer: string;
    system: string;
};

export type RefactoringCandidatesMap = Record<RefactoringCategory, RefactoringCandidate[]>;

const REFACTORING_CATEGORIES: RefactoringCategory[] = [
    "duplication",
    "unitSize",
    "unitComplexity",
    "unitInterfacing",
    "moduleCoupling",
    "componentIndependence",
    "componentEntanglement",
];

const createEmptyRefactoringMap = (): RefactoringCandidatesMap =>
    REFACTORING_CATEGORIES.reduce((accumulator, category) => {
        accumulator[category] = [];
        return accumulator;
    }, {} as RefactoringCandidatesMap);

const asString = (value: unknown): string | undefined => {
    if (typeof value === "string") {
        const trimmed = value.trim();
        return trimmed.length > 0 ? trimmed : undefined;
    }
    return undefined;
};

const asStringOrDefault = (value: unknown, fallback: string): string => asString(value) ?? fallback;

const asNumber = (value: unknown): number | undefined => {
    if (typeof value === "number" && Number.isFinite(value)) {
        return value;
    }
    if (typeof value === "string") {
        const parsed = Number.parseFloat(value);
        return Number.isFinite(parsed) ? parsed : undefined;
    }
    return undefined;
};

const asBoolean = (value: unknown): boolean => {
    if (typeof value === "boolean") {
        return value;
    }
    if (typeof value === "string") {
        const normalized = value.trim().toLowerCase();
        if (["true", "yes", "1"].includes(normalized)) {
            return true;
        }
        if (["false", "no", "0"].includes(normalized)) {
            return false;
        }
    }
    if (typeof value === "number") {
        return value !== 0;
    }
    return Boolean(value);
};

const asOptionalBoolean = (value: unknown): boolean | undefined => {
    if (value === undefined || value === null) {
        return undefined;
    }

    return asBoolean(value);
};

const isNotNull = <T>(value: T | null | undefined): value is T => value != null;

const toDisplayFilePath = (path?: string): string | undefined => {
    // Keep the cells smaller by showing only the filename
    if (!path) {
        return undefined;
    }
    const trimmed = path.trim();
    if (!trimmed) {
        return undefined;
    }
    const segments = trimmed.split(/[\\/]/);
    const fileName = segments.pop();
    return fileName ? `.../${fileName}` : undefined;
};

const mapArray = <T>(input: unknown, mapper: (value: unknown) => T | null): T[] => {
    if (!Array.isArray(input)) {
        return [];
    }

    return input.map(mapper).filter(isNotNull);
};

const buildPropertyLookup = (properties: unknown): Record<string, string> => {
    const lookup: Record<string, string> = {};

    if (!Array.isArray(properties)) {
        return lookup;
    }

    properties.forEach((prop) => {
        if (!prop || typeof prop !== "object") {
            return;
        }
        const propData = prop as Record<string, unknown>;
        const name = asString(propData.name);
        const value = asString(propData.value);
        if (name && value) {
            lookup[name] = value;
        }
    });

    return lookup;
};

const readJsonFromStorage = <T>(
    key: string,
    parser: (raw: unknown) => T,
    fallback: () => T,
): T => {
    const raw = localStorage.getItem(key);
    if (!raw) {
        return fallback();
    }

    try {
        return parser(JSON.parse(raw));
    } catch {
        return fallback();
    }
};

const createFetchClient = (settings: SigridSettings) =>
    async <T,>(endpoint: string): Promise<T | null> => {
        const url = `${SIGRID_API_BASE}/${endpoint}`;

        try {
            const response = await fetch(url, {
                mode: "cors",
                credentials: "omit",
                headers: {
                    Authorization: `Bearer ${settings.token}`,
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            return await response.json();
        // TODO: add better error handling here
        } catch (error: any) {
            throw error;
        }
    };

const RISK_PRIORITY = ["critical", "high", "medium", "low", "none"] as const;

// Overall risk level = highest level of the individual risks 
const findHighestRisk = (values: Array<string | undefined>): string | undefined => {
    const cleaned = values
        .map((value) => value?.trim())
        .filter((value): value is string => Boolean(value && value.length > 0));

    for (const level of RISK_PRIORITY) {
        const match = cleaned.find((value) => value.toLowerCase() === level);
        if (match) {
            return match;
        }
    }

    return cleaned[0];
};

const mapSecurityReference = (input: unknown): SecurityFindingReference | null => {
    if (!input || typeof input !== "object") {
        return null;
    }

    const data = input as Record<string, unknown>;
    const reference: SecurityFindingReference = {
        title: asString(data.title) ?? asString(data.description),
        url: asString(data.url),
        type: asString(data.type),
    };

    return reference.title || reference.url || reference.type ? reference : null;
};

const mapOshLicense = (input: unknown): OshLicense | null => {
    if (!input || typeof input !== "object") {
        return null;
    }

    const data = input as Record<string, unknown>;
    const license: OshLicense = {
        id: asString(data.id) ?? asString(data.licenseId),
        name: asString(data.name),
        url: asString(data.url),
    };

    return license.id || license.name || license.url ? license : null;
};

const mapRefactoringLocation = (input: unknown): RefactoringCandidateLocation | null => {
    if (!input || typeof input !== "object") {
        return null;
    }

    const data = input as Record<string, unknown>;
    const component = asString(data.component) ?? "";
    const file = asString(data.file) ?? "";

    if (!component && !file) {
        return null;
    }

    return {
        component,
        file,
        displayFilePath: toDisplayFilePath(file),
        moduleId: asNumber(data.moduleId),
        startLine: asNumber(data.startLine),
        endLine: asNumber(data.endLine),
    };
};

const mapRefactoringLineRange = (input: unknown): RefactoringCandidateLineRange | null => {
    if (!input || typeof input !== "object") {
        return null;
    }

    const data = input as Record<string, unknown>;
    const startLine = asNumber(data.startLine);
    const endLine = asNumber(data.endLine);

    if (startLine === undefined && endLine === undefined) {
        return null;
    }

    return {
        startLine,
        endLine,
        refactoringCandidateId: asString(data.refactoringCandidateId),
    };
};

const mapSecurityFinding = (input: unknown): SecurityFinding | null => {
    if (!input || typeof input !== "object") {
        return null;
    }

    const data = input as Record<string, unknown>;
    const id = asString(data.id) ?? asString(data.findingId);
    if (!id) {
        return null;
    }

    const type = asString(data.type) ?? asString(data.name);
    const title = asString(data.title) ?? asString(data.name) ?? type ?? id;

    const references = mapArray<SecurityFindingReference>(data.references, mapSecurityReference);

    const filePath = asString(data.filePath) ?? asString(data.path);
    const displayFilePath = toDisplayFilePath(filePath);

    return {
        id,
        name: title,
        type,
        status: asStringOrDefault(data.status, "UNKNOWN"),
        severity: asString(data.severity),
        model: asString(data.model),
        category: asString(data.category) ?? asString(data.top10Category),
        owaspCategory: asString(data.owaspCategory) ?? asString(data.categoryName),
        cweId: asString(data.cweId) ?? asString(data.cwe),
        businessImpact: asString(data.businessImpact),
        firstSeenSnapshotDate: asString(data.firstSeenSnapshotDate),
        lastSeenSnapshotDate: asString(data.lastSeenSnapshotDate) ?? asString(data.snapshotDate),
        filePath,
        displayFilePath,
        lineNumber: asNumber(data.lineNumber),
        component: asString(data.component),
        technology: asString(data.technology),
        reviewStatus: asString(data.reviewStatus),
        references,
    };
};

const mapOshComponentVulnerability = (input: unknown): OshComponentVulnerability | null => {
    if (!input || typeof input !== "object") {
        return null;
    }

    const data = input as Record<string, unknown>;
    const id = asString(data.id) ?? asString(data.vulnerabilityId);
    const title = asString(data.title) ?? asString(data.description);
    const url = asString(data.url);

    if (!id && !title && !url) {
        return null;
    }

    return {
        id,
        source: asString(data.source),
        severity: asString(data.severity) ?? asString(data.rating),
        url,
        title,
    };
};

const mapOshDependency = (input: unknown): OshDependency | null => {
    if (!input || typeof input !== "object") {
        return null;
    }

    const data = input as Record<string, unknown>;
    const name = asStringOrDefault(data.name, "Unnamed component");
    const version = asStringOrDefault(data.version, "N/A");
    const propertyLookup = buildPropertyLookup(data.properties);

    const licenses = mapArray<OshLicense>(data.licenses, mapOshLicense);
    const vulnerabilities = mapArray<OshComponentVulnerability>(
        data.vulnerabilities,
        mapOshComponentVulnerability,
    );

    const vulnerabilityRiskValue = propertyLookup["sigrid:risk:vulnerability"];
    const licenseRiskValue = propertyLookup["sigrid:risk:legal"];
    const freshnessRiskValue = propertyLookup["sigrid:risk:freshness"];
    const activityRiskValue = propertyLookup["sigrid:risk:activity"];
    const stabilityRiskValue = propertyLookup["sigrid:risk:stability"];
    const managementRiskValue = propertyLookup["sigrid:risk:management"];
    const vulnerabilityRisk = vulnerabilityRiskValue ?? "N/A";
    const licenseRisk = licenseRiskValue ?? "N/A";
    const freshnessRisk = freshnessRiskValue ?? "N/A";
    const activityRisk = activityRiskValue ?? "N/A";
    const stabilityRisk = stabilityRiskValue ?? "N/A";
    const managementRisk = managementRiskValue ?? "N/A";

    const libraryFreshness = propertyLookup["sigrid:freshness:status"]
        ?? propertyLookup["sigrid:library:freshness"]
        ?? propertyLookup["sigrid:latest:releaseDate"]
        ?? propertyLookup["sigrid:releaseDate"];

    const dependencyType = propertyLookup["sigrid:transitive"] ?? asString(data.scope);

    const riskFromComponent = asString(data.risk);
    const risk = findHighestRisk([
        riskFromComponent,
        vulnerabilityRiskValue,
        licenseRiskValue,
        managementRiskValue,
        activityRiskValue,
        stabilityRiskValue,
        freshnessRiskValue,
    ]);

    return {
        name,
        version,
        type: asString(data.type),
        dependencyType,
        status: propertyLookup["sigrid:status"] ?? asString(data.status),
        supplier: asString(data.supplier) ?? asString(data.supplierName),
        group: asString(data.group),
        purl: asString(data.purl),
        licenses,
        vulnerabilityRisk,
        licenseRisk,
        freshnessRisk,
        activityRisk,
        stabilityRisk,
        managementRisk,
        libraryFreshness,
        risk,
        releaseDate: propertyLookup["sigrid:releaseDate"] ?? asString(data.releaseDate),
        nextVersion: propertyLookup["sigrid:next:version"],
        nextReleaseDate: propertyLookup["sigrid:next:releaseDate"],
        latestVersion: propertyLookup["sigrid:latest:version"],
        latestReleaseDate: propertyLookup["sigrid:latest:releaseDate"],
        transitive: propertyLookup["sigrid:transitive"],
        vulnerabilities,
    };
};

const mapOshMetadata = (properties: unknown, exportDateValue?: unknown): OshMetadata | null => {
    const propertyLookup = buildPropertyLookup(properties);

    const metadata: OshMetadata = {
        exportDate: asString(exportDateValue) ?? propertyLookup["sigrid:exportDate"],
        systemRating: propertyLookup["sigrid:ratings:system"],
        vulnerabilityRating: propertyLookup["sigrid:ratings:vulnerability"],
        licenseRating: propertyLookup["sigrid:ratings:licenses"],
        freshnessRating: propertyLookup["sigrid:ratings:freshness"],
        managementRating: propertyLookup["sigrid:ratings:management"],
        activityRating: propertyLookup["sigrid:ratings:activity"],
    };

    return Object.values(metadata).some((value) => value !== undefined) ? metadata : null;
};

const mapRefactoringCandidate = (input: unknown, category: RefactoringCategory): RefactoringCandidate | null => {
    if (!input || typeof input !== "object") {
        return null;
    }

    const data = input as Record<string, unknown>;
    const id = asString(data.id);
    if (!id) {
        return null;
    }

    const locations = mapArray<RefactoringCandidateLocation>(data.locations, mapRefactoringLocation);
    const lineRanges = mapArray<RefactoringCandidateLineRange>(data.lineRanges, mapRefactoringLineRange);

    const technology = asString(data.technology);
    const sameComponent = asOptionalBoolean(data.sameComponent);
    const sameFile = asOptionalBoolean(data.sameFile);

    return {
        id,
        category,
        summary: asString(data.summary) ?? asString(data.title) ?? id,
        severity: asStringOrDefault(data.severity, "UNKNOWN"),
        status: asStringOrDefault(data.status, "UNKNOWN"),
        technology,
        snapshotDate: asString(data.snapshotDate) ?? "",
        sameComponent,
        sameFile,
        component: asString(data.component),
        file: asString(data.file),
        name: asString(data.name),
        moduleId: asNumber(data.moduleId),
        startLine: asNumber(data.startLine),
        endLine: asNumber(data.endLine),
        mcCabe: asNumber(data.mcCabe),
        parameters: asNumber(data.parameters),
        lineRanges: lineRanges.length > 0 ? lineRanges : undefined,
        fanIn: asNumber(data.fanIn),
        type: asString(data.type),
        loc: asNumber(data.loc),
        weight: asNumber(data.weight),
        estimatedEffortHours: asNumber(data.estimatedEffortHours ?? data.effortHours),
        valueScore: asNumber(data.valueScore ?? data.value ?? data.score),
        description: asString(data.description) ?? asString(data.message),
        rationale: asString(data.rationale) ?? asString(data.reason),
        locations,
    };
};

const deserializeSecurityFindings = (raw: unknown): SecurityFinding[] =>
    mapArray<SecurityFinding>(raw, mapSecurityFinding);

const deserializeOshDependencies = (raw: unknown): OshDependency[] =>
    mapArray<OshDependency>(raw, mapOshDependency);

const deserializeOshMetadata = (raw: unknown): OshMetadata | null => {
    if (!raw || typeof raw !== "object") {
        return null;
    }

    const data = raw as Record<string, unknown>;
    const metadata: OshMetadata = {
        exportDate: asString(data.exportDate),
        systemRating: asString(data.systemRating),
        vulnerabilityRating: asString(data.vulnerabilityRating),
        licenseRating: asString(data.licenseRating),
        freshnessRating: asString(data.freshnessRating),
        managementRating: asString(data.managementRating),
        activityRating: asString(data.activityRating),
    };

    return Object.values(metadata).some((value) => value !== undefined) ? metadata : null;
};

const deserializeRefactoringCandidates = (raw: unknown): RefactoringCandidatesMap => {
    if (!raw || typeof raw !== "object") {
        return createEmptyRefactoringMap();
    }

    const parsed = createEmptyRefactoringMap();

    REFACTORING_CATEGORIES.forEach((category) => {
        const candidates = (raw as Record<string, unknown>)[category];
        if (!Array.isArray(candidates)) {
            parsed[category] = [];
            return;
        }

        parsed[category] = candidates.map((candidate) => mapRefactoringCandidate(candidate, category)).filter(isNotNull);
    });

    return parsed;
};

const deriveAnalysisDate = (
    securityFindings: SecurityFinding[],
    refactoringCandidates: RefactoringCandidatesMap,
    oshMetadata: OshMetadata | null,
): string => {
    const latestSecurityDate = securityFindings.find((finding) => finding.lastSeenSnapshotDate)?.lastSeenSnapshotDate;
    if (latestSecurityDate) {
        return formatAnalysisDate(latestSecurityDate);
    }
    for (const category of REFACTORING_CATEGORIES) {
        const candidateDate = refactoringCandidates[category]?.[0]?.snapshotDate;
        if (candidateDate) {
            return formatAnalysisDate(candidateDate);
        }
    }
    if (oshMetadata?.exportDate) {
        return formatAnalysisDate(oshMetadata.exportDate);
    }

    return "N/A";
};

const formatAnalysisDate = (value: string): string => {
    const parsed = Date.parse(value);
    if (Number.isFinite(parsed)) {
        return new Date(parsed).toDateString();
    }

    return value;
};

type SigridState = {
    settings: SigridSettings | null;
    securityFindings: SecurityFinding[];
    oshDependencies: OshDependency[];
    oshMetadata: OshMetadata | null;
    refactoringCandidates: RefactoringCandidatesMap;
    analysisDate: string;
    isLoading: boolean;
    error: string | null;
    setSettings: (settings: SigridSettings) => void;
    loadAllData: (options?: { requireSettings?: boolean; settingsOverride?: SigridSettings }) => Promise<void>;
    loadSettingsFromStorage: () => void;
};

// TODO: refactor so that the hook returns functions separately
export const useSigridStore = create<SigridState>((set, get) => ({
    settings: null,
    securityFindings: [],
    oshDependencies: [],
    oshMetadata: null,
    refactoringCandidates: createEmptyRefactoringMap(),
    analysisDate: "N/A",
    isLoading: false,
    error: null,

    setSettings: (settings: SigridSettings) => {
        localStorage.setItem("sigridToken", settings.token);
        localStorage.setItem("sigridCustomer", settings.customer.toLowerCase());
        localStorage.setItem("sigridSystem", settings.system.toLowerCase());
        set({
            settings: {
                token: settings.token,
                customer: settings.customer.toLowerCase(),
                system: settings.system.toLowerCase(),
            },
            error: null,
        });
    },

    loadSettingsFromStorage: () => {
        const storedToken = localStorage.getItem("sigridToken");
        const storedCustomer = localStorage.getItem("sigridCustomer");
        const storedSystem = localStorage.getItem("sigridSystem");
        const cachedSecurityFindings = readJsonFromStorage(SECURITY_FINDINGS_KEY, deserializeSecurityFindings, () => []);
        const cachedOshDependencies = readJsonFromStorage(OSH_DEPENDENCIES_KEY, deserializeOshDependencies, () => []);
        const cachedOshMetadata = readJsonFromStorage(OSH_METADATA_KEY, deserializeOshMetadata, () => null);
        const cachedRefactoring = readJsonFromStorage(
            REFACTORING_CANDIDATES_KEY,
            deserializeRefactoringCandidates,
            createEmptyRefactoringMap,
        );

        const storedAnalysisDate = localStorage.getItem(ANALYSIS_DATE_KEY);
        const derivedAnalysisDate = deriveAnalysisDate(cachedSecurityFindings, cachedRefactoring, cachedOshMetadata);
        const cachedAnalysisDate = storedAnalysisDate && storedAnalysisDate.trim().length > 0
            ? storedAnalysisDate
            : derivedAnalysisDate;

        if (storedToken && storedCustomer && storedSystem) {
            set({
                settings: {
                    token: storedToken,
                    customer: storedCustomer.toLowerCase(),
                    system: storedSystem.toLowerCase(),
                },
                securityFindings: cachedSecurityFindings,
                oshDependencies: cachedOshDependencies,
                oshMetadata: cachedOshMetadata,
                refactoringCandidates: cachedRefactoring,
                analysisDate: cachedAnalysisDate,
                error: null,
            });
        } else {
            set({
                securityFindings: cachedSecurityFindings,
                oshDependencies: cachedOshDependencies,
                oshMetadata: cachedOshMetadata,
                refactoringCandidates: cachedRefactoring,
                analysisDate: cachedAnalysisDate,
            });
        }
    },

    loadAllData: async (options = {}) => {
        const currentState = get();
        const { requireSettings = false, settingsOverride } = options;
        const effectiveSettings = settingsOverride ?? currentState.settings;

        if (!effectiveSettings) {
            if (requireSettings) {
                const errorMsg = "No settings configured. Please configure your QSM credentials first.";
                set({ error: errorMsg, isLoading: false });
            }
            return;
        }

        set({ isLoading: true, error: null });

        try {
            const fetchJson = createFetchClient(effectiveSettings);

            const securityData = await fetchJson<any[]>(
                `security-findings/${effectiveSettings.customer}/${effectiveSettings.system}`,
            );

            const securityFindings = mapArray<SecurityFinding>(securityData, mapSecurityFinding);

            const oshData = await fetchJson<any>(
                `osh-findings/${effectiveSettings.customer}/${effectiveSettings.system}`,
            );

            const sbom = oshData?.sbom || oshData;

            const oshDependencies = mapArray<OshDependency>(sbom?.components, mapOshDependency);

            const oshMetadata = mapOshMetadata(sbom?.properties ?? oshData?.properties, oshData?.exportDate ?? sbom?.exportDate);

            const refactoringCandidates = createEmptyRefactoringMap();

            for (const property of REFACTORING_CATEGORIES) {
                try {
                    const refactoringData = await fetchJson<any>(
                        `refactoring-candidates/${effectiveSettings.customer}/${effectiveSettings.system}/${property}`,
                    );
                    refactoringCandidates[property] = mapArray<RefactoringCandidate>(
                        refactoringData?.refactoringCandidates,
                        (candidate) => mapRefactoringCandidate(candidate, property),
                    );
                } catch {
                    refactoringCandidates[property] = [];
                }
            }

            const analysisDate = deriveAnalysisDate(securityFindings, refactoringCandidates, oshMetadata);

            try {
                localStorage.setItem(SECURITY_FINDINGS_KEY, JSON.stringify(securityFindings));
                localStorage.setItem(OSH_DEPENDENCIES_KEY, JSON.stringify(oshDependencies));
                if (oshMetadata) {
                    localStorage.setItem(OSH_METADATA_KEY, JSON.stringify(oshMetadata));
                } else {
                    localStorage.removeItem(OSH_METADATA_KEY);
                }
                localStorage.setItem(REFACTORING_CANDIDATES_KEY, JSON.stringify(refactoringCandidates));
                localStorage.setItem(ANALYSIS_DATE_KEY, analysisDate);
            } catch {
            }
            
            set({
                securityFindings,
                oshDependencies,
                oshMetadata,
                refactoringCandidates,
                analysisDate,
                isLoading: false,
                error: null,
            });

        } catch (error: any) {
            const errorMsg = error?.message || "Failed to load data from the QSM API";
            set({
                error: errorMsg,
                isLoading: false,
            });
        }
    },
}));

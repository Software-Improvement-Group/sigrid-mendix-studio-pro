import React, { FC, StrictMode, useState } from "react";
import { createRoot } from "react-dom/client";
import { IComponent } from "@mendix/extensions-api";

const SIGRID_API_BASE = "https://sigrid-says.com/rest/analysis-results/api/v1";

export interface findingProps {
    id: string;
    name: string;
    status: string;
}

interface OshDependency {
    name: string;
    version: string;
    vulnerabilityRisk: string;
    licenseRisk: string;
    freshnessRisk: string;
    activityRisk: string;
}

interface SecurityFinding extends findingProps {
    date: Date;
}

interface SigridSettings {
    token: string;
    customer: string;
    system: string;
}

type PrimaryTabType = 'maintainability' | 'security' | 'openSourceHealth';
type MaintainabilitySubTabType = 'duplication' | 'unitSize' | 'unitComplexity' | 'unitInterfacing' | 'moduleCoupling' | 'componentIndependence' | 'componentEntanglement';

export function SigridFindings() {

    const initialFindings: SecurityFinding[] = [
        { name: 'Dummy', id: '1', status: 'Dummy', date: new Date(1991, 1, 1) },
    ];
    const [currentFindingList, setCurrentFindingList] = useState<SecurityFinding[]>(initialFindings);
    const [openSourceHealthDependencies, setOpenSourceHealthDependencies] = useState<OshDependency[]>([]);
    const [analysisDate, setAnalysisDate] = useState("N/A");
    const [debugText, setDebugText] = useState("");
    const [activePrimaryTab, setActivePrimaryTab] = useState<PrimaryTabType>('security');
    const [activeMaintainabilityTab, setActiveMaintainabilityTab] = useState<MaintainabilitySubTabType>('duplication');

    // TODO: use something more secure than localStorage
    function getSigridSettings(): SigridSettings {
        const storedToken = localStorage.getItem('sigridToken');
        const storedCustomer = localStorage.getItem('sigridCustomer');
        const storedSystem = localStorage.getItem('sigridSystem');

        if (storedToken && storedCustomer && storedSystem) {
            return {
                token: storedToken,
                customer: storedCustomer.toLowerCase(),
                system: storedSystem.toLowerCase()
            };
        }

        throw new Error("No QSM/Sigrid Token configured");
    }

    const handleApiError = (error: any, context: string) => {
        const errorMessage = (error && error.message) ? error.message : String(error ?? "");

        if (errorMessage.includes("CORS") || errorMessage.includes("Failed to fetch") || errorMessage.includes("Load failed")) {
            setDebugText("CORS/Network error loading " + context + ". The browser blocked the request.");
            return;
        }

        setDebugText("Unable to load " + context + ". Please try again or contact your QSM/Sigrid administrator.");
    };

    const fetchSigridJson = async <T,>(context: string, buildPath: (settings: SigridSettings) => string): Promise<T | null> => {
        let settings: SigridSettings;

        try {
            settings = getSigridSettings();
        } catch (error) {
            setDebugText("No QSM/Sigrid token, customer and system configured. Add one in the configuration page first");
            return null;
        }

        const url = `${SIGRID_API_BASE}/${buildPath(settings)}`;

        try {
            const response = await fetch(url, {
                mode: 'cors',
                credentials: 'omit',
                headers: {
                    'Authorization': 'Bearer ' + settings.token
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            handleApiError(error, context);
            return null;
        }
    }

    const loadSecurityFindings = async() => {
        setDebugText("Loading security findings...");

        const data = await fetchSigridJson<any[]>("security findings", (settings) =>
            `security-findings/${settings.customer}/${settings.system}`
        );

        if (!data) {
            return;
        }

        if (!Array.isArray(data) || data.length === 0) {
            setCurrentFindingList([]);
            setAnalysisDate("N/A");
            setDebugText("No security findings found");
            return;
        }

        const findings = data.map((dataRow: any) => ({
            id: dataRow.id,
            name: dataRow.type,
            status: dataRow.status,
            date: new Date(dataRow.lastSeenSnapshotDate)
        } as SecurityFinding));

        setCurrentFindingList(findings);
        setDebugText("");
        setAnalysisDate(findings[0].date.toDateString());
    }

    const loadOpenSourceHealth = async() => {
        setDebugText("Loading open source health data...");

        const data = await fetchSigridJson<any>(
            "open source health findings",
            (settings) => `osh-findings/${settings.customer}/${settings.system}`
        );

        if (!data) {
            return;
        }

        const sbom = data?.sbom || data;
        const components = Array.isArray(sbom?.components) ? sbom.components : [];

        if (components.length === 0) {
            setOpenSourceHealthDependencies([]);
            setDebugText("No open source dependencies found for this system in QSM");
        } else {
            const dependencies = components.map((component: any) => {
                const propertyLookup: Record<string, string> = {};
                if (Array.isArray(component?.properties)) {
                    component.properties.forEach((prop: any) => {
                        if (prop?.name && typeof prop.name === "string" && typeof prop.value === "string") {
                            propertyLookup[prop.name] = prop.value;
                        }
                    });
                }

                return {
                    name: component?.name || 'Unnamed component',
                    version: component?.version || 'N/A',
                    vulnerabilityRisk: propertyLookup['sigrid:risk:vulnerability'] || 'N/A',
                    licenseRisk: propertyLookup['sigrid:risk:legal'] || 'N/A',
                    freshnessRisk: propertyLookup['sigrid:risk:freshness'] || 'N/A',
                    activityRisk: propertyLookup['sigrid:risk:activity'] || 'N/A'
                } as OshDependency;
            });

            setOpenSourceHealthDependencies(dependencies);
            setDebugText("Loaded " + dependencies.length + " open source dependencies");
        }
    }

    const handleLoadFindings = () => {
        if (activePrimaryTab === 'security') {
            loadSecurityFindings();
        } else if (activePrimaryTab === 'openSourceHealth') {
            loadOpenSourceHealth();
        }
        // TODO: load maintainability data
    }

    const primaryTabStyle = (tabName: PrimaryTabType) => ({
        padding: '12px 20px',
        cursor: 'pointer',
        border: 'none',
        borderBottom: activePrimaryTab === tabName ? '3px solid #0595DB' : '3px solid transparent',
        backgroundColor: 'transparent',
        fontWeight: activePrimaryTab === tabName ? '600' : 'normal',
        color: activePrimaryTab === tabName ? '#000' : '#666',
        transition: 'all 0.2s'
    });

    const subTabStyle = (tabName: MaintainabilitySubTabType) => ({
        padding: '10px 16px',
        cursor: 'pointer',
        border: 'none',
        borderBottom: activeMaintainabilityTab === tabName ? '2px solid #0595DB' : '2px solid transparent',
        backgroundColor: 'transparent',
        fontWeight: activeMaintainabilityTab === tabName ? '600' : 'normal',
        color: activeMaintainabilityTab === tabName ? '#000' : '#666',
        fontSize: '14px',
        transition: 'all 0.2s',
        whiteSpace: 'nowrap' as const
    });

    const getPrimaryTabLabel = (tab: PrimaryTabType): string => {
        const labels: Record<PrimaryTabType, string> = {
            'maintainability': 'Maintainability',
            'security': 'Security',
            'openSourceHealth': 'OSH'
        };
        
        return labels[tab];
    };

    const getMaintainabilityTabLabel = (tab: MaintainabilitySubTabType): string => {
        const labels: Record<MaintainabilitySubTabType, string> = {
            'duplication': 'Duplication',
            'unitSize': 'Unit size',
            'unitComplexity': 'Unit complexity',
            'unitInterfacing': 'Unit interfacing',
            'moduleCoupling': 'Module coupling',
            'componentIndependence': 'Component independence',
            'componentEntanglement': 'Component entanglement'
        };
        return labels[tab];
    };
    
    const rows = currentFindingList.map(finding =>
        <FindingRow 
            key={finding.id}
            id={finding.id}
            name={finding.name}
            status={finding.status}/>);

    const openSourceHealthRows = openSourceHealthDependencies.map((dependency, index) =>
        <tr key={index}>
            <td>{dependency.name}</td>
            <td>{dependency.version}</td>
            <td>{dependency.vulnerabilityRisk}</td>
            <td>{dependency.licenseRisk}</td>
            <td>{dependency.freshnessRisk}</td>
            <td>{dependency.activityRisk}</td>
        </tr>
    );

    const primaryTabs: PrimaryTabType[] = ['maintainability', 'security', 'openSourceHealth'];
    const maintainabilityTabs: MaintainabilitySubTabType[] = ['duplication', 'unitSize', 'unitComplexity', 'unitInterfacing', 'moduleCoupling', 'componentIndependence', 'componentEntanglement'];

    return (
        <div>
            <div style={{display: 'flex', borderBottom: '2px solid #E0E0E0', marginBottom: '0'}}>
                {primaryTabs.map(tab => (
                    <div 
                        key={tab}
                        style={primaryTabStyle(tab)}
                        onClick={() => setActivePrimaryTab(tab)}
                    >
                        {getPrimaryTabLabel(tab)}
                    </div>
                ))}
            </div>
            
            {activePrimaryTab === 'maintainability' && (
                <div style={{
                    display: 'flex', 
                    alignItems: 'center',
                    borderBottom: '1px solid #E0E0E0', 
                    marginBottom: '10px', 
                    backgroundColor: '#F5F5F5', 
                    padding: '0',
                    overflowX: 'auto' as const
                }}>
                    <div style={{
                        padding: '10px 8px',
                        cursor: 'pointer',
                        color: '#666',
                        fontSize: '18px',
                        userSelect: 'none' as const
                    }}>
                        ‹
                    </div>
                    {maintainabilityTabs.map(tab => (
                        <div 
                            key={tab}
                            style={subTabStyle(tab)}
                            onClick={() => setActiveMaintainabilityTab(tab)}
                        >
                            {getMaintainabilityTabLabel(tab)}
                        </div>
                    ))}
                    <div style={{
                        padding: '10px 8px',
                        cursor: 'pointer',
                        color: '#666',
                        fontSize: '18px',
                        userSelect: 'none' as const
                    }}>
                        ›
                    </div>
                </div>
            )}
            
            <div>Analysis date: <span>{analysisDate}</span></div>
            {activePrimaryTab === 'security' ? (
                <table id="sigridFindings" style={{border: "1px solid rgb(0, 0, 0)"}}>
                    <thead>
                        <tr><th>ID</th><th>Type</th><th>Finding</th></tr>
                    </thead>
                    <tbody>
                        {rows}
                    </tbody>
                </table>
            ) : activePrimaryTab === 'openSourceHealth' ? (
                <table id="openSourceHealth" style={{border: "1px solid rgb(0, 0, 0)"}}>
                    <thead>
                        <tr><th>Dependency</th><th>Version</th><th>Vulnerability Risk</th><th>License Risk</th><th>Freshness Risk</th><th>Activity Risk</th></tr>
                    </thead>
                    <tbody>
                        {openSourceHealthRows}
                    </tbody>
                </table>
            ) : (
                <div style={{padding: '20px', color: '#666'}}>
                    <p>Maintainability data for {getMaintainabilityTabLabel(activeMaintainabilityTab)}</p>
                </div>
            )}
            <button onClick={handleLoadFindings}>Load/refresh findings</button>
            <span>{debugText}</span>
        </div>
    );
}

const FindingRow: FC<findingProps> = ({id, name, status}) => {
    return (
        <tr><td>{id}</td><td>{name}</td><td>{status}</td></tr>
    );
}

export const component: IComponent = {
    async loaded(componentContext) {
        createRoot(document.getElementById("root")!).render(
            <StrictMode>
                <h1>QSM Findings</h1>
                <p>View QSM's Security findings and Open Source Health dependencies for your system</p>
                <SigridFindings/>
            </StrictMode>
        );
    }
}

import React, {StrictMode, useEffect, useState} from "react";
import {createRoot} from "react-dom/client";
import {IComponent} from "@mendix/extensions-api";
import {useSigridStore} from "../../store/sigridStore";
import {ensureGlobalStyles} from "./styles";
import {PrimaryTabs} from "./components/PrimaryTabs";
import {SecurityTable} from "./components/SecurityTable";
import {OpenSourceHealthTable} from "./components/OpenSourceHealthTable";
import {PRIMARY_TABS, type PrimaryTabType} from "./tabConfig";
import {MaintainabilityTable} from "./components/MaintainabilityTable";

const STORAGE_KEYS = new Set([
    'sigridToken',
    'sigridCustomer',
    'sigridSystem',
    'sigridSecurityFindings',
    'sigridOshDependencies',
    'sigridRefactoringCandidates',
    'sigridAnalysisDate'
]);

export function SigridFindings() {
    const [activePrimaryTab, setActivePrimaryTab] = useState<PrimaryTabType>('security');

    useEffect(() => {
        ensureGlobalStyles();
    }, []);

    
    // TODO: here it's better to do something like const {securityFindings, oshDependencies, refactoringCandidates, analysisDate, isLoading, error, settings, loadSettingsFromStorage, loadAllData} = useSigridStore();
    // Get data and actions from Zustand store
    const securityFindings = useSigridStore((state) => state.securityFindings);
    const oshDependencies = useSigridStore((state) => state.oshDependencies);
    const refactoringCandidates = useSigridStore((state) => state.refactoringCandidates);
    const analysisDate = useSigridStore((state) => state.analysisDate);
    const isLoading = useSigridStore((state) => state.isLoading);
    const error = useSigridStore((state) => state.error);
    const settings = useSigridStore((state) => state.settings);
    const loadSettingsFromStorage = useSigridStore((state) => state.loadSettingsFromStorage);
    const loadAllData = useSigridStore((state) => state.loadAllData);

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
            <PrimaryTabs
                activeTab={activePrimaryTab}
                onSelect={setActivePrimaryTab}
                tabs={PRIMARY_TABS}
            />

            <div className="analysis-date">Analysis date: <span>{analysisDate}</span></div>
            {isLoading && <div className="status-message">Loading data...</div>}
            {error && <div className="status-message error">{error}</div>}

            <button
                className="reload-button"
                onClick={() => loadAllData({ requireSettings: true })}
                disabled={isLoading}
            >
                {isLoading ? 'Loading...' : 'Reload data'}
            </button>
            
            {!isLoading && !error && (
                <>
                    {activePrimaryTab === 'security' && (
                        <SecurityTable findings={securityFindings} />
                    )}
                    
                    {activePrimaryTab === 'openSourceHealth' && (
                        <OpenSourceHealthTable dependencies={oshDependencies} />
                    )}
                    
                    {activePrimaryTab === 'maintainability' && (
                        <MaintainabilityTable refactoringCandidates={refactoringCandidates} />
                    )}
                </>
            )}
        </div>
    );
}

export const component: IComponent = {
    async loaded(componentContext) {
        createRoot(document.getElementById("root")!).render(
            <StrictMode>
                <SigridFindings/>
            </StrictMode>
        );
    }
}

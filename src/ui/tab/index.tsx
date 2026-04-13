import React, { StrictMode, useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { IComponent, getStudioProApi } from "@mendix/extensions-api";
import { useSigridStore } from "../../store/sigridStore";
import { ensureGlobalStyles } from "../dockablepane/styles";
import { SettingsTab } from "./SettingsTab";
import { readSettingsFromFile, writeSettingsToFile } from "../../store/fileSettingsStorage";

type SigridSettingsProps = {
    studioPro: ReturnType<typeof getStudioProApi>;
};

export function SigridSettings({ studioPro }: SigridSettingsProps) {
    const [sigridToken, setSigridToken] = useState("");
    const [sigridCustomer, setSigridCustomer] = useState("");
    const [sigridSystem, setSigridSystem] = useState("");
    const [sigridUrl, setSigridUrl] = useState("");
    const [statusText, setStatusText] = useState("");

    const setSettings = useSigridStore((state) => state.setSettings);
    const loadAllData = useSigridStore((state) => state.loadAllData);

    const saveSettings = async() => {
        if (!sigridToken.trim() || !sigridCustomer.trim() || !sigridSystem.trim()) {
            setStatusText("Error: All fields are required!");
            return;
        }

        const normalizedSettings = {
            token: sigridToken.trim(),
            customer: sigridCustomer.trim().toLowerCase(),
            system: sigridSystem.trim().toLowerCase(),
            sigridUrl: sigridUrl.trim() || undefined,
        };

        setSettings(normalizedSettings);
        setStatusText("Settings saved! Loading data from QSM...");

        try {
            await writeSettingsToFile(studioPro, normalizedSettings);
            await loadAllData({ requireSettings: true, settingsOverride: normalizedSettings });

            const latestError = useSigridStore.getState().error;
            setStatusText(latestError
                ? "Error: Please confirm you have entered the correct details and try again."
                : "Settings saved and data loaded successfully!"
            );
        } catch (error: any) {
            setStatusText("Error: Please confirm you have entered the correct details and try again.");
        }
    };

    const loadSettings = async() => {
        const fileSettings = await readSettingsFromFile(studioPro);
        if (!fileSettings) { setStatusText("No settings found"); return; }
        setSigridToken(fileSettings.token);
        setSigridCustomer(fileSettings.customer);
        setSigridSystem(fileSettings.system);
        setSigridUrl(fileSettings.sigridUrl ?? "");
        setStatusText("Settings loaded");
    };

    const handleTokenChange = (e: React.ChangeEvent<HTMLInputElement>) => setSigridToken(e.target.value);
    const handleCustomerChange = (e: React.ChangeEvent<HTMLInputElement>) => setSigridCustomer(e.target.value);
    const handleSystemChange = (e: React.ChangeEvent<HTMLInputElement>) => setSigridSystem(e.target.value);
    const handleSigridUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => setSigridUrl(e.target.value);

    useEffect(() => {
        ensureGlobalStyles();
    }, []);

    useEffect(() => {
        void loadSettings();
    }, []);

    return (
        <SettingsTab
            customer={sigridCustomer}
            onCustomerChange={handleCustomerChange}
            onLoad={loadSettings}
            onSave={saveSettings}
            onSigridUrlChange={handleSigridUrlChange}
            onSystemChange={handleSystemChange}
            onTokenChange={handleTokenChange}
            sigridUrl={sigridUrl}
            statusText={statusText}
            system={sigridSystem}
            token={sigridToken}
        />
    );
}

export const component: IComponent = {
    async loaded(componentContext) {
        const studioPro = getStudioProApi(componentContext);
        createRoot(document.getElementById("root")!).render(
            <StrictMode>
                <SigridSettings studioPro={studioPro} />
            </StrictMode>
        );
    }
}

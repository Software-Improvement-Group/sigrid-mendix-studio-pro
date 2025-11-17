import React, { StrictMode, useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { IComponent } from "@mendix/extensions-api";
import { useSigridStore } from "../../store/sigridStore";
import { ensureGlobalStyles } from "../dockablepane/styles";
import { SettingsTab } from "./SettingsTab";

export function SigridSettings() {
    const [sigridToken, setSigridToken] = useState("");
    const [sigridCustomer, setSigridCustomer] = useState("");
    // TODO: We should get System name from Mendix Studio Pro context, so users who work on multiple systems
    // can do so without changing config settings all the time
    const [sigridSystem, setSigridSystem] = useState("");
    const [statusText, setStatusText] = useState("");
    
    const setSettings = useSigridStore((state) => state.setSettings);
    const loadAllData = useSigridStore((state) => state.loadAllData);

    // TODO: maybe use css modules or other css method (vanilla extract) for less overhead 
    const saveSettings = async() => {
        if (!sigridToken.trim() || !sigridCustomer.trim() || !sigridSystem.trim()) {
            setStatusText("Error: All fields are required!");
            return;
        }

        const normalizedSettings = {
            token: sigridToken.trim(),
            customer: sigridCustomer.trim().toLowerCase(),
            system: sigridSystem.trim().toLowerCase()
        };

        // Save to Zustand store
        setSettings(normalizedSettings);
        
    setStatusText("Settings saved! Loading data from QSM...");
        
        try {
            // Load all data from the API
            await loadAllData({ requireSettings: true, settingsOverride: normalizedSettings });

            const latestError = useSigridStore.getState().error;
            if (latestError) {
                setStatusText("Settings saved but failed to load data: " + latestError);
            } else {
                setStatusText("Settings saved and data loaded successfully!");
            }
        } catch (error: any) {
            setStatusText("Settings saved but failed to load data: " + (error?.message || "Unknown error"));
        }
    }

    const loadSettings = async() => {
        var storedToken = localStorage.getItem('sigridToken');
        if(storedToken) {
            setSigridToken(storedToken);
            setStatusText("Settings loaded");
        }
        else {
            setStatusText("No token found, not loaded");
        }

        var storedCustomer = localStorage.getItem('sigridCustomer');
        if(storedCustomer) {
            setSigridCustomer(storedCustomer);
        }

        var storedSystem = localStorage.getItem('sigridSystem');
        if(storedSystem) {
            setSigridSystem(storedSystem);
        }
    }

    // TODO: There's probably a more efficient way to do this than to
    // handle state changes and storage for each configuration option individually
    // I'm sure the nr. of options will increase in the future, so better fix this
    // sooner than later.
    const handleTokenChange = async(e: React.ChangeEvent<HTMLInputElement>) => {
        setSigridToken(e.target.value);
    }

    const handleCustomerChange = async(e: React.ChangeEvent<HTMLInputElement>) => {
        setSigridCustomer(e.target.value);
    }

    const handleSystemChange = async(e: React.ChangeEvent<HTMLInputElement>) => {
        setSigridSystem(e.target.value);
    }

    useEffect(() => {
        ensureGlobalStyles();
    }, []);

    useEffect(() =>{
        loadSettings();
    }, [])

    return (
        <SettingsTab
            customer={sigridCustomer}
            onCustomerChange={handleCustomerChange}
            onLoad={loadSettings}
            onSave={saveSettings}
            onSystemChange={handleSystemChange}
            onTokenChange={handleTokenChange}
            statusText={statusText}
            system={sigridSystem}
            token={sigridToken}
    />
    );
}

export const component: IComponent = {
    async loaded(componentContext) {
        createRoot(document.getElementById("root")!).render(
            <StrictMode>
                <h1>QSM Settings</h1>
                <p>Required configuration to connect Mendix Studio Pro to QSM</p>

                <SigridSettings />
            </StrictMode>
        );
    }
}

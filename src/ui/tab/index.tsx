import React, { StrictMode, useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { IComponent } from "@mendix/extensions-api";

export function SigridSettings() {
    const [sigridToken, setSigridToken] = useState("");
    const [sigridCustomer, setSigridCustomer] = useState("");
    // TODO: We should get System name from Mendix Studio Pro context, so users who work on multiple systems
    // can do so without changing config settings all the time
    const [sigridSystem, setSigridSystem] = useState("");
    const [statusText, setStatusText] = useState("");
    
    const saveSettings = async() => {
        localStorage.setItem('sigridToken', sigridToken);
        localStorage.setItem('sigridCustomer', sigridCustomer);
        localStorage.setItem('sigridSystem', sigridSystem);
        setStatusText("Settings saved!");
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

    useEffect(() =>{ // This is executed once, on load
        loadSettings();
    }, [])

    return (
        <div>
            Token: <input type="password" id="sigridTokenInput" value={sigridToken} onChange={handleTokenChange}/><br />
            Customer name (as defined in QSM): <input type="text" id="sigridCustomerInput" value={sigridCustomer} onChange={handleCustomerChange}/><br />
            System name (as defined in QSM): <input type="text" id="sigridSystemInput" value={sigridSystem} onChange={handleSystemChange}/><br />
            
            <input type="button" onClick={saveSettings} value="Save settings" />
            <input type="button" onClick={loadSettings} value="Retrieve/reset stored settings" />
            <br />
            <br />
            <span>{statusText}</span>
        </div>
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

import React from "react";

export type SettingsTabProps = {
    token: string;
    customer: string;
    system: string;
    sigridUrl: string;
    statusText: string;
    onTokenChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onCustomerChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onSystemChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onSigridUrlChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onSave: () => void;
    onLoad: () => void;
};

export const SettingsTab: React.FC<SettingsTabProps> = ({
    token,
    customer,
    system,
    sigridUrl,
    statusText,
    onTokenChange,
    onCustomerChange,
    onSystemChange,
    onSigridUrlChange,
    onSave,
    onLoad
}) => {
    const statusTone = statusText.trim().toLowerCase();
    let statusVariant = "neutral";

    if (statusTone.includes("error")) {
        statusVariant = "error";
    } else if (statusTone.includes("success") || statusTone.includes("saved")) {
        statusVariant = "success";
    }

    const statusClassName = `settings-status ${statusVariant}`;

    return (
        <div className="settings-page">
        <div className="settings-page-header">
            <h1 className="settings-page-title">QSM Settings</h1>
            <p className="settings-page-subtitle">Required configuration to connect Mendix Studio Pro to QSM</p>
        </div>
        <div className="settings-container">
            <div className="settings-field">
                <label htmlFor="sigridCustomerInput" className="settings-label">Customer</label>
                <input
                    id="sigridCustomerInput"
                    type="text"
                    value={customer}
                    onChange={onCustomerChange}
                    className="settings-input"
                    placeholder="Company or organization in QSM"
                />
            </div>

            <div className="settings-field">
                <label htmlFor="sigridSystemInput" className="settings-label">System</label>
                <input
                    id="sigridSystemInput"
                    type="text"
                    value={system}
                    onChange={onSystemChange}
                    className="settings-input"
                    placeholder="System identifier in QSM"
                />
            </div>

            <div className="settings-field">
                <label htmlFor="sigridTokenInput" className="settings-label">API token</label>
                <p className="settings-description">Information on how to generate a Sigrid API token can be found {" "}
                    <a href="https://docs.sigrid-says.com/organization-integration/authentication-tokens.html" target="_blank" rel="noreferrer" className="settings-link">here.</a>
                </p>
                <input
                    id="sigridTokenInput"
                    type="password"
                    value={token}
                    onChange={onTokenChange}
                    className="settings-input"
                    placeholder="Enter your Sigrid token"
                />
            </div>

            <div className="settings-field">
                <label htmlFor="sigridUrlInput" className="settings-label">
                    Sigrid URL <span className="settings-label-badge">optional</span>
                </label>
                <p className="settings-description">The URL of your QSM instance. Only change this if you are using a self-hosted version.</p>
                <input
                    id="sigridUrlInput"
                    type="text"
                    value={sigridUrl}
                    onChange={onSigridUrlChange}
                    className="settings-input"
                    placeholder="https://sigrid-says.com"
                />
            </div>

            <div className="settings-button-row">
                <button type="button" onClick={onSave} className="settings-button primary">
                    Save settings
                </button>
                <button type="button" onClick={onLoad} className="settings-button secondary">
                    Retrieve stored settings
                </button>
            </div>

            <div className={statusClassName}>
                {statusText}
            </div>
        </div>
        </div>
    );
};

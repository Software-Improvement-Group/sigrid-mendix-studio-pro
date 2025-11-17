import React from "react";

export type SettingsTabProps = {
    token: string;
    customer: string;
    system: string;
    statusText: string;
    onTokenChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onCustomerChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onSystemChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onSave: () => void;
    onLoad: () => void;
};

export const SettingsTab: React.FC<SettingsTabProps> = ({
    token,
    customer,
    system,
    statusText,
    onTokenChange,
    onCustomerChange,
    onSystemChange,
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
        <div className="settings-container">
            <div className="settings-field">
                <label htmlFor="sigridCustomerInput" className="settings-label">Customer name</label>
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
                <label htmlFor="sigridSystemInput" className="settings-label">System name</label>
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
                <label htmlFor="sigridTokenInput" className="settings-label">QSM API token</label>
                <input
                    id="sigridTokenInput"
                    type="password"
                    value={token}
                    onChange={onTokenChange}
                    className="settings-input"
                    placeholder="Enter your QSM token"
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
    );
};

import React from "react";
import {
    settingsButtonRowStyle,
    settingsContainerStyle,
    settingsFieldStyle,
    settingsInputStyle,
    settingsLabelStyle,
    settingsPrimaryButtonStyle,
    settingsSecondaryButtonStyle,
    settingsStatusStyle
} from "../dockablepane/styles";

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
    const statusColor = statusTone.includes("error")
        ? "#b3261e"
        : statusTone.includes("success") || statusTone.includes("saved")
            ? "#156ff4"
            : "#272727";

    return (
        <div style={settingsContainerStyle}>
            <div style={settingsFieldStyle}>
                <label htmlFor="sigridCustomerInput" style={settingsLabelStyle}>Customer name</label>
                <input
                    id="sigridCustomerInput"
                    type="text"
                    value={customer}
                    onChange={onCustomerChange}
                    style={settingsInputStyle}
                    placeholder="Company or organization in QSM"
                />
            </div>

            <div style={settingsFieldStyle}>
                <label htmlFor="sigridSystemInput" style={settingsLabelStyle}>System name</label>
                <input
                    id="sigridSystemInput"
                    type="text"
                    value={system}
                    onChange={onSystemChange}
                    style={settingsInputStyle}
                    placeholder="System identifier in QSM"
                />
            </div>

            <div style={settingsFieldStyle}>
                <label htmlFor="sigridTokenInput" style={settingsLabelStyle}>QSM API token</label>
                <input
                    id="sigridTokenInput"
                    type="password"
                    value={token}
                    onChange={onTokenChange}
                    style={settingsInputStyle}
                    placeholder="Enter your QSM token"
                />
            </div>

            <div style={settingsButtonRowStyle}>
                <button type="button" onClick={onSave} style={settingsPrimaryButtonStyle}>
                    Save settings
                </button>
                <button type="button" onClick={onLoad} style={settingsSecondaryButtonStyle}>
                    Retrieve stored settings
                </button>
            </div>

            <div style={{ ...settingsStatusStyle, color: statusColor }}>
                {statusText}
            </div>
        </div>
    );
};

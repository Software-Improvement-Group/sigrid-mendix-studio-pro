import type { CSSProperties } from "react";
import type { MaintainabilitySubTabType, PrimaryTabType } from "./tabConfig";

const GLOBAL_STYLE_ELEMENT_ID = "sigrid-global-styles";
const GLOBAL_FONT_STACK = "'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif";
const GLOBAL_STYLE_CONTENT = `@import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap');
body, * { font-family: ${GLOBAL_FONT_STACK}; color: #272727; }
`;

export const ensureGlobalStyles = (): void => {
    if (typeof document === "undefined") {
        return;
    }

    if (document.getElementById(GLOBAL_STYLE_ELEMENT_ID)) {
        return;
    }

    const style = document.createElement("style");
    style.id = GLOBAL_STYLE_ELEMENT_ID;
    style.textContent = GLOBAL_STYLE_CONTENT;
    document.head.appendChild(style);
};

export const primaryTabsContainerStyle: CSSProperties = {
    display: "flex",
    borderBottom: "2px solid #E0E0E0",
    marginBottom: "0"
};

export const primaryTabStyle = (
    tabName: PrimaryTabType,
    activePrimaryTab: PrimaryTabType
): CSSProperties => ({
    padding: "12px 20px",
    cursor: "pointer",
    border: "none",
    borderBottom: activePrimaryTab === tabName ? "3px solid #156ff4" : "3px solid transparent",
    backgroundColor: "transparent",
    fontWeight: activePrimaryTab === tabName ? "600" : "normal",
    color: activePrimaryTab === tabName ? "#272727" : "#666",
    transition: "all 0.2s"
});

export const maintainabilityTabsContainerStyle: CSSProperties = {
    display: "flex",
    alignItems: "center",
    borderBottom: "1px solid #E0E0E0",
    marginBottom: "10px",
    backgroundColor: "#F5F5F5",
    padding: "0",
    overflowX: "auto"
};

export const maintainabilityArrowStyle: CSSProperties = {
    padding: "10px 8px",
    cursor: "pointer",
    color: "#666",
    fontSize: "18px",
    userSelect: "none"
};

export const maintainabilityTabStyle = (
    tabName: MaintainabilitySubTabType,
    activeMaintainabilityTab: MaintainabilitySubTabType
): CSSProperties => ({
    padding: "10px 16px",
    cursor: "pointer",
    border: "none",
    borderBottom: activeMaintainabilityTab === tabName ? "2px solid #156ff4" : "2px solid transparent",
    backgroundColor: "transparent",
    fontWeight: activeMaintainabilityTab === tabName ? "600" : "normal",
    color: activeMaintainabilityTab === tabName ? "#272727" : "#666",
    fontSize: "14px",
    transition: "all 0.2s",
    whiteSpace: "nowrap"
});

export const tableStyle: CSSProperties = {
    border: "1px solid rgb(0, 0, 0)"
};

export const settingsContainerStyle: CSSProperties = {
    width: "100%",
    maxWidth: "520px",
    padding: "20px",
    borderRadius: "10px",
    backgroundColor: "#FFFFFF",
    display: "flex",
    flexDirection: "column",
    gap: "16px"
};

export const settingsFieldStyle: CSSProperties = {
    display: "flex",
    flexDirection: "column",
    gap: "8px"
};

export const settingsLabelStyle: CSSProperties = {
    fontSize: "14px",
    fontWeight: 500,
    color: "#272727"
};

export const settingsInputStyle: CSSProperties = {
    padding: "8px 12px",
    borderRadius: "6px",
    border: "1px solid #C1C7D0",
    fontSize: "13px",
    backgroundColor: "#FFFFFF",
    color: "#272727",
    boxShadow: "none"
};

export const settingsButtonRowStyle: CSSProperties = {
    display: "flex",
    gap: "12px",
    flexWrap: "wrap"
};

export const settingsPrimaryButtonStyle: CSSProperties = {
    padding: "8px 16px",
    borderRadius: "6px",
    border: "none",
    backgroundColor: "#156ff4",
    color: "#FFFFFF",
    fontWeight: 600,
    fontSize: "13px",
    cursor: "pointer",
    boxShadow: "none",
    transition: "background-color 0.15s ease"
};

export const settingsSecondaryButtonStyle: CSSProperties = {
    padding: "8px 16px",
    borderRadius: "6px",
    border: "1px solid #C1C7D0",
    backgroundColor: "#FFFFFF",
    color: "#272727",
    fontWeight: 400,
    fontSize: "13px",
    cursor: "pointer",
    transition: "background-color 0.15s ease"
};

export const settingsStatusStyle: CSSProperties = {
    minHeight: "20px",
    fontSize: "13px",
    fontWeight: 400
};

import styles from "./styles.css";

const GLOBAL_STYLE_ELEMENT_ID = "sigrid-global-styles";

export const ensureGlobalStyles = (): void => {
    if (typeof document === "undefined") {
        return;
    }

    if (document.getElementById(GLOBAL_STYLE_ELEMENT_ID)) {
        return;
    }

    const styleElement = document.createElement("style");
    styleElement.id = GLOBAL_STYLE_ELEMENT_ID;
    styleElement.textContent = styles;
    document.head.appendChild(styleElement);
};

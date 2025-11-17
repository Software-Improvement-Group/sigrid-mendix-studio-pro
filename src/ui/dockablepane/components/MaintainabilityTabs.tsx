import React from "react";
import { getMaintainabilityTabLabel, type MaintainabilitySubTabType } from "../tabConfig";

type MaintainabilityTabsProps = {
    activeTab: MaintainabilitySubTabType;
    onSelect: (tab: MaintainabilitySubTabType) => void;
    tabs: MaintainabilitySubTabType[];
};

export const MaintainabilityTabs: React.FC<MaintainabilityTabsProps> = ({ activeTab, onSelect, tabs }) => (
    <div className="maintainability-tabs">
        <div className="maintainability-arrow">‹</div>
        {tabs.map((tab) => (
            <button
                key={tab}
                type="button"
                className={`maintainability-tab${tab === activeTab ? " active" : ""}`}
                onClick={() => onSelect(tab)}
            >
                {getMaintainabilityTabLabel(tab)}
            </button>
        ))}
        <div className="maintainability-arrow">›</div>
    </div>
);

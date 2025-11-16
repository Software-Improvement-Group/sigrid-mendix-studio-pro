import React from "react";
import { getMaintainabilityTabLabel, type MaintainabilitySubTabType } from "../tabConfig";
import {
    maintainabilityArrowStyle,
    maintainabilityTabStyle,
    maintainabilityTabsContainerStyle
} from "../styles";

type MaintainabilityTabsProps = {
    activeTab: MaintainabilitySubTabType;
    onSelect: (tab: MaintainabilitySubTabType) => void;
    tabs: MaintainabilitySubTabType[];
};

export const MaintainabilityTabs: React.FC<MaintainabilityTabsProps> = ({ activeTab, onSelect, tabs }) => (
    <div style={maintainabilityTabsContainerStyle}>
        <div style={maintainabilityArrowStyle}>‹</div>
        {tabs.map((tab) => (
            <div
                key={tab}
                style={maintainabilityTabStyle(tab, activeTab)}
                onClick={() => onSelect(tab)}
            >
                {getMaintainabilityTabLabel(tab)}
            </div>
        ))}
        <div style={maintainabilityArrowStyle}>›</div>
    </div>
);

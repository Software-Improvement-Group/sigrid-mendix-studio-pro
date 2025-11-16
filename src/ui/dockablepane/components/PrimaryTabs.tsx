import React from "react";
import { getPrimaryTabLabel, type PrimaryTabType } from "../tabConfig";
import { primaryTabsContainerStyle, primaryTabStyle } from "../styles";

type PrimaryTabsProps = {
    activeTab: PrimaryTabType;
    onSelect: (tab: PrimaryTabType) => void;
    tabs: PrimaryTabType[];
};

export const PrimaryTabs: React.FC<PrimaryTabsProps> = ({ activeTab, onSelect, tabs }) => (
    <div style={primaryTabsContainerStyle}>
        {tabs.map((tab) => (
            <div
                key={tab}
                style={primaryTabStyle(tab, activeTab)}
                onClick={() => onSelect(tab)}
            >
                {getPrimaryTabLabel(tab)}
            </div>
        ))}
    </div>
);

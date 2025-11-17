import React from "react";
import { getPrimaryTabLabel, type PrimaryTabType } from "../tabConfig";

type PrimaryTabsProps = {
    activeTab: PrimaryTabType;
    onSelect: (tab: PrimaryTabType) => void;
    tabs: PrimaryTabType[];
};

export const PrimaryTabs: React.FC<PrimaryTabsProps> = ({ activeTab, onSelect, tabs }) => (
    <div className="primary-tabs">
        {tabs.map((tab) => (
            <button
                key={tab}
                type="button"
                className={`primary-tab${tab === activeTab ? " active" : ""}`}
                onClick={() => onSelect(tab)}
            >
                {getPrimaryTabLabel(tab)}
            </button>
        ))}
    </div>
);

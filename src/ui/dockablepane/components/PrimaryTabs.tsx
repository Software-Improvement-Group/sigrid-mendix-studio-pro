import React from "react";
import { getPrimaryTabLabel, type PrimaryTabType } from "../tabConfig";

type PrimaryTabsProps = {
    activeTab: PrimaryTabType;
    onSelect: (tab: PrimaryTabType) => void;
    tabs: PrimaryTabType[];
    counts?: Partial<Record<PrimaryTabType, number>>;
};

const compactNumberFormatter = Intl.NumberFormat("en", {
    notation: "compact",
    compactDisplay: "short"
});

const formatCount = (value: number): string => compactNumberFormatter.format(value);

export const PrimaryTabs: React.FC<PrimaryTabsProps> = ({ activeTab, onSelect, tabs, counts }) => (
    <div className="primary-tabs">
        {tabs.map((tab) => {
            const count = counts?.[tab];
            return (
                <button
                    key={tab}
                    type="button"
                    className={`primary-tab${tab === activeTab ? " active" : ""}`}
                    onClick={() => onSelect(tab)}
                >
                    {getPrimaryTabLabel(tab)}
                    {typeof count === "number" ? ` (${formatCount(count)})` : null}
                </button>
            );
        })}
    </div>
);

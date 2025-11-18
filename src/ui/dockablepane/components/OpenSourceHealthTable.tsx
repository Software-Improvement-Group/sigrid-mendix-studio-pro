import React from "react";
import type {OshDependency} from "../../../store/sigridStore";
import {getRiskSymbol, SEVERITY_SYMBOLS} from "./SecurityTable";

type OpenSourceHealthTableProps = {
    dependencies: OshDependency[];
};

const sortDependencies = (dependencies: OshDependency[]) => {
    const severityNames: string[] = Object.keys(SEVERITY_SYMBOLS);

    const sorted: OshDependency[] = dependencies.slice();
    sorted.sort((a, b) => severityNames.indexOf(a.risk || "") - severityNames.indexOf(b.risk || ""));
    return sorted;
};

const formatTransitive = (value: string | undefined) => {
    if (value === "DIRECT") {
        return "Direct";
    } else if (value === "TRANSITIVE") {
        return "Transitive";
    } else {
        return "Unknown";
    }
};


export const OpenSourceHealthTable: React.FC<OpenSourceHealthTableProps> = ({ dependencies }) => (
    <table id="openSourceHealth" className="sigrid-table">
        <thead>
            <tr>
                <th>Risk</th>
                <th>Library</th>
                <th>Version</th>
                <th>Direct/Transitive</th>
                <th>License</th>
                <th>Vulnerabilities</th>
                <th>Freshness</th>
                <th>Activity</th>
            </tr>
        </thead>
        <tbody>
            {dependencies.length > 0 ? (
                sortDependencies(dependencies).map((dependency, index) => (
                    <tr key={`${dependency.name}-${index}`}>
                        <td>{getRiskSymbol(dependency.risk)}</td>
                        <td>{dependency.name}</td>
                        <td>{dependency.version}</td>
                        <td>{formatTransitive(dependency.dependencyType)}</td>
                        <td>{getRiskSymbol(dependency.vulnerabilityRisk)}</td>
                        <td>{getRiskSymbol(dependency.licenseRisk)}</td>
                        <td>{getRiskSymbol(dependency.freshnessRisk)}</td>
                        <td>{getRiskSymbol(dependency.activityRisk)}</td>
                    </tr>
                ))
            ) : (
                <tr><td colSpan={14}>No open source dependencies found</td></tr>
            )}
        </tbody>
    </table>
);

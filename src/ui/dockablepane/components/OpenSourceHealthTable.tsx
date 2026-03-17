import React from "react";
import type {OshDependency} from "../../../store/sigridStore";
import {getSecurityRiskSymbol, SEVERITY_SYMBOLS} from "../utils/pathUtils";

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
                <th></th>
            </tr>
        </thead>
        <tbody>
            {dependencies.length > 0 ? (
                sortDependencies(dependencies).map((dependency, index) => (
                    <tr key={`${dependency.name}-${index}`}>
                        <td>{getSecurityRiskSymbol(dependency.risk)}</td>
                        <td>{dependency.name}</td>
                        <td>{dependency.version}</td>
                        <td>{formatTransitive(dependency.dependencyType)}</td>
                        <td>{getSecurityRiskSymbol(dependency.vulnerabilityRisk)}</td>
                        <td>{getSecurityRiskSymbol(dependency.licenseRisk)}</td>
                        <td>{getSecurityRiskSymbol(dependency.freshnessRisk)}</td>
                        <td>{getSecurityRiskSymbol(dependency.activityRisk)}</td>
                        <td></td>
                    </tr>
                ))
            ) : (
                <tr><td colSpan={9}>No open source dependencies found</td></tr>
            )}
        </tbody>
    </table>
);

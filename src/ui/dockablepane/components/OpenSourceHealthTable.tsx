import React from "react";
import type { OshDependency } from "../../../store/sigridStore";

type OpenSourceHealthTableProps = {
    dependencies: OshDependency[];
};

const formatLicense = (licenses: OshDependency["licenses"]): string => {
    if (licenses.length === 0) {
        return "Unknown";
    }
    return licenses
        .map((license) => license.name ?? license.id ?? "Unknown")
        .filter((value, index, array) => array.indexOf(value) === index)
        .join(", ");
};

export const OpenSourceHealthTable: React.FC<OpenSourceHealthTableProps> = ({ dependencies }) => (
    <table id="openSourceHealth" className="sigrid-table">
        <thead>
            <tr>
                <th>Type</th>
                <th>Name</th>
                <th>Dependency Type</th>
                <th>Version</th>
                <th>Library Freshness</th>
                <th>Status</th>
                <th>License</th>
                <th>Overall Risk</th>
                <th>Vulnerability Risk</th>
                <th>License Risk</th>
                <th>Freshness Risk</th>
                <th>Activity Risk</th>
                <th>Stability Risk</th>
                <th>Management Risk</th>
            </tr>
        </thead>
        <tbody>
            {dependencies.length > 0 ? (
                dependencies.map((dependency, index) => (
                    <tr key={`${dependency.name}-${index}`}>
                        <td>{dependency.type ?? "N/A"}</td>
                        <td>{dependency.name}</td>
                        <td>{dependency.dependencyType ?? "Unknown"}</td>
                        <td>{dependency.version}</td>
                        <td>{dependency.libraryFreshness ?? dependency.freshnessRisk}</td>
                        <td>{dependency.status ?? "Unknown"}</td>
                        <td>{formatLicense(dependency.licenses)}</td>
                        <td>{dependency.risk ?? "N/A"}</td>
                        <td>{dependency.vulnerabilityRisk}</td>
                        <td>{dependency.licenseRisk}</td>
                        <td>{dependency.freshnessRisk}</td>
                        <td>{dependency.activityRisk}</td>
                        <td>{dependency.stabilityRisk}</td>
                        <td>{dependency.managementRisk}</td>
                    </tr>
                ))
            ) : (
                <tr><td colSpan={14}>No open source dependencies found</td></tr>
            )}
        </tbody>
    </table>
);

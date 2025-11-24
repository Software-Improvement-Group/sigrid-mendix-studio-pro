import React from "react";
import type { SecurityFinding } from "../../../store/sigridStore";

type SecurityTableProps = {
    findings: SecurityFinding[];
};

export const SEVERITY_SYMBOLS: Record<string, string> = {
    "CRITICAL" : "🟣",
    "HIGH" : "🔴",
    "MEDIUM" : "🟠",
    "LOW" : "🟡",
    "NONE" : "🟢",
    "INFO" : "🔵",
    "INFORMATION" : "🔵",
    "UNKNOWN" : "⚪️",
    "" : "⚪️"
};

export const getRiskSymbol = (severity: string | undefined) => {
    return SEVERITY_SYMBOLS[severity || ""] ?? "⚪️";
};

const sortFindings = (findings: SecurityFinding[]) => {
    const severityNames: string[] = Object.keys(SEVERITY_SYMBOLS);

    const sorted: SecurityFinding[] = findings.slice();
    sorted.sort((a, b) => severityNames.indexOf(a.severity || "") - severityNames.indexOf(b.severity || ""));
    return sorted;
};

const formatStatus = (status: string) => {
    return status.substring(0, 1).toUpperCase() + status.substring(1).toLowerCase();
};

export const SecurityTable: React.FC<SecurityTableProps> = ({ findings }) => (
    <table id="sigridFindings" className="sigrid-table">
        <thead>
            <tr>
                <th>Risk</th>
                <th>Location</th>
                <th>Description</th>
                <th>Status</th>
            </tr>
        </thead>
        <tbody>
            {findings.length > 0 ? (
                sortFindings(findings).map((finding) => (
                    <tr key={finding.id}>
                        <td>{getRiskSymbol(finding.severity)}</td>
                        <td>{finding.displayFilePath ?? finding.filePath ?? ""}</td>
                        <td>{finding.name}</td>
                        <td>{formatStatus(finding.status)}</td>
                    </tr>
                ))
            ) : (
                <tr><td colSpan={4}>No security findings found</td></tr>
            )}
        </tbody>
    </table>
);

import React, { useEffect, useState } from "react";
import type { SecurityFinding } from "../../../store/sigridStore";
import { getStudioProApi } from "@mendix/extensions-api";
import { getClickableIds } from "../utils/fileNavigation";

type SecurityTableProps = {
    findings: SecurityFinding[];
    onOpenFiles?: (files: string[]) => void;
    studioPro: ReturnType<typeof getStudioProApi>;
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

export const SecurityTable: React.FC<SecurityTableProps> = ({ findings, onOpenFiles, studioPro }) => {
    const [clickableIds, setClickableIds] = useState<Set<string>>(new Set());
    useEffect(() => {
        const checkClickability = async () => {
            const clickable = await getClickableIds(
                studioPro, 
                findings, 
                (f) => f.filePath ? [f.filePath] : []
            );
            setClickableIds(clickable);
        };
        void checkClickability();
    }, [findings, studioPro]);
    
    const handleDoubleClick = (finding: SecurityFinding) => {
        if (!onOpenFiles || !clickableIds.has(finding.id)) return;

        const file = finding.filePath;
        if (file) {
            onOpenFiles([file]);
        }
    };

    return (
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
                    sortFindings(findings).map((finding) => {
                        const isClickable = clickableIds.has(finding.id);
                        return (
                            <tr 
                                key={finding.id}
                                onDoubleClick={() => handleDoubleClick(finding)}
                                title={isClickable ? "Double-click to open file" : ""}
                                className={isClickable ? "clickable-row" : ""}
                            >
                                <td>{getRiskSymbol(finding.severity)}</td>
                                <td className="clickable-location">{finding.displayFilePath ?? finding.filePath ?? ""}</td>
                                <td>{finding.name}</td>
                                <td>{formatStatus(finding.status)}</td>
                            </tr>
                        );
                    })
                ) : (
                    <tr><td colSpan={4}>No security findings found</td></tr>
                )}
            </tbody>
        </table>
    );
};

import React, { useEffect, useState } from "react";
import type { SecurityFinding, FindingStatus } from "../../../store/sigridStore";
import { SECURITY_STATUSES } from "../../../store/sigridStore";
import { getStudioProApi } from "@mendix/extensions-api";
import { getClickableIds } from "../utils/fileNavigation";
import { formatStatus } from "../utils/pathUtils";
import { FindingEditDialog } from "./FindingEditDialog";

type SecurityTableProps = {
    findings: SecurityFinding[];
    onOpenFiles?: (files: string[]) => void;
    onShowPathInfo?: (files: string[]) => void;
    studioPro: ReturnType<typeof getStudioProApi>;
};

export const SEVERITY_SYMBOLS: Record<string, string> = {
    "CRITICAL" : "🟣",
    "HIGH" : "🔴",
    "MEDIUM" : "🟠",
    "LOW" : "🟡",
    "UNKNOWN" : "⚪️",
    "" : "⚪️",
    "NONE" : "🟢",
    "INFO" : "🔵",
    "INFORMATION" : "🔵"
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

export const SecurityTable: React.FC<SecurityTableProps> = ({ findings, onOpenFiles, onShowPathInfo, studioPro }) => {
    const [clickableIds, setClickableIds] = useState<Set<string>>(new Set());
    const [editingFinding, setEditingFinding] = useState<SecurityFinding | null>(null);

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
    
    const handleLocationClick = (finding: SecurityFinding) => {
        const isClickable = clickableIds.has(finding.id);
        const file = finding.filePath;
        if (!file) return;

        if (!isClickable) {
            onShowPathInfo?.([file]);
            return;
        }

        if (onOpenFiles) {
            onOpenFiles([file]);
        }
    };

    const sortedFindings = sortFindings(findings);

    return (
    <>
        <table id="sigridFindings" className="sigrid-table">
            <thead>
                <tr>
                    <th>Risk</th>
                    <th>Location</th>
                    <th>Description</th>
                    <th>Status</th>
                    <th></th>
                </tr>
            </thead>
            <tbody>
                {sortedFindings.length > 0 ? (
                    sortedFindings.map((finding) => {
                        const isClickable = clickableIds.has(finding.id);
                        const tooltip = isClickable 
                            ? (finding.filePath ?? "") 
                            : "Click to view full file path";

                        return (
                            <tr 
                                key={finding.id}
                                className={isClickable ? "clickable-row" : ""}
                            >
                                <td>{getRiskSymbol(finding.severity)}</td>
                                <td 
                                    className="clickable-location"
                                    onClick={() => handleLocationClick(finding)}
                                    title={tooltip}
                                >
                                    {finding.displayFilePath ?? finding.filePath ?? ""}
                                </td>
                                <td>{finding.name}</td>
                                <td className="status-cell">{formatStatus(finding.status)}</td>
                                <td>
                                    <button
                                        className="edit-icon-button"
                                        title="Edit finding"
                                        onClick={() => setEditingFinding(finding)}
                                    >✏️</button>
                                </td>
                            </tr>
                        );
                    })
                ) : (
                    <tr><td colSpan={5}>No security findings found</td></tr>
                )}
            </tbody>
        </table>
        {editingFinding && (
            <FindingEditDialog
                findingType="security"
                findingId={editingFinding.id}
                currentStatus={editingFinding.status as FindingStatus}
                currentRemark={editingFinding.remark}
                statuses={SECURITY_STATUSES}
                onClose={() => setEditingFinding(null)}
            />
        )}
    </>
    );
};


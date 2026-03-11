import React, { useEffect, useState } from "react";
import {RefactoringCandidate, RefactoringCandidatesMap, RefactoringCategory, FindingStatus, MAINTAINABILITY_STATUSES} from "../../../store/sigridStore";
import { toDisplayPath, formatStatus } from "../utils/pathUtils";
import { getStudioProApi } from "@mendix/extensions-api";
import { getClickableIds } from "../utils/fileNavigation";
import { FindingEditDialog } from "./FindingEditDialog";

type MaintainabilityTableProps = {
    refactoringCandidates: RefactoringCandidatesMap;
    onOpenFiles?: (files: string[]) => void;
    onShowPathInfo?: (files: string[]) => void;
    studioPro: ReturnType<typeof getStudioProApi>;
};

const RISK_CATEGORY_SYMBOLS: Record<string, string> = {
    "VERY_HIGH" : "🔴",
    "HIGH" : "🟠",
    "MODERATE" : "🟡",
    "MEDIUM" : "🟡",
    "LOW" : "🟢"
};

const getRiskSymbol = (severity: string) => {
    return RISK_CATEGORY_SYMBOLS[severity] ?? "⚪️";
};

const sortRefactoringCandidates = (refactoringCandidates: RefactoringCandidatesMap) => {
    const severityNames: string[] = Object.keys(RISK_CATEGORY_SYMBOLS);

    let sorted: RefactoringCandidate[] = [];
    for (let category in refactoringCandidates) {
        if (category !== "componentEntanglement" && category !== "componentIndependence") {
            sorted = sorted.concat(refactoringCandidates[category as RefactoringCategory]);
        }
    }

    sorted.sort((a, b) => {
        let result: number = severityNames.indexOf(a.severity || "") - severityNames.indexOf(b.severity || "");
        if (result === 0) {
            result = (a.weight ?? 0) - (b.weight ?? 0);
        }
        return result;
    });

    return sorted;
};

const formatDescription = (rc: RefactoringCandidate) => {
    const location: string = formatLocation(rc);
    const unit: string = ["mendix", "mendixflow"].indexOf(rc.technology ?? "") === -1 ? "Flow" : "Unit";
    const scale: string = ["mendix", "mendixflow"].indexOf(rc.technology ?? "") === -1 ? "lines of code" : "activities";

    if (rc.category === "duplication") {
        return `${rc.weight} ${scale} are duplicated between ${location}.`;
    } else if (rc.category === "unitSize") {
        return `${unit} contains ${rc.weight} ${scale}.`;
    } else if (rc.category === "unitComplexity") {
        return `${unit} defines ${rc.weight} decision points.`;
    } else if (rc.category === "unitInterfacing") {
        return `${unit} has ${rc.weight} parameters.`;
    } else if (rc.category === "moduleCoupling") {
        return `${unit} has ${rc.weight} incoming dependencies from other ${unit}s.`;
    } else {
        return "";
    }
}

const formatLocation = (rc: RefactoringCandidate) => {
    if (rc.locations.length === 0) {
        return toDisplayPath(rc.file ?? "");
    } else if (rc.locations.length === 1) {
        return toDisplayPath(rc.locations[0].file);
    } else if (rc.locations.length === 2) {
        return `${toDisplayPath(rc.locations[0].file)} and ${toDisplayPath(rc.locations[1].file)}`;
    } else {
        return `${toDisplayPath(rc.locations[0].file)}, ${toDisplayPath(rc.locations[1].file)}, and ${rc.locations.length - 2} other files`;
    }
};

const getFilePaths = (rc: RefactoringCandidate): string[] => {
    if (rc.locations.length > 0) {
        return rc.locations.map(loc => loc.file).filter(Boolean);
    }
    if (rc.file) {
        return [rc.file];
    }
    return [];
};

export const MaintainabilityTable: React.FC<MaintainabilityTableProps> = ({ refactoringCandidates, onOpenFiles, onShowPathInfo, studioPro }) => {
    const [clickableIds, setClickableIds] = useState<Set<string>>(new Set());
    const [editingCandidate, setEditingCandidate] = useState<RefactoringCandidate | null>(null);

    const sortedCandidates = sortRefactoringCandidates(refactoringCandidates);
    useEffect(() => {
        const checkClickability = async () => {
            const clickable = await getClickableIds(
                studioPro, 
                sortedCandidates, 
                getFilePaths
            );
            setClickableIds(clickable);
        };
        void checkClickability();
    }, [refactoringCandidates, studioPro]);
    
    const handleLocationClick = (rc: RefactoringCandidate) => {
        const isClickable = clickableIds.has(rc.id);
        const files = getFilePaths(rc);

        if (files.length === 0) return;

        if (!isClickable) {
            onShowPathInfo?.(files);
            return;
        }

        if (onOpenFiles) {
            onOpenFiles(files);
        }
    };

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
            {sortedCandidates.length > 0 ? (
                sortedCandidates.map((rc) => {
                    const isClickable = clickableIds.has(rc.id);
                    const files = getFilePaths(rc);
                    
                    let tooltip = "";
                    if (files.length > 1) {
                        tooltip = isClickable ? "Click to view all locations" : "Click to view full file paths";
                    } else if (files.length === 1) {
                        tooltip = isClickable ? files[0] : "Click to view full file path";
                    }

                    return (
                        <tr 
                            key={rc.id} 
                            className={isClickable ? "clickable-row" : ""}
                        >
                            <td>{getRiskSymbol(rc.severity)}</td>
                            <td 
                                className="clickable-location"
                                onClick={() => handleLocationClick(rc)}
                                title={tooltip}
                            >
                                {formatLocation(rc)}
                            </td>
                            <td>{formatDescription(rc)}</td>
                            <td className="status-cell">{formatStatus(rc.status)}</td>
                            <td>
                                <button
                                    className="edit-icon-button"
                                    title="Edit finding"
                                    onClick={() => setEditingCandidate(rc)}
                                >✏️</button>
                            </td>
                        </tr>
                    );
                })
            ) : (
                <tr><td colSpan={5}>No refactoring candidates found</td></tr>
            )}
            </tbody>
        </table>
        {editingCandidate && (
            <FindingEditDialog
                findingType="maintainability"
                findingId={editingCandidate.id}
                currentStatus={editingCandidate.status as FindingStatus}
                currentRemark={editingCandidate.remark}
                statuses={MAINTAINABILITY_STATUSES}
                onClose={() => setEditingCandidate(null)}
            />
        )}
    </>
    );
};

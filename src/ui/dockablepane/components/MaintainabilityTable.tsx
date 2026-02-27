import React, { useEffect, useState } from "react";
import {RefactoringCandidate, RefactoringCandidatesMap, RefactoringCategory} from "../../../store/sigridStore";
import { toDisplayPath } from "../utils/pathUtils";
import { getStudioProApi } from "@mendix/extensions-api";
import { getClickableIds } from "../utils/fileNavigation";

type MaintainabilityTableProps = {
    refactoringCandidates: RefactoringCandidatesMap;
    onOpenFiles?: (files: string[]) => void;
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

const formatStatus = (status: string) => {
    return status.substring(0, 1).toUpperCase() + status.substring(1).toLowerCase();
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

export const MaintainabilityTable: React.FC<MaintainabilityTableProps> = ({ refactoringCandidates, onOpenFiles, studioPro }) => {
    const [clickableIds, setClickableIds] = useState<Set<string>>(new Set());

    const sortedCandidates = sortRefactoringCandidates(refactoringCandidates);
    useEffect(() => {
        const checkClickability = async () => {
            const clickable = await getClickableIds(
                studioPro, 
                sortedCandidates, 
                (rc) => {
                    if (rc.locations.length > 0) {
                        return rc.locations.map(loc => loc.file).filter(Boolean);
                    } else if (rc.file) {
                        return [rc.file];
                    }
                    return [];
                }
            );
            setClickableIds(clickable);
        };
        void checkClickability();
    }, [refactoringCandidates, studioPro]);
    
    const handleRowDoubleClick = (rc: RefactoringCandidate) => {
        if (!onOpenFiles || !clickableIds.has(rc.id)) return
        
        let files: string[] = [];
        if (rc.locations.length > 0) {
            files = rc.locations.map(loc => loc.file).filter(Boolean);
        } else if (rc.file) {
            files = [rc.file];
        }

        if (files.length > 0) {
            onOpenFiles(files);
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
            {sortedCandidates.length > 0 ? (
                sortedCandidates.map((rc) => {
                    const isClickable = clickableIds.has(rc.id);
                    return (
                        <tr 
                            key={rc.id} 
                            onDoubleClick={() => handleRowDoubleClick(rc)}
                            title={isClickable ? "Double-click to open file(s)" : ""}
                            className={isClickable ? "clickable-row" : ""}
                        >
                            <td>{getRiskSymbol(rc.severity)}</td>
                            <td className="clickable-location">{formatLocation(rc)}</td>
                            <td>{formatDescription(rc)}</td>
                            <td>{formatStatus(rc.status)}</td>
                        </tr>
                    );
                })
            ) : (
                <tr><td colSpan={4}>No refactoring candidates found</td></tr>
            )}
            </tbody>
        </table>
    );
};

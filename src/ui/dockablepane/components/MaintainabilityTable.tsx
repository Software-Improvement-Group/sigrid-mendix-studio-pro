import React from "react";
import {RefactoringCandidate, RefactoringCandidatesMap, RefactoringCategory} from "../../../store/sigridStore";

type MaintainabilityTableProps = {
    refactoringCandidates: RefactoringCandidatesMap;
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
        return formatFilePath(rc.file ?? "");
    } else if (rc.locations.length === 1) {
        return formatFilePath(rc.locations[0].file);
    } else if (rc.locations.length === 2) {
        return `${formatFilePath(rc.locations[0].file)} and ${formatFilePath(rc.locations[1].file)}`;
    } else {
        return `${formatFilePath(rc.locations[0].file)}, ${formatFilePath(rc.locations[1].file)}, and ${rc.locations.length - 2} other files`;
    }
};

const formatFilePath = (filePath: string) => {
    if (filePath.indexOf("/") === -1) {
        return filePath;
    }
    return ".../" + filePath.substring(filePath.lastIndexOf("/") + 1);
};

export const MaintainabilityTable: React.FC<MaintainabilityTableProps> = ({ refactoringCandidates }) => (
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
        {sortRefactoringCandidates(refactoringCandidates).length > 0 ? (
            sortRefactoringCandidates(refactoringCandidates).map((rc) => (
                <tr key={rc.id}>
                    <td>{getRiskSymbol(rc.severity)}</td>
                    <td>{formatLocation(rc)}</td>
                    <td>{formatDescription(rc)}</td>
                    <td>{formatStatus(rc.status)}</td>
                </tr>
            ))
        ) : (
            <tr><td colSpan={4}>No refactoring candidates found</td></tr>
        )}
        </tbody>
    </table>
);

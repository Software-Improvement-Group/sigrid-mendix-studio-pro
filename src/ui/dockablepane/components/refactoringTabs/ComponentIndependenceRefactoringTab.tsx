import React from "react";
import type { RefactoringCandidate } from "../../../../store/sigridStore";
import { getMaintainabilityTabLabel } from "../../tabConfig";

type RefactoringTabProps = {
    candidates: RefactoringCandidate[];
};

export const ComponentIndependenceRefactoringTab: React.FC<RefactoringTabProps> = () => (
    <div>
        <h3>{`${getMaintainabilityTabLabel('componentIndependence')} refactoring candidates`}</h3>
        <table className="sigrid-table">
            <tbody />
        </table>
    </div>
);

import React from "react";
import type { RefactoringCandidate } from "../../../../store/sigridStore";
import { getMaintainabilityTabLabel } from "../../tabConfig";

type RefactoringTabProps = {
    candidates: RefactoringCandidate[];
};

export const ModuleCouplingRefactoringTab: React.FC<RefactoringTabProps> = () => (
    <div>
        <h3>{`${getMaintainabilityTabLabel('moduleCoupling')} refactoring candidates`}</h3>
        <table className="sigrid-table">
            <tbody />
        </table>
    </div>
);

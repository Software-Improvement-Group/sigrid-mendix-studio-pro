import React from "react";
import type { RefactoringCandidate } from "../../../../store/sigridStore";
import { getMaintainabilityTabLabel } from "../../tabConfig";

type RefactoringTabProps = {
    candidates: RefactoringCandidate[];
};

export const UnitInterfacingRefactoringTab: React.FC<RefactoringTabProps> = () => (
    <div>
        <h3>{`${getMaintainabilityTabLabel('unitInterfacing')} refactoring candidates`}</h3>
        <table className="sigrid-table">
            <tbody />
        </table>
    </div>
);

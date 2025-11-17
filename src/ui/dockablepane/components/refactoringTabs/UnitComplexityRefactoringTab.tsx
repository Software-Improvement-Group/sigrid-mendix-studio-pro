import React from "react";
import type { RefactoringCandidate } from "../../../../store/sigridStore";
import { getMaintainabilityTabLabel } from "../../tabConfig";
import { tableStyle } from "../../styles";

type RefactoringTabProps = {
    candidates: RefactoringCandidate[];
};

export const UnitComplexityRefactoringTab: React.FC<RefactoringTabProps> = () => (
    <div>
        <h3>{`${getMaintainabilityTabLabel('unitComplexity')} refactoring candidates`}</h3>
        <table style={tableStyle}>
            <tbody />
        </table>
    </div>
);

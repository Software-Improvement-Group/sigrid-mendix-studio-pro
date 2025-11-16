import React from "react";
import type { SecurityFinding } from "../../../store/sigridStore";
import { tableStyle } from "../styles";

type SecurityTableProps = {
    findings: SecurityFinding[];
};

export const SecurityTable: React.FC<SecurityTableProps> = ({ findings }) => (
    <table id="sigridFindings" style={tableStyle}>
        <thead>
            <tr>
                <th>Type</th>
                <th>Weakness (CWE)</th>
                <th>File</th>
                <th>Status</th>
            </tr>
        </thead>
        <tbody>
            {findings.length > 0 ? (
                findings.map((finding) => (
                    <tr key={finding.id}>
                        <td>{finding.name}</td>
                        <td>{finding.cweId ?? "N/A"}</td>
                        <td>{finding.displayFilePath ?? finding.filePath ?? ""}</td>
                        <td>{finding.status}</td>
                    </tr>
                ))
            ) : (
                <tr><td colSpan={4}>No security findings found</td></tr>
            )}
        </tbody>
    </table>
);

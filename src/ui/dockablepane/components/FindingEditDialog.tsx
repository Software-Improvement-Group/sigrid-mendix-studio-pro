import React, {useEffect, useState} from "react";
import type {FindingStatus, FindingType} from "../../../store/sigridStore";
import {useSigridStore} from "../../../store/sigridStore";
import {formatStatus} from "../utils/pathUtils";

type FindingEditDialogProps = {
    findingType: FindingType;
    findingId: string;
    currentStatus: FindingStatus;
    currentRemark?: string;
    statuses: FindingStatus[];
    onClose: () => void;
};

export const FindingEditDialog: React.FC<FindingEditDialogProps> = ({ findingType, findingId, currentStatus, currentRemark, statuses, onClose }) => {
    const [status, setStatus] = useState<FindingStatus>(currentStatus);
    const [remark, setRemark] = useState(currentRemark ?? "");
    const updateFindingStatus = useSigridStore((s) => s.updateFindingStatus);

    const handleSave = async () => {
        await updateFindingStatus(findingType, findingId, status, remark);
        onClose();
    };

    useEffect(() => {
        const prev = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => { document.body.style.overflow = prev; };
    }, []);

    return (
        <div className="file-selection-overlay" onClick={onClose}>
            <div className="finding-edit-dialog" onClick={(e) => e.stopPropagation()}>
                <div className="finding-edit-header">
                    <h3>✏️ Edit finding</h3>
                    <button className="finding-edit-close" onClick={onClose}>✕</button>
                </div>
                <div className="finding-edit-field">
                    <label className="finding-edit-label">Status</label>
                    <select
                        className="finding-edit-select"
                        value={status}
                        onChange={(e) => setStatus(e.target.value as FindingStatus)}
                    >
                        {statuses.map((s) => (
                            <option key={s} value={s}>{formatStatus(s)}</option>
                        ))}
                    </select>
                </div>
                <div className="finding-edit-field">
                    <label className="finding-edit-label">Remark</label>
                    <textarea
                        className="finding-edit-textarea"
                        placeholder="Add a remark..."
                        value={remark}
                        onChange={(e) => setRemark(e.target.value)}
                    />
                </div>
                <div className="finding-edit-actions">
                    <button
                        className="settings-button primary"
                        onClick={handleSave}
                    >
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
};

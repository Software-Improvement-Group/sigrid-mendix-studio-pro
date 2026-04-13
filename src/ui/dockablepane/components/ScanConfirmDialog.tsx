import React from "react";

type ScanConfirmDialogProps = {
    onConfirm: () => void;
    onClose: () => void;
};

export const ScanConfirmDialog: React.FC<ScanConfirmDialogProps> = ({ onConfirm, onClose }) => (
    <div className="file-selection-overlay" onClick={onClose}>
        <div className="dialog-box" onClick={(e) => e.stopPropagation()}>
            <h3 className="scan-confirm-title">New scan request</h3>
            <p className="scan-confirm-text">
                Only systems residing on the Mendix Team Server can be triggered for a new scan.
                Do you want to proceed?
            </p>
            <div className="scan-confirm-actions">
                <button className="scan-confirm-cancel" onClick={onClose}>Cancel</button>
                <button className="scan-confirm-primary" onClick={onConfirm}>Confirm</button>
            </div>
        </div>
    </div>
);

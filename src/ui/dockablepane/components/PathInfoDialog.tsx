import React from "react";

type PathInfoDialogProps = {
    paths: string[];
    onClose: () => void;
};

export const PathInfoDialog: React.FC<PathInfoDialogProps> = ({ paths, onClose }) => {
    return (
        <div className="file-selection-overlay" onClick={onClose}>
            <div className="dialog-box" onClick={(e) => e.stopPropagation()}>
                <h3>📋 Full file path</h3>
                <ul className="file-selection-list">
                    {paths.map((path, index) => (
                        <li key={index}>{path}</li>
                    ))}
                </ul>
                <div className="file-selection-actions">
                    <button onClick={onClose}>Close</button>
                </div>
            </div>
        </div>
    );
};

import React from "react";

type PathInfoDialogProps = {
    paths: string[];
    onClose: () => void;
};

export const PathInfoDialog: React.FC<PathInfoDialogProps> = ({ paths, onClose }) => {
    return (
        <div className="file-selection-overlay" onClick={onClose}>
            <div className="file-selection-dialog" onClick={(e) => e.stopPropagation()}>
                <h3>Full File Path</h3>
                {paths.map((path, index) => (
                    <div key={index} className="path-info-content">
                        {path}
                    </div>
                ))}
                <div className="file-selection-actions">
                    <button onClick={onClose}>Close</button>
                </div>
            </div>
        </div>
    );
};

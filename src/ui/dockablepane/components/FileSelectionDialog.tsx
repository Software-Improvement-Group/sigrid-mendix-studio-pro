import React from "react";

type FileSelectionDialogProps = {
    files: string[];
    onSelect: (file: string) => void;
    onClose: () => void;
};

export const FileSelectionDialog: React.FC<FileSelectionDialogProps> = ({ files, onSelect, onClose }) => {
    return (
        <div className="file-selection-overlay" onClick={onClose}>
            <div className="file-selection-dialog" onClick={(e) => e.stopPropagation()}>
                <h3>Select File to Open</h3>
                <ul className="file-selection-list">
                    {files.map((file, index) => (
                        <li key={index} onClick={() => onSelect(file)}>
                            {file}
                        </li>
                    ))}
                </ul>
                <div className="file-selection-actions">
                    <button onClick={onClose}>Cancel</button>
                </div>
            </div>
        </div>
    );
};

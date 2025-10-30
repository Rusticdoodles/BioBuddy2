"use client";

import React from "react";

interface SaveMapDialogProps {
  open: boolean;
  name: string;
  onChangeName: (value: string) => void;
  onCancel: () => void;
  onSave: () => void;
}

export const SaveMapDialog: React.FC<SaveMapDialogProps> = ({
  open,
  name,
  onChangeName,
  onCancel,
  onSave,
}) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50" role="dialog" aria-modal>
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
          Save Concept Map
        </h3>
        <input
          type="text"
          value={name}
          onChange={(e) => onChangeName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              onSave();
            } else if (e.key === "Escape") {
              onCancel();
            }
          }}
          placeholder="Enter a name for this map..."
          className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-white mb-4"
          autoFocus
          aria-label="Map name"
        />
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};



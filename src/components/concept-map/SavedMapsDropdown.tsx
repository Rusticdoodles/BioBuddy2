"use client";

import React from "react";

type SavedMap = {
  id: string;
  name: string;
  timestamp: string;
  nodes: unknown[];
};

interface SavedMapsDropdownProps {
  savedMaps: SavedMap[];
  showLoadMenu: boolean;
  onToggleMenu: () => void;
  onLoadMap: (mapId: string) => void;
  onDeleteMap: (mapId: string) => void;
}

export const SavedMapsDropdown: React.FC<SavedMapsDropdownProps> = ({
  savedMaps,
  showLoadMenu,
  onToggleMenu,
  onLoadMap,
  onDeleteMap,
}) => {
  if (!savedMaps || savedMaps.length === 0) return null;

  return (
    <div className="relative">
      <button
        onClick={onToggleMenu}
        className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg transition-colors border border-slate-300 dark:border-slate-600"
        title="Load saved maps"
        aria-haspopup="menu"
        aria-expanded={showLoadMenu}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z" />
        </svg>
        <span className="text-sm font-medium">My Maps ({savedMaps.length})</span>
      </button>

      {showLoadMenu && (
        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 z-50 max-h-96 overflow-y-auto" role="menu">
          <div className="p-3 border-b border-slate-200 dark:border-slate-700">
            <h3 className="font-semibold text-slate-900 dark:text-white text-sm">Saved Maps</h3>
          </div>
          <div className="p-2">
            {savedMaps.map((map) => (
              <div
                key={map.id}
                className="flex items-center justify-between p-3 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg group"
              >
                <button
                  onClick={() => onLoadMap(map.id)}
                  className="flex-1 text-left"
                  aria-label={`Load ${map.name}`}
                >
                  <div className="font-medium text-slate-900 dark:text-white text-sm">
                    {map.name}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    {new Date(map.timestamp).toLocaleDateString()} • {map.nodes?.length ?? 0} nodes
                  </div>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (window.confirm(`Delete "${map.name}"?`)) {
                      onDeleteMap(map.id);
                    }
                  }}
                  className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Delete map"
                  aria-label={`Delete ${map.name}`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};



"use client";

import React from 'react';
import { MessageSquare, Trash2 } from 'lucide-react';
import { LoadingState } from '@/types/concept-map-types';

interface NotesInputProps {
  inputText: string;
  onTextChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onGenerateMap: () => void;
  loadingState: LoadingState;
  isChatMode: boolean;
  onToggleChatMode: () => void;
  onClearAll?: () => void;
}

export const NotesInput: React.FC<NotesInputProps> = ({
  inputText,
  onTextChange,
  onGenerateMap,
  loadingState,
  isChatMode,
  onToggleChatMode,
  onClearAll
}) => {
  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
            {isChatMode ? 'AI Chat' : 'Your Notes'}
          </h2>
          {!isChatMode && (
            <span className="text-sm text-slate-500 dark:text-slate-400">
              {inputText.length} characters
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {onClearAll && (
            <button
              onClick={onClearAll}
              className="px-3 py-1.5 text-sm bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 hover-scale-sm transition-colors flex items-center gap-2"
              title="Clear all data (chat history and concept map)"
              aria-label="Clear all data"
            >
              <Trash2 className="w-4 h-4" />
              Clear All
            </button>
          )}
          <button
            onClick={onToggleChatMode}
            className="px-3 py-1.5 text-sm rounded-lg hover-scale-sm transition-colors flex items-center gap-2 shrink-0 mr-12 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-900/50"
            title={isChatMode ? "Switch to Notes Mode" : "Switch to Chat Mode"}
            aria-label={isChatMode ? "Switch to Notes Mode" : "Switch to Chat Mode"}
          >
            <MessageSquare className="w-4 h-4" />
            {isChatMode ? 'Notes Mode' : 'Chat Mode'}
          </button>
        </div>
      </div>
      
      <textarea
        value={inputText}
        onChange={onTextChange}
        placeholder="Paste your biology or medical lecture notes here...

Example:
The cardiovascular system consists of the heart, blood vessels, and blood. The heart pumps blood through arteries to deliver oxygen and nutrients to tissues. Veins return deoxygenated blood back to the heart. The pulmonary circuit carries blood to the lungs for gas exchange, while the systemic circuit delivers oxygenated blood to the body..."
        className="flex-1 w-full p-4 border border-slate-300 dark:border-slate-600 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400"
        aria-label="Paste your biology or medical lecture notes here"
      />
      
      <div className="mt-4 flex justify-end">
        <button
          onClick={onGenerateMap}
          disabled={inputText.trim().length === 0 || loadingState === 'loading'}
          className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 flex items-center gap-2 ${
            inputText.trim().length > 0 && loadingState !== 'loading'
              ? "bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl hover-lift cursor-pointer"
              : "bg-slate-300 dark:bg-slate-600 text-slate-500 dark:text-slate-400 cursor-not-allowed"
          }`}
          aria-label="Generate concept map from your notes"
        >
          {loadingState === 'loading' ? (
            <>
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Generating...
            </>
          ) : (
            "Generate Concept Map"
          )}
        </button>
      </div>
    </>
  );
};

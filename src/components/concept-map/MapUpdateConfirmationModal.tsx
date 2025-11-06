import React from 'react';
import { feedback } from '@/lib/feedback';

interface MapUpdateConfirmationModalProps {
  isOpen: boolean;
  pendingMapUpdate: {
    newNodes: Array<{ id?: string; label: string; type: string }>;
    newEdges: Array<{ source: string; target: string; label?: string }>;
    newInformation: string;
  } | null;
  onClose: () => void;
  onConfirm: () => void;
}

export const MapUpdateConfirmationModal: React.FC<MapUpdateConfirmationModalProps> = ({
  isOpen,
  pendingMapUpdate,
  onClose,
  onConfirm,
}) => {
  if (!isOpen || !pendingMapUpdate) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in-new"
      onClick={() => {
        onClose();
      }}
    >
      <div 
        className="bg-white dark:bg-slate-800 rounded-lg shadow-xl p-6 max-w-md w-full mx-4 animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-3 mb-4">
          <div className="flex-shrink-0 w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              Add to Concept Map?
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              I found {pendingMapUpdate.newNodes.length} new concept{pendingMapUpdate.newNodes.length !== 1 ? 's' : ''} to add to your map:
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
              💡 New nodes will be positioned to avoid overlapping with existing concepts
            </p>
          </div>
        </div>
        
        {/* Show preview of new nodes */}
        <div className="mb-4 p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg max-h-32 overflow-y-auto">
          <ul className="space-y-1 text-sm">
            {pendingMapUpdate.newNodes.map((node, idx) => (
              <li key={idx} className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                <span className="font-medium">{node.label}</span>
                <span className="text-xs text-slate-500 dark:text-slate-400">({node.type})</span>
              </li>
            ))}
          </ul>
        </div>
        
        {/* Action buttons */}
        <div className="flex gap-3 justify-end">
          <button
            onClick={() => {
              onClose();
              feedback.mapUpdateCancelled();
            }}
            className="px-4 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg hover-scale-sm transition-colors"
            aria-label="Cancel"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg hover-lift transition-colors font-medium"
            aria-label="Add to map"
          >
            Add to Map
          </button>
        </div>
      </div>
    </div>
  );
};


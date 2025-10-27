"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Handle, Position } from '@xyflow/react';
import { X } from 'lucide-react';
import { nodeTypeColors, nodeTypeOptions } from '@/constants/concept-map-constants';

interface ConceptNodeProps {
  data: {
    label: string;
    type: string;
    onUpdateNode: (nodeId: string, label: string, type?: string) => void;
    onDeleteNode: (nodeId: string) => void;
  };
  id: string;
}

export const ConceptNode: React.FC<ConceptNodeProps> = ({ data, id }) => {
  const { onUpdateNode, onDeleteNode } = data;
  const colors = nodeTypeColors[data.type] || nodeTypeColors.default;
  const [isEditing, setIsEditing] = useState(false);
  const [editLabel, setEditLabel] = useState(data.label);
  const [showDelete, setShowDelete] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const [isEditingType, setIsEditingType] = useState(false);
  const [editType, setEditType] = useState(data.type);
  const typeInputRef = useRef<HTMLSelectElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  useEffect(() => {
    if (isEditingType && typeInputRef.current) {
      typeInputRef.current.focus();
    }
  }, [isEditingType]);

  const handleSave = () => {
    if (editLabel.trim()) {
      onUpdateNode(id, editLabel.trim());
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setEditLabel(data.label);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this node? This will also remove all connected edges.')) {
      onDeleteNode(id);
    }
  };

  const handleTypeSave = () => {
    if (editType.trim()) {
      onUpdateNode(id, data.label, editType.trim());
      setIsEditingType(false);
    }
  };

  const handleTypeCancel = () => {
    setEditType(data.type);
    setIsEditingType(false);
  };

  const handleTypeKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleTypeSave();
    } else if (e.key === 'Escape') {
      handleTypeCancel();
    }
  };

  return (
    <>
      <Handle type="target" position={Position.Top} />
      <div 
        className={`px-4 py-3 rounded-lg shadow-md border-2 ${colors.bg} ${colors.border} min-w-[120px] max-w-[200px] relative group`}
        onMouseEnter={() => setShowDelete(true)}
        onMouseLeave={() => setShowDelete(false)}
      >
        {isEditing ? (
          <input
            ref={inputRef}
            value={editLabel}
            onChange={(e) => setEditLabel(e.target.value)}
            onBlur={handleSave}
            onKeyDown={handleKeyDown}
            className={`w-full text-sm font-semibold ${colors.text} text-center bg-transparent border-none outline-none`}
          />
        ) : (
          <div 
            className={`text-sm font-semibold ${colors.text} text-center break-words cursor-pointer hover:underline nodrag`}
            onClick={(e) => {
              e.stopPropagation();
              setIsEditing(true);
            }}
          >
            {data.label}
          </div>
        )}
        {isEditingType ? (
          <select
            ref={typeInputRef}
            value={editType}
            onChange={(e) => setEditType(e.target.value)}
            onBlur={handleTypeSave}
            onKeyDown={handleTypeKeyDown}
            className={`w-full text-xs ${colors.text} text-center bg-white dark:bg-slate-700 border border-blue-500 rounded outline-none mt-1 capitalize nodrag px-1 py-0.5`}
          >
            {nodeTypeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        ) : (
          <div 
            className={`text-xs ${colors.text} opacity-75 text-center mt-1 capitalize cursor-pointer hover:underline nodrag`}
            onClick={(e) => {
              e.stopPropagation();
              setIsEditingType(true);
            }}
          >
            {data.type}
          </div>
        )}
        
        {/* Delete button - visible on hover */}
        {showDelete && !isEditing && (
          <button
            onClick={handleDelete}
            className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center text-xs transition-colors"
            aria-label="Delete node"
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </div>
      <Handle type="source" position={Position.Bottom} />
    </>
  );
};

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
    isNew?: boolean;
    isFocused?: boolean;
    isConnected?: boolean;
    shouldDim?: boolean;
  };
  id: string;
}

export const ConceptNode: React.FC<ConceptNodeProps> = ({ data, id }) => {
  const { 
    onUpdateNode, 
    onDeleteNode, 
    isFocused = false,
    isConnected = false,
    shouldDim = false
  } = data;
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
      <Handle
        type="target"
        position={Position.Top}
          aria-label="Target handle (top)"
          style={{
            width: 8,
            height: 8,
            backgroundColor: '#ffffff',
            border: `2px solid ${colors.color}`,
            borderRadius: 9999,
            zIndex: 10,
          }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        aria-label="Source handle (bottom)"
        style={{
          width: 8,
          height: 8,
          backgroundColor: '#ffffff',
          border: `2px solid ${colors.color}`,
          borderRadius: 9999,
          zIndex: 10,
        }}
      />
      <div 
        className={`
          px-6 py-4 rounded-lg shadow-md border-2 ${colors.bg} ${colors.border} 
          min-w-[120px] max-w-[200px] relative group
          transition-all duration-300 ease-in-out
          ${shouldDim ? 'opacity-20' : 'opacity-100'}
          ${isFocused ? 'ring-4 ring-blue-500 ring-opacity-50 scale-105' : ''}
          ${isConnected && !isFocused ? 'ring-2 ring-blue-400 ring-opacity-30' : ''}
          ${data.isNew ? 'ring-2 ring-blue-400 animate-pulse' : ''}
        `}
        onMouseEnter={() => setShowDelete(true)}
        onMouseLeave={() => setShowDelete(false)}
        role="button"
        tabIndex={0}
        aria-pressed={isFocused}
        aria-label={`${data.label}. Click to focus on connections. ${isConnected ? 'Connected to focused node.' : ''}`}
        style={{
          cursor: 'pointer',
        }}
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
        
        {/* Show connection indicator when focused */}
        {isFocused && (
          <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-blue-500 text-white text-xs px-2 py-1 rounded whitespace-nowrap shadow-lg z-50">
            📍 Focus Mode
          </div>
        )}
        
        {/* Delete button - visible on hover */}
        {showDelete && !isEditing && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDelete();
            }}
            className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center text-xs transition-colors z-10"
            aria-label="Delete node"
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </div>
    </>
  );
};

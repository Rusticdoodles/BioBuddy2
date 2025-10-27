"use client";

import React, { useState, useRef } from 'react';
import { EdgeProps } from '@xyflow/react';

interface EditableEdgeProps extends EdgeProps {
  data?: {
    onUpdateEdge?: (edgeId: string, label: string) => void;
    onDeleteEdge?: (edgeId: string) => void;
  };
}

export const EditableEdge: React.FC<EditableEdgeProps> = ({ 
  id, 
  sourceX, 
  sourceY, 
  targetX, 
  targetY, 
  label, 
  style, 
  markerEnd, 
  data 
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editLabel, setEditLabel] = useState(typeof label === 'string' ? label : '');
  const [showDelete, setShowDelete] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const edgePath = `M ${sourceX},${sourceY} C ${sourceX},${(sourceY + targetY) / 2} ${targetX},${(sourceY + targetY) / 2} ${targetX},${targetY}`;
  
  const edgeCenterX = (sourceX + targetX) / 2;
  const edgeCenterY = (sourceY + targetY) / 2;

  const handleLabelClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const handleSave = () => {
    if (editLabel.trim() && data?.onUpdateEdge) {
      data.onUpdateEdge(id, editLabel.trim());
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      setEditLabel(typeof label === 'string' ? label : '');
      setIsEditing(false);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Delete this connection?') && data?.onDeleteEdge) {
      data.onDeleteEdge(id);
    }
  };

  return (
    <>
      <path
        id={id}
        style={style}
        className="react-flow__edge-path"
        d={edgePath}
        markerEnd={markerEnd}
      />
      <g
        transform={`translate(${edgeCenterX}, ${edgeCenterY})`}
        onMouseEnter={() => setShowDelete(true)}
        onMouseLeave={() => setShowDelete(false)}
        onClick={handleLabelClick}
      >
        {isEditing ? (
          <foreignObject x={-75} y={-15} width={150} height={30}>
            <input
              ref={inputRef}
              value={editLabel}
              onChange={(e) => setEditLabel(e.target.value)}
              onBlur={handleSave}
              onKeyDown={handleKeyDown}
              className="w-full px-2 py-1 text-xs text-center bg-white border border-blue-500 rounded shadow-lg outline-none"
              style={{ font: '11px sans-serif' }}
            />
          </foreignObject>
        ) : (
          <>
            <rect
              x={-50}
              y={-12}
              width={100}
              height={24}
              fill="white"
              fillOpacity={0.85}
              rx={4}
              className="cursor-pointer"
              onClick={handleLabelClick}
              style={{ pointerEvents: 'all' }} 
            />
            <text
              x={0}
              y={0}
              textAnchor="middle"
              dominantBaseline="middle"
              style={{ font: '11px sans-serif', fontWeight: 500, fill: '#374151', pointerEvents: 'none' }}
            >
              {typeof label === 'string' ? label : ''}
            </text>
            {showDelete && (
              <g transform="translate(55, -10)" onClick={handleDelete} className="cursor-pointer">
                <circle r={8} fill="#ef4444" />
                <path
                  d="M -3,-3 L 3,3 M 3,-3 L -3,3"
                  stroke="white"
                  strokeWidth={1.5}
                  strokeLinecap="round"
                />
              </g>
            )}
          </>
        )}
      </g>
    </>
  );
};

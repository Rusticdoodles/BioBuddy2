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

  // Compute label-based sizing to keep hover/click area relative to text length
  const labelText = typeof label === 'string' ? label : '';
  const textWidth = Math.max(labelText.length * 10, 24); // minimum width similar to visible rect
  const labelRectX = -textWidth / 2;
  const labelRectY = -12;
  const labelRectW = textWidth;
  const labelRectH = 24;
  const hoverPadding = 14; // padding around label for easier hover/click
  const deleteInset = 14; // move the delete button slightly inward from the edge
  const deleteX = labelRectX + labelRectW + hoverPadding - deleteInset;
  const deleteY = labelRectY - hoverPadding + deleteInset;

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
            {/* Expand hover/clickable area relative to text size */}
            <rect
              x={labelRectX - hoverPadding}
              y={labelRectY - hoverPadding}
              width={labelRectW + hoverPadding * 2}
              height={labelRectH + hoverPadding * 2}
              fill="transparent"
              style={{ pointerEvents: 'all' }}
            />
            <rect
              x={labelRectX}
              y={labelRectY}
              width={labelRectW}
              height={labelRectH}
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
              {labelText}
            </text>
            {showDelete && !isEditing && (
              <g
                transform={`translate(${deleteX}, ${deleteY})`}
                onClick={handleDelete}
                onMouseDown={(e) => e.stopPropagation()}
                role="button"
                tabIndex={0}
                aria-label="Delete edge"
                className="cursor-pointer"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    // @ts-ignore - reusing handler
                    handleDelete(e);
                  }
                }}
                style={{ pointerEvents: 'all' }}
              >
                {/* Larger invisible hit area for easier clicking */}
                <circle r={10} fill="transparent" style={{ pointerEvents: 'all' }} />
                <circle r={8} fill="#ef4444" />
                <path
                  d="M -3,-3 L 3,3 M 3,-3 L -3,3"
                  stroke="white"
                  strokeWidth={1.75}
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

"use client";

import React, { useState, useRef } from 'react';
import { EdgeProps, Position } from '@xyflow/react';

interface EditableEdgeProps extends EdgeProps {
  data?: {
    onUpdateEdge?: (edgeId: string, label: string) => void;
    onDeleteEdge?: (edgeId: string) => void;
  };
  pathOptions?: {
    offset?: number;
    borderRadius?: number;
  };
}

type XYPosition = { x: number; y: number };

// React Flow's smoothstep path calculation logic
const handleDirections = {
  [Position.Left]: { x: -1, y: 0 },
  [Position.Right]: { x: 1, y: 0 },
  [Position.Top]: { x: 0, y: -1 },
  [Position.Bottom]: { x: 0, y: 1 },
};

const getDirection = ({
  source,
  sourcePosition,
  target,
}: {
  source: XYPosition;
  sourcePosition: Position;
  target: XYPosition;
}): XYPosition => {
  if (sourcePosition === Position.Left || sourcePosition === Position.Right) {
    return source.x < target.x ? { x: 1, y: 0 } : { x: -1, y: 0 };
  }
  return source.y < target.y ? { x: 0, y: 1 } : { x: 0, y: -1 };
};

const distance = (a: XYPosition, b: XYPosition) => Math.sqrt(Math.pow(b.x - a.x, 2) + Math.pow(b.y - a.y, 2));

const getEdgeCenter = ({
  sourceX,
  sourceY,
  targetX,
  targetY,
}: {
  sourceX: number;
  sourceY: number;
  targetX: number;
  targetY: number;
}): [number, number, number, number] => {
  const xOffset = Math.abs(targetX - sourceX) / 2;
  const yOffset = Math.abs(targetY - sourceY) / 2;
  const centerX = sourceX < targetX ? sourceX + xOffset : sourceX - xOffset;
  const centerY = sourceY < targetY ? sourceY + yOffset : sourceY - yOffset;
  return [centerX, centerY, xOffset, yOffset];
};

function getPoints({
  source,
  sourcePosition = Position.Bottom,
  target,
  targetPosition = Position.Top,
  center,
  offset,
  stepPosition = 0.5,
}: {
  source: XYPosition;
  sourcePosition: Position;
  target: XYPosition;
  targetPosition: Position;
  center: Partial<XYPosition>;
  offset: number;
  stepPosition: number;
}): [XYPosition[], number, number, number, number] {
  const sourceDir = handleDirections[sourcePosition];
  const targetDir = handleDirections[targetPosition];
  const sourceGapped: XYPosition = { x: source.x + sourceDir.x * offset, y: source.y + sourceDir.y * offset };
  const targetGapped: XYPosition = { x: target.x + targetDir.x * offset, y: target.y + targetDir.y * offset };
  const dir = getDirection({
    source: sourceGapped,
    sourcePosition,
    target: targetGapped,
  });
  const dirAccessor = dir.x !== 0 ? 'x' : 'y';
  const currDir = dir[dirAccessor];

  let points: XYPosition[] = [];
  let centerX: number, centerY: number;
  const sourceGapOffset = { x: 0, y: 0 };
  const targetGapOffset = { x: 0, y: 0 };

  const [, , defaultOffsetX, defaultOffsetY] = getEdgeCenter({
    sourceX: source.x,
    sourceY: source.y,
    targetX: target.x,
    targetY: target.y,
  });

  // opposite handle positions, default case
  if (sourceDir[dirAccessor] * targetDir[dirAccessor] === -1) {
    if (dirAccessor === 'x') {
      centerX = center.x ?? (sourceGapped.x + (targetGapped.x - sourceGapped.x) * stepPosition);
      centerY = center.y ?? (sourceGapped.y + targetGapped.y) / 2;
    } else {
      centerX = center.x ?? (sourceGapped.x + targetGapped.x) / 2;
      centerY = center.y ?? (sourceGapped.y + (targetGapped.y - sourceGapped.y) * stepPosition);
    }

    const verticalSplit: XYPosition[] = [
      { x: centerX, y: sourceGapped.y },
      { x: centerX, y: targetGapped.y },
    ];
    const horizontalSplit: XYPosition[] = [
      { x: sourceGapped.x, y: centerY },
      { x: targetGapped.x, y: centerY },
    ];

    if (sourceDir[dirAccessor] === currDir) {
      points = dirAccessor === 'x' ? verticalSplit : horizontalSplit;
    } else {
      points = dirAccessor === 'x' ? horizontalSplit : verticalSplit;
    }
  } else {
    // sourceTarget means we take x from source and y from target, targetSource is the opposite
    const sourceTarget: XYPosition[] = [{ x: sourceGapped.x, y: targetGapped.y }];
    const targetSource: XYPosition[] = [{ x: targetGapped.x, y: sourceGapped.y }];
    // this handles edges with same handle positions
    if (dirAccessor === 'x') {
      points = sourceDir.x === currDir ? targetSource : sourceTarget;
    } else {
      points = sourceDir.y === currDir ? sourceTarget : targetSource;
    }

    if (sourcePosition === targetPosition) {
      const diff = Math.abs(source[dirAccessor] - target[dirAccessor]);

      // if an edge goes from right to right for example (sourcePosition === targetPosition) and the distance between source.x and target.x is less than the offset, the added point and the gapped source/target will overlap. This leads to a weird edge path. To avoid this we add a gapOffset to the source/target
      if (diff <= offset) {
        const gapOffset = Math.min(offset - 1, offset - diff);
        if (sourceDir[dirAccessor] === currDir) {
          sourceGapOffset[dirAccessor] = (sourceGapped[dirAccessor] > source[dirAccessor] ? -1 : 1) * gapOffset;
        } else {
          targetGapOffset[dirAccessor] = (targetGapped[dirAccessor] > target[dirAccessor] ? -1 : 1) * gapOffset;
        }
      }
    }

    // these are conditions for handling mixed handle positions like Right -> Bottom for example
    if (sourcePosition !== targetPosition) {
      const dirAccessorOpposite = dirAccessor === 'x' ? 'y' : 'x';
      const isSameDir = sourceDir[dirAccessor] === targetDir[dirAccessorOpposite];
      const sourceGtTargetOppo = sourceGapped[dirAccessorOpposite] > targetGapped[dirAccessorOpposite];
      const sourceLtTargetOppo = sourceGapped[dirAccessorOpposite] < targetGapped[dirAccessorOpposite];
      const flipSourceTarget =
        (sourceDir[dirAccessor] === 1 && ((!isSameDir && sourceGtTargetOppo) || (isSameDir && sourceLtTargetOppo))) ||
        (sourceDir[dirAccessor] !== 1 && ((!isSameDir && sourceLtTargetOppo) || (isSameDir && sourceGtTargetOppo)));

      if (flipSourceTarget) {
        points = dirAccessor === 'x' ? sourceTarget : targetSource;
      }
    }

    const sourceGapPoint = { x: sourceGapped.x + sourceGapOffset.x, y: sourceGapped.y + sourceGapOffset.y };
    const targetGapPoint = { x: targetGapped.x + targetGapOffset.x, y: targetGapped.y + targetGapOffset.y };
    const maxXDistance = Math.max(Math.abs(sourceGapPoint.x - points[0].x), Math.abs(targetGapPoint.x - points[0].x));
    const maxYDistance = Math.max(Math.abs(sourceGapPoint.y - points[0].y), Math.abs(targetGapPoint.y - points[0].y));

    // we want to place the label on the longest segment of the edge
    if (maxXDistance >= maxYDistance) {
      centerX = (sourceGapPoint.x + targetGapPoint.x) / 2;
      centerY = points[0].y;
    } else {
      centerX = points[0].x;
      centerY = (sourceGapPoint.y + targetGapPoint.y) / 2;
    }
  }

  const pathPoints = [
    source,
    { x: sourceGapped.x + sourceGapOffset.x, y: sourceGapped.y + sourceGapOffset.y },
    ...points,
    { x: targetGapped.x + targetGapOffset.x, y: targetGapped.y + targetGapOffset.y },
    target,
  ];

  return [pathPoints, centerX!, centerY!, defaultOffsetX, defaultOffsetY];
}

function getBend(a: XYPosition, b: XYPosition, c: XYPosition, size: number): string {
  const bendSize = Math.min(distance(a, b) / 2, distance(b, c) / 2, size);
  const { x, y } = b;

  // no bend
  if ((a.x === x && x === c.x) || (a.y === y && y === c.y)) {
    return `L${x} ${y}`;
  }

  // first segment is horizontal
  if (a.y === y) {
    const xDir = a.x < c.x ? -1 : 1;
    const yDir = a.y < c.y ? 1 : -1;
    return `L ${x + bendSize * xDir},${y}Q ${x},${y} ${x},${y + bendSize * yDir}`;
  }

  const xDir = a.x < c.x ? 1 : -1;
  const yDir = a.y < c.y ? -1 : 1;
  return `L ${x},${y + bendSize * yDir}Q ${x},${y} ${x + bendSize * xDir},${y}`;
}

function getSmoothStepPath({
  sourceX,
  sourceY,
  sourcePosition = Position.Bottom,
  targetX,
  targetY,
  targetPosition = Position.Top,
  borderRadius = 5,
  centerX,
  centerY,
  offset = 20,
  stepPosition = 0.5,
}: {
  sourceX: number;
  sourceY: number;
  sourcePosition?: Position;
  targetX: number;
  targetY: number;
  targetPosition?: Position;
  borderRadius?: number;
  centerX?: number;
  centerY?: number;
  offset?: number;
  stepPosition?: number;
}): [path: string, labelX: number, labelY: number, offsetX: number, offsetY: number] {
  const [points, labelX, labelY, offsetX, offsetY] = getPoints({
    source: { x: sourceX, y: sourceY },
    sourcePosition,
    target: { x: targetX, y: targetY },
    targetPosition,
    center: { x: centerX, y: centerY },
    offset,
    stepPosition,
  });

  const path = points.reduce<string>((res, p, i) => {
    let segment = '';

    if (i > 0 && i < points.length - 1) {
      segment = getBend(points[i - 1], p, points[i + 1], borderRadius);
    } else {
      segment = `${i === 0 ? 'M' : 'L'}${p.x} ${p.y}`;
    }

    res += segment;

    return res;
  }, '');

  return [path, labelX, labelY, offsetX, offsetY];
}

export const EditableEdge: React.FC<EditableEdgeProps> = ({ 
  id, 
  sourceX, 
  sourceY, 
  targetX, 
  targetY, 
  sourcePosition = Position.Bottom,
  targetPosition = Position.Top,
  label, 
  style, 
  markerEnd, 
  data,
  pathOptions,
  ...rest
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editLabel, setEditLabel] = useState(typeof label === 'string' ? label : '');
  const [showDelete, setShowDelete] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Smoothstep path calculation using React Flow's exact logic
  // Access pathOptions from props or from edge object (React Flow passes edge as a prop)
  const edgePathOptions = pathOptions || (rest as unknown as { edge?: { pathOptions?: { offset?: number; borderRadius?: number } } }).edge?.pathOptions;
  const offset = edgePathOptions?.offset ?? 20;
  const borderRadius = edgePathOptions?.borderRadius ?? 10;
  
  // Use React Flow's getSmoothStepPath function
  const [edgePath, edgeCenterX, edgeCenterY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    borderRadius,
    offset,
  });

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
        style={{
          ...style,
          fill: 'none',
          stroke: style?.stroke || '#64748b', // Ensure stroke is applied
        }}
        className="react-flow__edge-path"
        d={edgePath}
        markerEnd={markerEnd}
      />
      <g
        transform={`translate(${edgeCenterX}, ${edgeCenterY})`}
        onMouseEnter={() => setShowDelete(true)}
        onMouseLeave={() => setShowDelete(false)}
        onClick={handleLabelClick}
        opacity={style?.opacity ?? 1}
        style={{
          transition: 'opacity 0.3s ease',
        }}
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
                    // @ts-expect-error - reusing handler from MouseEvent
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

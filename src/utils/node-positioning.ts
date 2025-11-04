import { Node } from '@xyflow/react';

interface Position {
  x: number;
  y: number;
}

/**
 * Finds an empty space on the canvas that doesn't overlap with existing nodes.
 * Uses a grid-based approach with collision detection.
 */
export function findEmptySpace(
  existingNodes: Node[],
  preferredX: number,
  preferredY: number,
  nodeIndex: number = 0
): Position {
  const NODE_WIDTH = 150; // Approximate node width
  const NODE_HEIGHT = 80; // Approximate node height
  const MIN_SPACING = 50; // Minimum space between nodes
  const GRID_SIZE = 120; // Grid cell size for positioning
  
  // If no existing nodes, just use preferred position
  if (existingNodes.length === 0) {
    return { x: preferredX, y: preferredY };
  }
  
  // Helper: Check if a position overlaps with any existing node
  const hasOverlap = (testX: number, testY: number): boolean => {
    return existingNodes.some(node => {
      const dx = Math.abs(node.position.x - testX);
      const dy = Math.abs(node.position.y - testY);
      
      // Check if rectangles overlap (with spacing buffer)
      const overlapX = dx < (NODE_WIDTH + MIN_SPACING);
      const overlapY = dy < (NODE_HEIGHT + MIN_SPACING);
      
      return overlapX && overlapY;
    });
  };
  
  // Strategy 1: Try positions in expanding spiral pattern
  const spiralPositions: Position[] = [];
  const maxRings = 4;
  
  for (let ring = 0; ring <= maxRings; ring++) {
    const radius = ring * GRID_SIZE;
    const points = Math.max(8, ring * 8); // More points in outer rings
    
    for (let i = 0; i < points; i++) {
      const angle = (i / points) * Math.PI * 2;
      const x = preferredX + Math.cos(angle) * radius;
      const y = preferredY + Math.sin(angle) * radius;
      spiralPositions.push({ x, y });
    }
  }
  
  // Try each spiral position
  for (const pos of spiralPositions) {
    if (!hasOverlap(pos.x, pos.y)) {
      console.log(`✅ Found empty space at (${Math.round(pos.x)}, ${Math.round(pos.y)})`);
      return pos;
    }
  }
  
  // Strategy 2: If spiral fails, try a grid-based search
  const searchSteps = 10;
  for (let xStep = -searchSteps; xStep <= searchSteps; xStep++) {
    for (let yStep = -searchSteps; yStep <= searchSteps; yStep++) {
      const testX = preferredX + (xStep * GRID_SIZE);
      const testY = preferredY + (yStep * GRID_SIZE);
      
      if (!hasOverlap(testX, testY)) {
        console.log(`✅ Found empty space via grid at (${Math.round(testX)}, ${Math.round(testY)})`);
        return { x: testX, y: testY };
      }
    }
  }
  
  // Strategy 3: Fallback - place far to the right in a column
  console.warn('⚠️ No empty space found, using fallback positioning');
  const maxX = Math.max(...existingNodes.map(n => n.position.x));
  return {
    x: maxX + 300,
    y: preferredY + (nodeIndex * (NODE_HEIGHT + MIN_SPACING))
  };
}

/**
 * Calculates the best starting position for new nodes based on existing layout.
 * Tries to find the center-right area with the most space.
 */
export function calculateOptimalStartPosition(existingNodes: Node[]): Position {
  if (existingNodes.length === 0) {
    return { x: 200, y: 200 };
  }
  
  // Calculate bounding box of existing nodes
  const positions = existingNodes.map(n => n.position);
  const minX = Math.min(...positions.map(p => p.x));
  const maxX = Math.max(...positions.map(p => p.x));
  const minY = Math.min(...positions.map(p => p.y));
  const maxY = Math.max(...positions.map(p => p.y));
  
  // Calculate center
  const centerY = (minY + maxY) / 2;
  
  // Prefer positioning to the right and slightly down from center
  const preferredX = maxX + 250; // To the right of rightmost node
  const preferredY = centerY; // Vertically centered
  
  console.log('📍 Optimal start position:', {
    preferredX: Math.round(preferredX),
    preferredY: Math.round(preferredY),
    boundingBox: { minX, maxX, minY, maxY }
  });
  
  return { x: preferredX, y: preferredY };
}

interface NewNode {
  id: string;
  label: string;
  type: string;
}

interface NewEdge {
  source: string;
  target: string;
}

/**
 * Groups new nodes to keep related concepts close together.
 */
export function clusterRelatedNodes(
  newNodes: NewNode[],
  newEdges: NewEdge[]
): { node: NewNode; group: number }[] {
  // Simple clustering: nodes connected by edges should be near each other
  const groups = new Map<string, number>();
  let currentGroup = 0;
  
  newNodes.forEach(node => {
    if (!groups.has(node.id)) {
      groups.set(node.id, currentGroup);
      
      // Find all nodes connected to this one
      const connected = newEdges
        .filter(e => e.source === node.id || e.target === node.id)
        .flatMap(e => [e.source, e.target])
        .filter(id => id !== node.id && id.startsWith('new-'));
      
      // Assign same group to connected nodes
      connected.forEach(id => groups.set(id, currentGroup));
      
      currentGroup++;
    }
  });
  
  return newNodes.map(node => ({
    node,
    group: groups.get(node.id) || 0
  }));
}


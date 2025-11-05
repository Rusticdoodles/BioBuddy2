import dagre from 'dagre';
import { Node, Edge, Position } from '@xyflow/react';

/**
 * Detects and fixes overlapping nodes using collision detection
 * Pushes overlapping nodes apart while maintaining overall structure
 */
function fixOverlappingNodes(nodes: Node[], nodeWidth = 220, nodeHeight = 90): Node[] {
  const MIN_HORIZONTAL_DISTANCE = nodeWidth + 30;  // Node width + padding
  const MIN_VERTICAL_DISTANCE = nodeHeight + 30;   // Node height + padding
  const MAX_ITERATIONS = 5; // Prevent infinite loops
  
  let hasOverlaps = true;
  let iteration = 0;
  let workingNodes = [...nodes];
  
  while (hasOverlaps && iteration < MAX_ITERATIONS) {
    hasOverlaps = false;
    iteration++;
    
    // Check all pairs of nodes for overlaps
    for (let i = 0; i < workingNodes.length; i++) {
      for (let j = i + 1; j < workingNodes.length; j++) {
        const node1 = workingNodes[i];
        const node2 = workingNodes[j];
        
        const dx = node2.position.x - node1.position.x;
        const dy = node2.position.y - node1.position.y;
        
        const horizontalOverlap = Math.abs(dx) < MIN_HORIZONTAL_DISTANCE;
        const verticalOverlap = Math.abs(dy) < MIN_VERTICAL_DISTANCE;
        
        // If nodes overlap, push them apart
        if (horizontalOverlap && verticalOverlap) {
          hasOverlaps = true;
          
          // Calculate push direction
          const angle = Math.atan2(dy, dx) || 0;
          const pushDistance = 15; // Pixels to push per iteration
          
          // Push nodes apart along the line connecting their centers
          workingNodes[i].position.x -= Math.cos(angle) * pushDistance;
          workingNodes[i].position.y -= Math.sin(angle) * pushDistance;
          workingNodes[j].position.x += Math.cos(angle) * pushDistance;
          workingNodes[j].position.y += Math.sin(angle) * pushDistance;
          
          console.log(`🔧 Fixed overlap between node ${i} and ${j} (iteration ${iteration})`);
        }
      }
    }
  }
  
  if (iteration >= MAX_ITERATIONS && hasOverlaps) {
    console.warn('⚠️ Could not resolve all overlaps within max iterations');
  } else if (iteration > 1) {
    console.log(`✅ Resolved overlaps in ${iteration} iterations`);
  }
  
  return workingNodes;
}

/**
 * Adaptive layout that chooses optimal parameters based on graph size
 */
export const getLayoutedElements = (nodes: Node[], edges: Edge[], direction = 'TB') => {
  const nodeCount = nodes.length;
  
  // Determine layout strategy based on size
  let layoutParams;
  
  if (nodeCount <= 5) {
    // SMALL GRAPHS: Extra spacious, very clear
    layoutParams = {
      nodesep: 140,
      ranksep: 140,
      edgesep: 80,
      nodeWidth: 240,
      nodeHeight: 100,
      strategy: 'spacious',
    };
    console.log('📐 Using SPACIOUS layout for small graph');
    
  } else if (nodeCount <= 12) {
    // MEDIUM GRAPHS: Balanced spacing
    layoutParams = {
      nodesep: 100,
      ranksep: 120,
      edgesep: 60,
      nodeWidth: 220,
      nodeHeight: 90,
      strategy: 'balanced',
    };
    console.log('📐 Using BALANCED layout for medium graph');
    
  } else if (nodeCount <= 20) {
    // LARGE GRAPHS: Tighter but still readable
    layoutParams = {
      nodesep: 80,
      ranksep: 100,
      edgesep: 40,
      nodeWidth: 200,
      nodeHeight: 85,
      strategy: 'compact',
    };
    console.log('📐 Using COMPACT layout for large graph');
    
  } else {
    // VERY LARGE GRAPHS: Maximum density
    layoutParams = {
      nodesep: 60,
      ranksep: 80,
      edgesep: 30,
      nodeWidth: 180,
      nodeHeight: 80,
      strategy: 'dense',    
    };
    console.log('📐 Using DENSE layout for very large graph');
  }
  
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  
  dagreGraph.setGraph({ 
    rankdir: direction, // Direction: TB (top-bottom), LR (left-right)
    // align: 'UL', // Align to upper-left for consistency
    nodesep: layoutParams.nodesep, // Horizontal space between nodes in same rank (increased from default 50)
    edgesep: layoutParams.edgesep, // Space between edges (increased from default 10)
    ranksep: layoutParams.ranksep, // Vertical space between ranks (increased from default 50)
    marginx: 50, // Horizontal margin around graph
    marginy: 50, // Vertical margin around graph
    acyclicer: 'greedy', // Break cycles for cleaner hierarchy
    ranker: 'network-simplex' // Better ranking algorithm for balanced layouts
  });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { 
      width: layoutParams.nodeWidth, 
      height: layoutParams.nodeHeight 
    });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    return {
      ...node,
      targetPosition: Position.Top,
      sourcePosition: Position.Bottom,
      position: {
        x: nodeWithPosition.x - (layoutParams.nodeWidth / 2),
        y: nodeWithPosition.y - (layoutParams.nodeHeight / 2),
      },
    };
  });

  // Fix overlaps (from previous prompt)
  const noOverlapNodes = fixOverlappingNodes(
    layoutedNodes, 
    layoutParams.nodeWidth, 
    layoutParams.nodeHeight
  );

  console.log(`✅ ${layoutParams.strategy.toUpperCase()} layout complete:`, {
    nodes: nodeCount,
    edges: edges.length,
    spacing: `${layoutParams.nodesep}x${layoutParams.ranksep}`
  });

  return {
    nodes: noOverlapNodes,
    edges
  };
};

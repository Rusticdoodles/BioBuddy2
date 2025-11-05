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

// Layout function using dagre
export const getLayoutedElements = (nodes: Node[], edges: Edge[], direction = 'TB') => {
  console.log('📐 Starting layout with:', { nodes: nodes.length, edges: edges.length });
  
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  
  // IMPROVED: Add comprehensive layout parameters
  dagreGraph.setGraph({ 
    rankdir: direction,      // Direction: TB (top-bottom), LR (left-right)
    // align: 'UR',             // Align to upper-left for consistency
    nodesep: 100,            // Horizontal space between nodes in same rank (increased from default 50)
    edgesep: 60,             // Space between edges (increased from default 10)
    ranksep: 120,            // Vertical space between ranks (increased from default 50)
    marginx: 50,             // Horizontal margin around graph
    marginy: 50,             // Vertical margin around graph
    acyclicer: 'greedy',     // Break cycles for cleaner hierarchy
    ranker: 'network-simplex' // Better ranking algorithm for balanced layouts
  });

  // IMPROVED: Larger node dimensions to prevent text overflow and crowding
  const NODE_WIDTH = 220;   // Increased from 200
  const NODE_HEIGHT = 90;   // Increased from 80
  
  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { 
      width: NODE_WIDTH, 
      height: NODE_HEIGHT 
    });
    console.log(`📍 Set node: ${node.id}`);
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
    console.log(`🔗 Set edge: ${edge.source} -> ${edge.target}`);
  });

  dagre.layout(dagreGraph);

  // Map positions back to React Flow nodes
  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    return {
      ...node,
      targetPosition: Position.Top,
      sourcePosition: Position.Bottom,
      position: {
        x: nodeWithPosition.x - (NODE_WIDTH / 2),
        y: nodeWithPosition.y - (NODE_HEIGHT / 2),
      },
    };
  });

  console.log('📐 Layout params:', {
    nodeCount: nodes.length,
    edgeCount: edges.length,
    nodesep: 100,
    ranksep: 120
  });

  // Post-process: Fix any overlapping nodes
  const noOverlapNodes = fixOverlappingNodes(layoutedNodes, NODE_WIDTH, NODE_HEIGHT);

  console.log('📐 Layout complete:', {
    totalNodes: noOverlapNodes.length,
    totalEdges: edges.length,
    dimensions: `${NODE_WIDTH}x${NODE_HEIGHT}`
  });

  return {
    nodes: noOverlapNodes,
    edges
  };
};

import dagre from 'dagre';
import { Node, Edge, Position } from '@xyflow/react';

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

  console.log('✅ Layout complete:', { 
    layoutedNodes: layoutedNodes.length, 
    layoutedEdges: edges.length 
  });

  return { nodes: layoutedNodes, edges };
};

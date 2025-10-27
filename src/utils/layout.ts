import dagre from 'dagre';
import { Node, Edge, Position } from '@xyflow/react';

// Layout function using dagre
export const getLayoutedElements = (nodes: Node[], edges: Edge[], direction = 'TB') => {
  console.log('📐 Starting layout with:', { nodes: nodes.length, edges: edges.length });
  
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  dagreGraph.setGraph({ 
    rankdir: direction,
    ranksep: 100,
    nodesep: 80,
    edgesep: 20,
  });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: 200, height: 80 });
    console.log(`📍 Set node: ${node.id}`);
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
    console.log(`🔗 Set edge: ${edge.source} -> ${edge.target}`);
  });

  dagre.layout(dagreGraph);

  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    return {
      ...node,
      targetPosition: Position.Top,
      sourcePosition: Position.Bottom,
      position: {
        x: nodeWithPosition.x - 100,
        y: nodeWithPosition.y - 40,
      },
    };
  });

  console.log('✅ Layout complete:', { 
    layoutedNodes: layoutedNodes.length, 
    layoutedEdges: edges.length 
  });

  return { nodes: layoutedNodes, edges };
};

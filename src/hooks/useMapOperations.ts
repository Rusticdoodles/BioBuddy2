import { useCallback, useRef, useEffect } from 'react';
import { Node, Edge, NodeChange, EdgeChange, Connection, addEdge } from '@xyflow/react';

interface SerializableNode {
  id: string;
  type?: string;
  position: { x: number; y: number };
  data?: {
    label?: string;
    type?: string;
  };
}

interface SerializableEdge {
  id: string;
  source: string;
  target: string;
  type?: string;
  animated?: boolean;
  style?: unknown;
  markerEnd?: unknown;
  label?: string | React.ReactNode;
  data?: unknown;
}

export const useMapOperations = (
  nodes: Node[],
  edges: Edge[],
  setNodes: React.Dispatch<React.SetStateAction<Node[]>>,
  setEdges: React.Dispatch<React.SetStateAction<Edge[]>>,
) => {
  const historyRef = useRef<{ nodes: SerializableNode[]; edges: SerializableEdge[] }[]>([]);
  const redoRef = useRef<{ nodes: SerializableNode[]; edges: SerializableEdge[] }[]>([]);
  const isProgrammaticChangeRef = useRef(false);
  const nodesRef = useRef<Node[]>(nodes);
  const edgesRef = useRef<Edge[]>(edges);

  // Keep refs in sync using useEffect
  useEffect(() => {
    nodesRef.current = nodes;
  }, [nodes]);
  
  useEffect(() => {
    edgesRef.current = edges;
  }, [edges]);

  const getStorableSnapshot = useCallback(() => {
    const currentNodes = nodesRef.current;
    const currentEdges = edgesRef.current;
    const storableNodes: SerializableNode[] = currentNodes.map((n) => ({
      id: n.id,
      type: n.type,
      position: n.position,
      data: {
        label: (n.data as { label?: string; type?: string })?.label ?? '',
        type: (n.data as { label?: string; type?: string })?.type,
      },
    }));
    const storableEdges: SerializableEdge[] = currentEdges.map((e) => ({
      id: e.id,
      source: e.source,
      target: e.target,
      type: e.type,
      animated: e.animated,
      style: e.style,
      markerEnd: e.markerEnd,
      label: e.label,
      data: undefined,
    }));
    return { nodes: storableNodes, edges: storableEdges };
  }, []);

  const pushHistory = useCallback(() => {
    if (isProgrammaticChangeRef.current) return;
    const snapshot = getStorableSnapshot();
    historyRef.current.push(snapshot);
    // Clear redo stack when new action is performed
    redoRef.current = [];
  }, [getStorableSnapshot]);

  const handleDeleteNode = useCallback((nodeId: string) => {
    pushHistory();
    setNodes((nds) => nds.filter((node) => node.id !== nodeId));
    setEdges((eds) => eds.filter((edge) => edge.source !== nodeId && edge.target !== nodeId));
  }, [setNodes, setEdges, pushHistory]);

  const handleUpdateNode = useCallback((nodeId: string, label: string, type?: string) => {
    pushHistory();
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === nodeId) {
          return {
            ...node,
            data: {
              ...node.data,
              label,
              type: type || node.data.type,
              onUpdateNode: handleUpdateNode,
              onDeleteNode: handleDeleteNode,
            }
          };
        }
        return node;
      })
    );
  }, [handleDeleteNode, setNodes, pushHistory]);

  const handleUpdateEdge = useCallback((edgeId: string, label: string) => {
    pushHistory();
    setEdges((eds) =>
      eds.map((edge) =>
        edge.id === edgeId ? { ...edge, label, data: { ...edge.data, label } } : edge
      )
    );
  }, [setEdges, pushHistory]);

  const handleDeleteEdge = useCallback((edgeId: string) => {
    pushHistory();
    setEdges((eds) => eds.filter((edge) => edge.id !== edgeId));
  }, [setEdges, pushHistory]);

  const onConnect = useCallback(
    (params: Connection) => {
      pushHistory();
      const newEdge = {
        ...params,
        id: `edge-${params.source}-${params.target}-${Date.now()}`,
        type: 'editableEdge',
        animated: true,
        label: 'relationship',
        style: { stroke: '#64748b', strokeWidth: 2 },
        markerEnd: { type: 'arrowclosed', color: '#64748b' },
        data: {
          onUpdateEdge: handleUpdateEdge,
          onDeleteEdge: handleDeleteEdge,
        },
      };
      setEdges((eds) => addEdge(newEdge as Edge, eds));
    },
    [setEdges, handleUpdateEdge, handleDeleteEdge, pushHistory]
  );

  const handleAddNode = useCallback((label: string, type: string) => {
    pushHistory();
    const newNode: Node = {
      id: `node-${Date.now()}`,
      type: 'conceptNode',
      position: { x: 0, y: 0 },
      data: { 
        label, 
        type,
        onUpdateNode: handleUpdateNode,
        onDeleteNode: handleDeleteNode,
      },
    };
    
    setNodes((nds) => [...nds, newNode]);
  }, [setNodes, handleUpdateNode, handleDeleteNode, pushHistory]);

  const restoreFromSnapshot = useCallback((snapshot: { nodes: SerializableNode[]; edges: SerializableEdge[] }) => {
    const reconstructedNodes: Node[] = snapshot.nodes.map((node: SerializableNode) => ({
      ...node,
      data: {
        ...(node.data || {}),
        onUpdateNode: handleUpdateNode,
        onDeleteNode: handleDeleteNode,
      },
    }));
    const reconstructedEdges: Edge[] = snapshot.edges.map((edge: SerializableEdge) => ({
      ...edge,
      data: {
        onUpdateEdge: handleUpdateEdge,
        onDeleteEdge: handleDeleteEdge,
      },
    } as Edge));
    isProgrammaticChangeRef.current = true;
    setNodes(reconstructedNodes);
    setEdges(reconstructedEdges);
    setTimeout(() => { isProgrammaticChangeRef.current = false; }, 0);
  }, [handleUpdateNode, handleDeleteNode, handleUpdateEdge, handleDeleteEdge, setNodes, setEdges]);

  const handleUndo = useCallback(() => {
    if (historyRef.current.length === 0) return;
    // Save current state to redo stack before undoing
    const currentSnapshot = getStorableSnapshot();
    redoRef.current.push(currentSnapshot);
    const last = historyRef.current.pop()!;
    restoreFromSnapshot(last);
  }, [restoreFromSnapshot, getStorableSnapshot]);

  const handleRedo = useCallback(() => {
    if (redoRef.current.length === 0) return;
    // Save current state to history stack before redoing
    const currentSnapshot = getStorableSnapshot();
    historyRef.current.push(currentSnapshot);
    const next = redoRef.current.pop()!;
    restoreFromSnapshot(next);
  }, [restoreFromSnapshot, getStorableSnapshot]);

  const createWrappedOnNodesChange = useCallback((onNodesChange: (changes: NodeChange[]) => void) => {
    return (changes: NodeChange[]) => {
      if (!isProgrammaticChangeRef.current) {
        pushHistory();
      }
      onNodesChange(changes);
    };
  }, [pushHistory]);

  const createWrappedOnEdgesChange = useCallback((onEdgesChange: (changes: EdgeChange[]) => void) => {
    return (changes: EdgeChange[]) => {
      if (!isProgrammaticChangeRef.current) {
        pushHistory();
      }
      onEdgesChange(changes);
    };
  }, [pushHistory]);

  const setNodesProgrammatic = useCallback((updater: React.SetStateAction<Node[]>) => {
    isProgrammaticChangeRef.current = true;
    setNodes(updater);
    setTimeout(() => { isProgrammaticChangeRef.current = false; }, 0);
  }, [setNodes]);

  const setEdgesProgrammatic = useCallback((updater: React.SetStateAction<Edge[]>) => {
    isProgrammaticChangeRef.current = true;
    setEdges(updater);
    setTimeout(() => { isProgrammaticChangeRef.current = false; }, 0);
  }, [setEdges]);

  return {
    handleDeleteNode,
    handleUpdateNode,
    handleUpdateEdge,
    handleDeleteEdge,
    onConnect,
    handleAddNode,
    handleUndo,
    handleRedo,
    createWrappedOnNodesChange,
    createWrappedOnEdgesChange,
    setNodesProgrammatic,
    setEdgesProgrammatic,
    isProgrammaticChangeRef,
    pushHistory,
  };
};


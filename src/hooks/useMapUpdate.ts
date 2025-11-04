import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { Node, Edge } from '@xyflow/react';
import { TopicChat } from '@/types/concept-map-types';
import { calculateOptimalStartPosition, clusterRelatedNodes, findEmptySpace } from '@/utils/node-positioning';
import { Position } from '@xyflow/react';
import { getLayoutedElements } from '@/utils/layout';

const TOPIC_CHATS_KEY = 'biobuddy-topic-chats';

interface PendingMapUpdate {
  newNodes: Array<{ id?: string; label: string; type: string }>;
  newEdges: Array<{ source: string; target: string; label?: string }>;
  newInformation: string;
}

interface UseMapUpdateProps {
  activeTopicId: string | null;
  activeTopic: TopicChat | undefined;
  topicChats: TopicChat[];
  setTopicChats: React.Dispatch<React.SetStateAction<TopicChat[]>>;
  setNodes: React.Dispatch<React.SetStateAction<Node[]>>;
  setEdges: React.Dispatch<React.SetStateAction<Edge[]>>;
  handleUpdateNode: (nodeId: string, label: string, type?: string) => void;
  handleDeleteNode: (nodeId: string) => void;
  handleUpdateEdge: (edgeId: string, label: string) => void;
  handleDeleteEdge: (edgeId: string) => void;
}

export const useMapUpdate = ({
  activeTopicId,
  activeTopic,
  topicChats,
  setTopicChats,
  setNodes,
  setEdges,
  handleUpdateNode,
  handleDeleteNode,
  handleUpdateEdge,
  handleDeleteEdge,
}: UseMapUpdateProps) => {
  const [showAddToMapPrompt, setShowAddToMapPrompt] = useState(false);
  const [pendingMapUpdate, setPendingMapUpdate] = useState<PendingMapUpdate | null>(null);
  const [isLoadingMapUpdate, setIsLoadingMapUpdate] = useState(false);

  const verifyLocalStorageSave = useCallback(() => {
    try {
      const saved = localStorage.getItem(TOPIC_CHATS_KEY);
      if (!saved) {
        console.error('❌ Nothing in localStorage!');
        return false;
      }
      
      const topics = JSON.parse(saved);
      const activeTopic = topics.find((t: TopicChat) => t.id === activeTopicId);
      
      if (!activeTopic) {
        console.error('❌ Active topic not found in localStorage');
        return false;
      }
      
      console.log('✅ localStorage verification:', {
        topicsCount: topics.length,
        activeTopicName: activeTopic.name,
        nodesCount: activeTopic.nodes.length,
        edgesCount: activeTopic.edges.length,
        lastUpdated: activeTopic.updatedAt,
      });
      
      return true;
    } catch (error) {
      console.error('❌ Error verifying localStorage:', error);
      return false;
    }
  }, [activeTopicId]);

  const handleConfirmMapUpdate = useCallback(() => {
    if (!pendingMapUpdate || !activeTopicId || !activeTopic) {
      console.error('❌ Cannot confirm map update - missing data');
      return;
    }

    console.log('🔄 Merging new nodes into map...');
    console.log('   New nodes:', pendingMapUpdate.newNodes.length);
    console.log('   New edges:', pendingMapUpdate.newEdges.length);

    try {
      // Step 1: Check for duplicate nodes
      const existingLabels = new Set(
        activeTopic.nodes.map(n => {
          const label = (n.data as { label?: string })?.label || '';
          return label.toLowerCase().trim();
        })
      );

      const uniqueNewNodes = pendingMapUpdate.newNodes.filter(node => {
        const isDuplicate = existingLabels.has(node.label.toLowerCase().trim());
        if (isDuplicate) {
          console.log('⚠️ Skipping duplicate node:', node.label);
        }
        return !isDuplicate;
      });

      if (uniqueNewNodes.length === 0) {
        toast.info('No new nodes to add - all concepts already exist on the map');
        setShowAddToMapPrompt(false);
        setPendingMapUpdate(null);
        return;
      }

      console.log('✅ Adding', uniqueNewNodes.length, 'unique nodes');

      // Step 2: Create ID mapping
      const newIdMap = new Map<string, string>();

      // Step 3: Calculate optimal starting position
      const { x: baseX, y: baseY } = calculateOptimalStartPosition(activeTopic.nodes);
      console.log('📍 Starting position for new nodes:', { baseX, baseY });

      // Step 4: Group related nodes (add temporary IDs if missing)
      const nodesWithIds = uniqueNewNodes.map((node, idx) => ({
        ...node,
        id: node.id || `new-${idx}`
      }));
      const clusteredNodes = clusterRelatedNodes(nodesWithIds, pendingMapUpdate.newEdges);
      console.log('🔗 Clustered into', new Set(clusteredNodes.map(c => c.group)).size, 'groups');

      // Step 5: Format new nodes with smart positioning
      const newNodesFormatted: Node[] = [];
      clusteredNodes.forEach(({ node }, index) => {
        const newNodeId = `node-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        newIdMap.set(node.id, newNodeId);

        const position = findEmptySpace(
          [...activeTopic.nodes, ...newNodesFormatted],
          baseX,
          baseY,
          index
        );

        console.log(`  Node "${node.label}" positioned at (${Math.round(position.x)}, ${Math.round(position.y)})`);

        newNodesFormatted.push({
          id: newNodeId,
          type: 'conceptNode',
          position,
          data: {
            label: node.label,
            type: node.type,
            onUpdateNode: handleUpdateNode,
            onDeleteNode: handleDeleteNode,
            isNew: true,
          },
          targetPosition: Position.Top,
          sourcePosition: Position.Bottom,
        });
      });

      // Step 6: Create existing node IDs map
      const existingNodeIds = new Set(activeTopic.nodes.map(n => n.id));

      // Step 7: Format new edges
      const newEdgesFormatted = pendingMapUpdate.newEdges
        .map(edge => {
          let sourceId = edge.source;
          let targetId = edge.target;

          if (edge.source.startsWith('new-')) {
            sourceId = newIdMap.get(edge.source) || edge.source;
          }

          if (edge.target.startsWith('new-')) {
            targetId = newIdMap.get(edge.target) || edge.target;
          }

          const sourceExists = existingNodeIds.has(sourceId) || newIdMap.has(edge.source);
          const targetExists = existingNodeIds.has(targetId) || newIdMap.has(edge.target);

          if (!sourceExists || !targetExists) {
            console.warn('⚠️ Skipping invalid edge:', edge);
            return null;
          }

          return {
            id: `edge-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            source: sourceId,
            target: targetId,
            label: edge.label,
            type: 'editableEdge',
            animated: true,
            style: { 
              stroke: '#3b82f6',
              strokeWidth: 2,
              fill: 'none'
            },
            markerEnd: { 
              type: 'arrowclosed' as const, 
              color: '#3b82f6' 
            },
            data: {
              onUpdateEdge: handleUpdateEdge,
              onDeleteEdge: handleDeleteEdge,
              isNew: true,
            },
          };
        })
        .filter(edge => edge !== null);

      console.log('✅ Formatted nodes and edges');

      // Step 8: Merge nodes and edges
      const mergedNodes = [...activeTopic.nodes, ...newNodesFormatted];
      const mergedEdges = [...activeTopic.edges, ...newEdgesFormatted];

      // Step 9: Apply Dagre layout to entire graph for clean positioning
      const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
        mergedNodes,
        mergedEdges
      );

      // Step 10: Update React Flow state and topic with layouted graph
      setNodes(layoutedNodes);
      setEdges(layoutedEdges);

      const updatedTopics = topicChats.map(topic =>
        topic.id === activeTopicId
          ? {
              ...topic,
              nodes: layoutedNodes,
              edges: layoutedEdges,
              updatedAt: new Date().toISOString()
            }
          : topic
      );

      setTopicChats(updatedTopics);

      // Force save to localStorage
      try {
        localStorage.setItem(TOPIC_CHATS_KEY, JSON.stringify(updatedTopics));
        console.log('✅ Saved map update to localStorage');
        setTimeout(() => verifyLocalStorageSave(), 100);
      } catch (error) {
        console.error('❌ Failed to save to localStorage:', error);
        toast.error('Failed to save changes');
      }

      setShowAddToMapPrompt(false);
      setPendingMapUpdate(null);

      toast.success('Map updated!', {
        description: `Added ${newNodesFormatted.length} new concept${newNodesFormatted.length !== 1 ? 's' : ''}`,
      });

      // Remove highlight after 12 seconds
      setTimeout(() => {
        const nodesWithoutHighlight = layoutedNodes.map(node => ({
          ...node,
          data: {
            ...node.data,
            isNew: false
          }
        }));
        const edgesWithoutHighlight = layoutedEdges.map(edge => ({
          ...edge,
          style: { stroke: '#64748b', strokeWidth: 2 },
          markerEnd: { type: 'arrowclosed' as const, color: '#64748b' },
          data: {
            ...edge.data,
            isNew: false
          }
        }));

        setNodes(nodesWithoutHighlight);
        setEdges(edgesWithoutHighlight);

        setTopicChats(prev => prev.map(topic =>
          topic.id === activeTopicId
            ? {
                ...topic,
                nodes: nodesWithoutHighlight,
                edges: edgesWithoutHighlight
              }
            : topic
        ));
      }, 12000);

    } catch (error) {
      console.error('❌ Error merging nodes:', error);
      toast.error('Failed to update map', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }, [pendingMapUpdate, activeTopicId, activeTopic, handleUpdateNode, handleDeleteNode, handleUpdateEdge, handleDeleteEdge, topicChats, verifyLocalStorageSave, setNodes, setEdges, setTopicChats]);

  return {
    showAddToMapPrompt,
    setShowAddToMapPrompt,
    pendingMapUpdate,
    setPendingMapUpdate,
    isLoadingMapUpdate,
    setIsLoadingMapUpdate,
    handleConfirmMapUpdate,
  };
};


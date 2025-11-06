import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { Node, Edge } from '@xyflow/react';
import { TopicChat } from '@/types/concept-map-types';
import { calculateOptimalStartPosition, clusterRelatedNodes, findEmptySpace } from '@/utils/node-positioning';
import { Position } from '@xyflow/react';

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
            pathOptions: {
              offset: 20,
              borderRadius: 10,
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

      // Step 8: Calculate smart positions for new nodes WITHOUT re-layouting existing ones
      console.log('📍 Positioning new nodes intelligently...');

      // Helper: Find position for a new node based on its connections
      const calculateSmartPosition = (newNode: Node, newEdges: Edge[], existingNodes: Node[]) => {
        // Find which existing nodes this new node connects to
        const connectedNodeIds = newEdges
          .filter(e => e.source === newNode.id || e.target === newNode.id)
          .map(e => {
            if (e.source === newNode.id && existingNodeIds.has(e.target)) return e.target;
            if (e.target === newNode.id && existingNodeIds.has(e.source)) return e.source;
            return null;
          })
          .filter(Boolean);

        if (connectedNodeIds.length > 0) {
          // Position near connected nodes (average position + offset)
          const connectedNodes = existingNodes.filter(n => connectedNodeIds.includes(n.id));
          const avgX = connectedNodes.reduce((sum, n) => sum + n.position.x, 0) / connectedNodes.length;
          const avgY = connectedNodes.reduce((sum, n) => sum + n.position.y, 0) / connectedNodes.length;
          
          // Offset to the right and slightly down to avoid overlap
          const offsetX = 300; // Position to the right
          const offsetY = Math.random() * 100 - 50; // Random vertical offset (-50 to +50)
          
          console.log(`  📌 "${newNode.data.label}" positioned near connected nodes`);
          
          return {
            x: avgX + offsetX,
            y: avgY + offsetY
          };
        } else {
          // No connections to existing nodes - position at bottom center
          const maxY = Math.max(...existingNodes.map(n => n.position.y), 0);
          const centerX = existingNodes.reduce((sum, n) => sum + n.position.x, 0) / existingNodes.length;
          
          console.log(`  📌 "${newNode.data.label}" positioned at bottom (no connections)`);
          
          return {
            x: centerX,
            y: maxY + 200
          };
        }
      };

      // Position each new node
      const positionedNewNodes = newNodesFormatted.map((newNode: Node) => {
        const position = calculateSmartPosition(newNode, newEdgesFormatted, activeTopic.nodes);
        
        return {
          ...newNode,
          position
        };
      });

      // Check for overlaps with existing nodes and adjust if needed
      const adjustForOverlaps = (newNodes: Node[], existingNodes: Node[]) => {
        const MIN_DISTANCE = 150; // Minimum distance between nodes
        
        return newNodes.map(newNode => {
          const adjustedPosition = { ...newNode.position };
          let attempts = 0;
          const MAX_ATTEMPTS = 10;
          
          while (attempts < MAX_ATTEMPTS) {
            // Check if too close to any existing node
            const tooClose = existingNodes.some(existing => {
              const dx = adjustedPosition.x - existing.position.x;
              const dy = adjustedPosition.y - existing.position.y;
              const distance = Math.sqrt(dx * dx + dy * dy);
              return distance < MIN_DISTANCE;
            });
            
            if (!tooClose) break;
            
            // Move down and slightly right if overlapping
            adjustedPosition.y += 100;
            adjustedPosition.x += 50;
            attempts++;
          }
          
          if (attempts > 0) {
            console.log(`  🔧 Adjusted "${newNode.data.label}" position to avoid overlap`);
          }
          
          return {
            ...newNode,
            position: adjustedPosition
          };
        });
      };

      const finalNewNodes = adjustForOverlaps(positionedNewNodes, activeTopic.nodes);

      // Step 9: Merge nodes WITHOUT re-layout
      const mergedNodes = [...activeTopic.nodes, ...finalNewNodes];
      const mergedEdges = [...activeTopic.edges, ...newEdgesFormatted];

      console.log('✅ Merged nodes intelligently positioned:', {
        existingNodes: activeTopic.nodes.length,
        newNodes: finalNewNodes.length,
        totalNodes: mergedNodes.length,
        totalEdges: mergedEdges.length
      });

      // Step 10: Update state directly (NO Dagre re-layout)
      setNodes(mergedNodes);
      setEdges(mergedEdges);

      const updatedTopics = topicChats.map(topic =>
        topic.id === activeTopicId
          ? {
              ...topic,
              nodes: mergedNodes,
              edges: mergedEdges,
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
        const nodesWithoutHighlight = mergedNodes.map(node => ({
          ...node,
          data: {
            ...node.data,
            isNew: false
          }
        }));
        const edgesWithoutHighlight = mergedEdges.map(edge => ({
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
      }, 5000);

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


"use client";

import React, { useState, useCallback, useEffect, useRef, useMemo } from "react";
import { Navbar } from "@/components/navbar";
import { Edge, Node, useNodesState, useEdgesState, Position, ReactFlowInstance } from '@xyflow/react';
import {
  Edit3, 
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Toaster, toast } from 'sonner';

// Import extracted components
import { 
  ConceptMapVisualization, 
  ChatInterface, 
  NotesInput,
  TopicsSidebar,
  MapUpdateConfirmationModal,
  WelcomeScreen,
} from '@/components/concept-map';

// Import types and utilities
import { LoadingState } from '@/types/concept-map-types';
import { getLayoutedElements } from '@/utils/layout';

// Import custom hooks
import { useTopicManagement } from '@/hooks/useTopicManagement';
import { useMapOperations } from '@/hooks/useMapOperations';
import { useConceptMapGeneration } from '@/hooks/useConceptMapGeneration';
import { useChatHandlers } from '@/hooks/useChatHandlers';
import { useMapUpdate } from '@/hooks/useMapUpdate';
import { useTour } from '@/hooks/useTour';

const flowKey = 'biobuddy-concept-map-flow';
const TOPIC_CHATS_KEY = 'biobuddy-topic-chats';

// Debug helper for localStorage
if (typeof window !== 'undefined') {
  (window as Window & { debugStorage?: () => void }).debugStorage = () => {
    const saved = localStorage.getItem(TOPIC_CHATS_KEY);
    console.log('=== STORAGE DEBUG ===');
    console.log('Raw data:', saved);
    console.log('Parsed:', JSON.parse(saved || '[]'));
    console.log('Size:', new Blob([saved || '']).size, 'bytes');
  };
}

export default function MapPage() {

  

  // Basic UI state
  const [inputText, setInputText] = useState("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [isLeftPanelCollapsed, setIsLeftPanelCollapsed] = useState(false);
  const [showSuccessBanner, setShowSuccessBanner] = useState(true);
  const [chatInput, setChatInput] = useState("");
  const [isChatMode, setIsChatMode] = useState(true);
  const [isRestoringFromStorage, setIsRestoringFromStorage] = useState(true);
  const [isRegeneratingMap, setIsRegeneratingMap] = useState(false);
  const [forceRegenerateMap, setForceRegenerateMap] = useState(false);
  const lastToastedMapHashRef = useRef<string>('');
  const [autoGenerateMap, setAutoGenerateMap] = useState(true);

  // Topic management
  const {
    topicChats,
    setTopicChats,
    activeTopicId,
    activeTopic,
    handleCreateTopic,
    handleSwitchTopic,
    handleDeleteTopic,
    handleClearChat,
  } = useTopicManagement();

  // React Flow state
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [rfInstance, setRfInstance] = useState<ReactFlowInstance | null>(null);

  // Derived state
  const chatMessages = useMemo(() => activeTopic?.messages || [], [activeTopic?.messages]);
  const conceptMapData = activeTopic?.conceptMapData || null;
  const loadingState = activeTopic?.loadingState || 'idle';

  // Map operations hook
  const {
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
  } = useMapOperations(nodes, edges, setNodes, setEdges);

  // Create wrapped handlers
  const wrappedOnNodesChange = useMemo(
    () => createWrappedOnNodesChange(onNodesChange),
    [createWrappedOnNodesChange, onNodesChange]
  );
  const wrappedOnEdgesChange = useMemo(
    () => createWrappedOnEdgesChange(onEdgesChange),
    [createWrappedOnEdgesChange, onEdgesChange]
  );

  // Concept map generation hook
  const { generateConceptMapFromText, handleGenerateMap } = useConceptMapGeneration({
    activeTopicId,
    setTopicChats,
    inputText,
  });

  // Map update hook
  const {
    showAddToMapPrompt,
    setShowAddToMapPrompt,
    pendingMapUpdate,
    setPendingMapUpdate,
    isLoadingMapUpdate,
    setIsLoadingMapUpdate,
    handleConfirmMapUpdate,
  } = useMapUpdate({
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
  });

  // Chat handlers hook
  const {
    isChatLoading,
    loadingBetterImages,
    handleSendChatMessage,
    handleRefineMessage,
    handleSearchBetterImages,
  } = useChatHandlers({
    activeTopicId,
    activeTopic,
    setTopicChats,
    chatMessages,
    autoGenerateMap,
    generateConceptMapFromText,
    setShowSuccessBanner,
    setPendingMapUpdate,
    setShowAddToMapPrompt,
    setIsLoadingMapUpdate,
  });

  // Tour hook
  const { hasSeenTour, hasSeenPart1, hasSeenPart2, startInitialTour, startMapTour, startFullTour } = useTour();

  // Refs for tracking state
  const prevActiveTopicIdRef = useRef<string | null>(null);
  const processedConceptMapRef = useRef<string | null>(null);

  // Sync nodes and edges when active topic ID changes
  useEffect(() => {
    const previousTopicId = prevActiveTopicIdRef.current;
    
    if (activeTopicId !== previousTopicId) {
      console.log('🔄 TOPIC SWITCH:', {
        from: previousTopicId,
        to: activeTopicId
      });
      
      // Set flag to prevent corruption during switch
      isProgrammaticChangeRef.current = true;
      
      const newTopic = topicChats.find(t => t.id === activeTopicId);
      
      if (newTopic) {
        console.log('📂 Loading topic:', {
          name: newTopic.name,
          nodes: newTopic.nodes?.length || 0,
          edges: newTopic.edges?.length || 0,
          nodeIds: newTopic.nodes?.slice(0, 3).map(n => n.id) || []
        });
        
        // CRITICAL: Clear first to ensure no stale data
        setNodes([]);
        setEdges([]);
        
        // Load new data in next tick
        setTimeout(() => {
          setNodes(newTopic.nodes || []);
          setEdges(newTopic.edges || []);
          
          console.log('✅ Topic loaded successfully');
          
          // Clear flag after data is set
          setTimeout(() => {
            isProgrammaticChangeRef.current = false;
            console.log('🔓 Programmatic flag cleared - user edits now allowed');
          }, 100);
        }, 0);
        
      } else {
        console.warn('⚠️ Topic not found:', activeTopicId);
        setNodes([]);
        setEdges([]);
        
        setTimeout(() => {
          isProgrammaticChangeRef.current = false;
        }, 100);
      }
      
      prevActiveTopicIdRef.current = activeTopicId;
      
      // CRITICAL: Reset processedConceptMapRef to allow new map to load
      processedConceptMapRef.current = null;
    }
  }, [activeTopicId, topicChats, setNodes, setEdges, isProgrammaticChangeRef]);

  // Update active topic when nodes or edges change (with corruption prevention)
  useEffect(() => {
    if (!activeTopicId) return;
    
    // CRITICAL: Don't save if we're in the middle of a topic switch
    if (isProgrammaticChangeRef.current) {
      console.log('⏸️ Skipping save - programmatic change in progress');
      return;
    }
    
    // CRITICAL: Verify that the current nodes/edges actually belong to this topic
    // by checking if they match what's in topicChats
    setTopicChats(prev => {
      const topic = prev.find(t => t.id === activeTopicId);
      if (!topic) {
        console.warn('⚠️ No topic found for activeTopicId:', activeTopicId);
        return prev;
      }
      
      // Get current state
      const currentNodes = nodes;
      const currentEdges = edges;
      const topicNodes = topic.nodes || [];
      const topicEdges = topic.edges || [];
      
      // Check if nodes actually changed
      const nodesChanged = JSON.stringify(topicNodes) !== JSON.stringify(currentNodes);
      const edgesChanged = JSON.stringify(topicEdges) !== JSON.stringify(currentEdges);
      
      if (!nodesChanged && !edgesChanged) {
        return prev; // No changes, don't update
      }
      
      // VALIDATION: Check if this looks like a corruption scenario
      // If we're about to save data that looks very different (different node IDs),
      // it might be stale data from another topic
      const topicNodeIds = new Set(topicNodes.map(n => n.id));
      const currentNodeIds = new Set(currentNodes.map(n => n.id));
      
      // Calculate overlap
      const matchingIds = [...currentNodeIds].filter(id => topicNodeIds.has(id));
      const overlapPercent = topicNodeIds.size > 0 
        ? (matchingIds.length / topicNodeIds.size) * 100 
        : 100;
      
      // If less than 50% of node IDs match, this is likely stale data
      if (topicNodeIds.size > 0 && currentNodeIds.size > 0 && overlapPercent < 50) {
        console.error('🚨 CORRUPTION DETECTED - Blocking save!', {
          topicName: topic.name,
          topicNodeCount: topicNodeIds.size,
          currentNodeCount: currentNodeIds.size,
          overlapPercent: overlapPercent.toFixed(1) + '%',
          topicNodeIds: Array.from(topicNodeIds).slice(0, 5),
          currentNodeIds: Array.from(currentNodeIds).slice(0, 5)
        });
        
        // DON'T save - this is corruption
        return prev;
      }
      
      console.log('💾 Syncing user changes to topic:', {
        topicName: topic.name,
        nodeChange: `${topicNodeIds.size} → ${currentNodeIds.size}`,
        edgeChange: `${topicEdges.length} → ${currentEdges.length}`,
        overlapPercent: overlapPercent.toFixed(1) + '%'
      });
      
      return prev.map(t => 
        t.id === activeTopicId
          ? { ...t, nodes: currentNodes, edges: currentEdges, updatedAt: new Date().toISOString() }
          : t
      );
    });
  }, [nodes, edges, activeTopicId, setTopicChats, isProgrammaticChangeRef]);

  // Convert conceptMapData to ReactFlow nodes/edges when it changes
  useEffect(() => {
    if (!conceptMapData || !conceptMapData.nodes || !conceptMapData.edges) {
      return;
    }

    // CRITICAL: Check against topic's saved nodes
    const topic = topicChats.find(t => t.id === activeTopicId);
    const savedNodeCount = topic?.nodes?.length || 0;
    
    // Allow regeneration to bypass protection
    if (forceRegenerateMap) {
      console.log('🔄 FORCE REGENERATE - bypassing protection to create unified map', {
        savedNodes: savedNodeCount,
        newConceptMapNodes: conceptMapData.nodes.length
      });
      setForceRegenerateMap(false); // Reset flag
    } else if (savedNodeCount > conceptMapData.nodes.length) {
      console.log('⏭️ SKIPPING conceptMapData conversion - preserving topic map:', {
        savedNodes: savedNodeCount,
        conceptMapNodes: conceptMapData.nodes.length
      });
      return;
    }

    // Don't overwrite if we already have more nodes
    if (nodes.length > conceptMapData.nodes.length) {
      console.log('⏭️ SKIPPING conceptMapData conversion - preserving current map:', {
        currentNodes: nodes.length,
        conceptMapNodes: conceptMapData.nodes.length
      });
      return;
    }

    const conceptMapHash = `${conceptMapData.nodes.length}-${conceptMapData.edges.length}-${activeTopicId}`;
    if (processedConceptMapRef.current === conceptMapHash) {
      return;
    }

    console.log('🔄 Converting conceptMapData to ReactFlow format...', {
      conceptMapNodes: conceptMapData.nodes.length,
      currentNodes: nodes.length,
      savedNodes: savedNodeCount
    });
    
    const reactFlowNodes: Node[] = conceptMapData.nodes.map((node) => ({
      id: node.id,
      type: 'conceptNode',
      position: { x: 0, y: 0 },
      data: {
        label: node.label,
        type: node.type,
        onUpdateNode: handleUpdateNode,
        onDeleteNode: handleDeleteNode,
      },
    }));

    const reactFlowEdges: Edge[] = conceptMapData.edges.map((edge, index) => ({
      id: `edge-${edge.source}-${edge.target}-${index}`,
      source: edge.source,
      target: edge.target,
      label: edge.label,
      type: 'editableEdge',
      animated: true,
      style: { 
        stroke: '#64748b', 
        strokeWidth: 2,
      },
      markerEnd: {
        type: 'arrowclosed',
        color: '#64748b',
      },
      pathOptions: {
        offset: 20,
        borderRadius: 10,
      },
      data: {
        onUpdateEdge: handleUpdateEdge,
        onDeleteEdge: handleDeleteEdge,
      },
    }));

    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
      reactFlowNodes,
      reactFlowEdges
    );

    console.log('✅ Layout complete, setting nodes/edges');
    
    isProgrammaticChangeRef.current = true;
    setNodes(layoutedNodes);
    setEdges(layoutedEdges);
    setTimeout(() => { isProgrammaticChangeRef.current = false; }, 0);
    
    processedConceptMapRef.current = conceptMapHash;
  }, [conceptMapData, activeTopicId, nodes.length, topicChats, forceRegenerateMap, handleUpdateNode, handleDeleteNode, handleUpdateEdge, handleDeleteEdge, setNodes, setEdges, isProgrammaticChangeRef]);

  // Debug function to check state
  useEffect(() => {
    console.log('🔍 STATE CHECK:', {
      activeTopicId,
      activeTopicName: activeTopic?.name,
      topicNodesInState: activeTopic?.nodes.length || 0,
      topicEdgesInState: activeTopic?.edges.length || 0,
      renderedNodes: nodes.length,
      renderedEdges: edges.length,
      conceptMapDataNodes: conceptMapData?.nodes.length || 0
    });
  }, [activeTopicId, activeTopic, nodes.length, edges.length, conceptMapData]);

  // Data integrity check - log topic data on mount and after changes
  useEffect(() => {
    if (topicChats.length === 0) return;
    
    console.log('📊 TOPIC DATA INTEGRITY CHECK:', 
      topicChats.map(topic => ({
        id: topic.id,
        name: topic.name,
        nodes: topic.nodes?.length || 0,
        edges: topic.edges?.length || 0,
        sampleNodeIds: topic.nodes?.slice(0, 3).map(n => n.id) || [],
        updated: topic.updatedAt
      }))
    );
  }, [topicChats]);

  // Load topics from localStorage with validation (runs once on mount)
  useEffect(() => {
    try {
      const stored = localStorage.getItem(TOPIC_CHATS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        
        console.log('📥 Loading from localStorage:', {
          topicCount: parsed.length,
          topics: parsed.map((t: any) => ({
            name: t.name,
            nodes: t.nodes?.length || 0,
            edges: t.edges?.length || 0
          }))
        });
        
        // Validate data structure
        const validTopics = parsed.filter((topic: any) => {
          const isValid = topic.id && topic.name && Array.isArray(topic.messages);
          if (!isValid) {
            console.warn('⚠️ Invalid topic found, skipping:', topic);
          }
          return isValid;
        });
        
        if (validTopics.length !== parsed.length) {
          console.warn('⚠️ Some topics were invalid and removed');
        }
        
        // Note: Topics are already loaded by useTopicManagement hook
        // This validation just logs warnings if corruption is detected
        console.log('✅ Topics loaded successfully');
      }
    } catch (error) {
      console.error('❌ Failed to load from localStorage:', error);
      // Clear corrupted data
      localStorage.removeItem(TOPIC_CHATS_KEY);
    }
  }, []); // Run only once on mount


  // Trigger Part 1 of tour for first-time users
  useEffect(() => {
    if (!hasSeenPart1 && activeTopicId) {
      const timer = setTimeout(() => {
        startInitialTour();
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [hasSeenPart1, startInitialTour, activeTopicId]);

  // Trigger Part 2 when first map loads (after Part 1 is complete)
  useEffect(() => {
    if (hasSeenPart1 && !hasSeenPart2 && nodes.length > 0 && loadingState === 'success') {
      console.log('🎉 First map loaded! Starting Part 2 of tour...');
      const timer = setTimeout(() => {
        startMapTour();
      }, 1500); // Small delay to let map render
      
      return () => clearTimeout(timer);
    }
  }, [hasSeenPart1, hasSeenPart2, nodes.length, loadingState, startMapTour]);

  // Close modal on ESC key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showAddToMapPrompt) {
        setShowAddToMapPrompt(false);
        setPendingMapUpdate(null);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [showAddToMapPrompt, setPendingMapUpdate, setShowAddToMapPrompt]);

  // Show success banner
  useEffect(() => {
    if (loadingState === 'success') {
      setShowSuccessBanner(true);
      const timer = setTimeout(() => {
        setShowSuccessBanner(false);
      }, 10000);
      
      return () => clearTimeout(timer);
    }
  }, [loadingState]);

  // Handle text change
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(e.target.value);
    if (loadingState !== 'idle' && activeTopicId) {
      setTopicChats(prev => prev.map(topic =>
        topic.id === activeTopicId
          ? { ...topic, loadingState: 'idle' as LoadingState, conceptMapData: null, updatedAt: new Date().toISOString() }
          : topic
      ));
      setErrorMessage("");
    }
  };

  // Handle regenerate mindmap
  const handleRegenerateMindmap = useCallback(async () => {
    if (!activeTopic || chatMessages.length === 0) {
      toast.error('No conversation to regenerate map from');
      return;
    }
    
    console.log('🔄 Regenerating mindmap with ALL concepts (original + merged)');
    setIsRegeneratingMap(true);
    setForceRegenerateMap(true); // Bypass protection
    
    try {
      // Step 1: Gather ALL information from conversation
      const allAssistantMessages = chatMessages
        .filter(msg => msg.role === 'assistant')
        .map(msg => msg.content)
        .join('\n\n');
      
      if (!allAssistantMessages) {
        toast.error('No AI responses to regenerate from');
        setForceRegenerateMap(false);
        return;
      }
      
      // Step 2: Extract all unique concepts from current nodes (including merged ones)
      const currentConcepts = activeTopic.nodes.map(node => {
        const label = (node.data as { label?: string })?.label || '';
        const type = (node.data as { type?: string })?.type || 'concept';
        return { label, type };
      }).filter(c => c.label);
      
      console.log('📊 Regenerating with:', {
        aiMessagesLength: allAssistantMessages.length,
        currentNodeCount: currentConcepts.length,
        conceptsList: currentConcepts.map(c => c.label)
      });
      
      // Step 3: Create enhanced prompt for Claude
      const enhancedPrompt = `${allAssistantMessages}



IMPORTANT: The student has been studying this topic and has added additional concepts to their map. Please create a comprehensive concept map that includes ALL of these concepts with proper relationships:



Current concepts on the map:

${currentConcepts.map(c => `- ${c.label} (${c.type})`).join('\n')}



Please regenerate the concept map with:

1. All the concepts listed above

2. Proper hierarchical relationships between them

3. Clear, educational connections

4. A clean, organized structure



Make sure EVERY concept from the list above is included in the new map.`;

      console.log('🤖 Sending enhanced prompt to generate unified map');
      
      // Step 4: Generate new map with all concepts
      await generateConceptMapFromText(enhancedPrompt);
      
      toast.success('Mindmap regenerated with all concepts!', {
        description: `Restructured ${currentConcepts.length} concepts with better organization`
      });
      
    } catch (error) {
      console.error("❌ Error regenerating mindmap:", error);
      setForceRegenerateMap(false); // Reset on error
      
      toast.error('Failed to regenerate mindmap', {
        description: error instanceof Error ? error.message : 'Unknown error',
        action: {
          label: 'Retry',
          onClick: () => handleRegenerateMindmap()
        },
        duration: 5000,
      });
    } finally {
      setIsRegeneratingMap(false);
    }
  }, [chatMessages, activeTopic, generateConceptMapFromText]);

  // Wrapper function to clear chat and also reset React Flow state
  const handleClearChatWithMapReset = useCallback(() => {
    // Clear topic data
    handleClearChat();
    
    // Also clear React Flow state immediately
    setNodes([]);
    setEdges([]);
    
    console.log('🗑️ Cleared React Flow state');
  }, [handleClearChat, setNodes, setEdges]);

  // Show toast notification when a NEW mindmap is generated
  useEffect(() => {
    if (isRestoringFromStorage) return;
    if (!isChatMode) return;
    if (loadingState !== 'success') return;
    if (!conceptMapData) return;
  
    const conceptNodeIds = conceptMapData.nodes.map(n => n.id).sort().join(',');
    const currentMapHash = `${conceptMapData.nodes.length}-${conceptMapData.edges.length}-${conceptNodeIds}`;
    
    if (currentMapHash === lastToastedMapHashRef.current) return;
  

    //For now, we don't need to show this toast
    // const timeoutId = setTimeout(() => {
    //   toast('Mindmap too confusing? Click regenerate', {
    //     description: 'You can try a different structure by regenerating the map.',
    //     position: 'bottom-right',
    //     duration: 8000,
    //     action: { label: 'Regenerate', onClick: () => handleRegenerateMindmap() },
    //     className: 'bg-amber-50 text-amber-900 border border-amber-200',
    //     style: {
    //       backgroundColor: 'rgba(35, 117, 224, 0.9)',
    //       color: '#ffffff',
    //       borderRadius: '10px',
    //       fontSize: '16px',
    //       fontWeight: 'bold',
    //       textAlign: 'left',
    //     },
    //   });
    // }, 1000);
  
    // lastToastedMapHashRef.current = currentMapHash;
    
    // return () => clearTimeout(timeoutId);
  }, [isRestoringFromStorage, isChatMode, loadingState, conceptMapData, handleRegenerateMindmap]);

  // Handle import JSON
  interface ImportedNode {
    id: string;
    position?: { x: number; y: number };
    label: string;
    type?: string;
  }

  interface ImportedEdge {
    id: string;
    source: string;
    target: string;
    label?: string;
  }

  interface ImportedData {
    nodes: ImportedNode[];
    edges: ImportedEdge[];
  }

  const handleImportJSON = useCallback((importedData: unknown) => {
    try {
      console.log('📥 Importing JSON data:', importedData);
      
      const data = importedData as ImportedData;
      
      if (!data.nodes || !data.edges) {
        throw new Error('Invalid JSON format: missing nodes or edges');
      }
      
      if (!Array.isArray(data.nodes) || !Array.isArray(data.edges)) {
        throw new Error('Invalid JSON format: nodes and edges must be arrays');
      }
      
      const importedNodes = data.nodes.map((node: ImportedNode) => ({
        id: node.id,
        type: 'conceptNode',
        position: node.position || { x: 0, y: 0 },
        data: {
          label: node.label,
          type: node.type || 'default',
          onUpdateNode: handleUpdateNode,
          onDeleteNode: handleDeleteNode,
        },
        targetPosition: Position.Top,
        sourcePosition: Position.Bottom,
      }));
      
      const importedEdges = data.edges.map((edge: ImportedEdge) => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        label: edge.label || '',
        type: 'editableEdge',
        animated: true,
        style: { stroke: '#64748b', strokeWidth: 2 },
        markerEnd: { type: 'arrowclosed' as const, color: '#64748b' },
        pathOptions: {
          offset: 20,
          borderRadius: 10,
        },
        data: {
          onUpdateEdge: handleUpdateEdge,
          onDeleteEdge: handleDeleteEdge,
        },
      } as Edge));
      
      console.log(`✅ Imported ${importedNodes.length} nodes and ${importedEdges.length} edges`);
      
      if (activeTopicId) {
        setTopicChats(prev => prev.map(topic =>
          topic.id === activeTopicId
            ? { ...topic, nodes: importedNodes, edges: importedEdges, loadingState: 'success' as LoadingState, updatedAt: new Date().toISOString() }
            : topic
        ));
      }
      
      toast.success('Concept map imported successfully!', {
        description: `Loaded ${importedNodes.length} nodes and ${importedEdges.length} edges`,
      });
      
    } catch (error) {
      console.error('❌ Error importing JSON:', error);
      toast.error('Failed to import JSON file', {
        description: error instanceof Error ? error.message : 'Invalid file format. Please select a valid concept map JSON file.',
        duration: 5000,
      });
    }
  }, [handleUpdateNode, handleDeleteNode, handleUpdateEdge, handleDeleteEdge, activeTopicId, setTopicChats]);

  const onSave = useCallback(() => {
    if (rfInstance) {
      const flow = rfInstance.toObject();
      localStorage.setItem(flowKey, JSON.stringify(flow));
      console.log('💾 Concept map saved to localStorage');
    }
  }, [rfInstance]);

  const onRestore = useCallback(() => {
    console.log('🔄 onRestore called - topic-based system handles restoration automatically');
    setIsRestoringFromStorage(false);
  }, []);

  // Auto-save to localStorage whenever nodes or edges change
  useEffect(() => {
    if (rfInstance && (nodes.length > 0 || edges.length > 0)) {
      onSave();
    }
  }, [nodes, edges, rfInstance, onSave]);

  // Ctrl/Cmd + Z keyboard shortcut for undo, Ctrl/Cmd + Shift + Z for redo
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const tag = target?.tagName?.toLowerCase();
      const isEditable = (target as HTMLElement)?.isContentEditable ?? false;
      if (tag === 'input' || tag === 'textarea' || isEditable) return;
      
      const isCtrlOrCmd = e.ctrlKey || e.metaKey;
      const isShift = e.shiftKey;
      const isZ = e.key === 'z' || e.key === 'Z';
      
      if (isCtrlOrCmd && isZ) {
        e.preventDefault();
        if (isShift) {
          handleRedo();
        } else {
          handleUndo();
        }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handleUndo, handleRedo]);

  // Restore concept map from localStorage on mount
  useEffect(() => {
    const restoreData = async () => {
      await onRestore();
      setTimeout(() => {
        setIsRestoringFromStorage(false);
      }, 300);
    };
    
    restoreData();
  }, [onRestore]);


  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-900">
      <Toaster 
        position="top-center" 
        richColors 
        closeButton
        toastOptions={{
          className: 'text-sm',
        }}
      />
      
      <TopicsSidebar
        topicChats={topicChats}
        activeTopicId={activeTopicId}
        onCreateTopic={handleCreateTopic}
        onSwitchTopic={handleSwitchTopic}
        onDeleteTopic={handleDeleteTopic}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar />
        
        {!activeTopicId ? (
          <WelcomeScreen onCreateTopic={handleCreateTopic} />
        ) : (
          <main className="flex-1 container mx-auto px-4 py-8 overflow-auto">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                {activeTopic?.name}
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                {activeTopic?.messages.length || 0} messages • Updated {activeTopic?.updatedAt ? new Date(activeTopic.updatedAt).toLocaleDateString() : 'recently'}
              </p>
            </div>
            
            <div className={`grid grid-cols-1 gap-8 h-[calc(100vh-280px)] transition-all duration-300 ${
              isLeftPanelCollapsed ? 'lg:grid-cols-[60px_1fr]' : 'lg:grid-cols-2'
            }`}>
              <div className={`bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 flex flex-col transition-all duration-300 relative h-svh ${
                isLeftPanelCollapsed ? 'p-2' : 'p-6'
              }`}>
                <button
                  onClick={() => setIsLeftPanelCollapsed(!isLeftPanelCollapsed)}
                  className="absolute top-4 right-2 z-10 p-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg transition-colors"
                  aria-label={isLeftPanelCollapsed ? "Expand panel" : "Collapse panel"}
                  title={isLeftPanelCollapsed ? "Expand panel" : "Collapse panel"}
                >
                  {isLeftPanelCollapsed ? (
                    <ChevronRight className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                  ) : (
                    <ChevronLeft className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                  )}
                </button>
                
                {!isLeftPanelCollapsed ? (
                  <>
                    {!isChatMode ? (
                      <NotesInput
                        inputText={inputText}
                        onTextChange={handleTextChange}
                        onGenerateMap={() => handleGenerateMap(inputText)}
                        loadingState={loadingState}
                        isChatMode={isChatMode}
                        onToggleChatMode={() => setIsChatMode(!isChatMode)}
                        onClearAll={handleClearChatWithMapReset}
                      />
                    ) : (
                      <ChatInterface
                        chatMessages={chatMessages}
                        chatInput={chatInput}
                        setChatInput={setChatInput}
                        onSendMessage={handleSendChatMessage}
                        isChatLoading={isChatLoading}
                        onClearChat={handleClearChatWithMapReset}
                        onToggleChatMode={() => setIsChatMode(!isChatMode)}
                        onRefineMessage={handleRefineMessage}
                        autoGenerateMap={autoGenerateMap}
                        setAutoGenerateMap={setAutoGenerateMap}
                        onSearchBetterImages={handleSearchBetterImages}
                        loadingBetterImages={loadingBetterImages}
                        isLoadingMapUpdate={isLoadingMapUpdate}
                        onCreateNewTopic={handleCreateTopic}
                      />
                    )}
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-slate-400 dark:text-slate-500">
                    <Edit3 className="w-6 h-6 mb-2" />
                    <span className="text-xs writing-mode-vertical text-center">Your Notes & Chat</span>
                  </div>
                )}
              </div>

              <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 p-6 flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                      Concept Map
                    </h2>
                    {!isChatMode && (
                      <span className="text-xs px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded">
                        From Notes
                      </span>
                    )}
                    {isChatMode && (
                      <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded">
                        From AI Chat
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    {isRegeneratingMap ? 'Regenerating...' : loadingState === 'success' ? 'Ready' : loadingState === 'loading' ? 'Generating...' : ''}
                  </div>
                </div>
                
                <ConceptMapVisualization
                  loadingState={loadingState}
                  conceptMapData={conceptMapData}
                  errorMessage={errorMessage}
                  showSuccessBanner={showSuccessBanner}
                  isChatMode={isChatMode}
                  nodes={nodes}
                  edges={edges}
                  onNodesChange={wrappedOnNodesChange}
                  onEdgesChange={wrappedOnEdgesChange}
                  onUpdateNode={handleUpdateNode}
                  onDeleteNode={handleDeleteNode}
                  onConnect={onConnect}
                  onAddNode={handleAddNode}
                  setNodes={setNodesProgrammatic}
                  setEdges={setEdgesProgrammatic}
                  rfInstance={rfInstance}
                  setRfInstance={setRfInstance}
                  onRestore={onRestore}
                  onImportJSON={handleImportJSON}
                  onToggleChatMode={() => setIsChatMode(!isChatMode)}
                  isRestoringFromStorage={isRestoringFromStorage}
                  onRegenerateMindmap={handleRegenerateMindmap}
                  isRegeneratingMap={isRegeneratingMap}
                />
              </div>
            </div>

            <MapUpdateConfirmationModal
              isOpen={showAddToMapPrompt}
              pendingMapUpdate={pendingMapUpdate}
              onClose={() => {
                setShowAddToMapPrompt(false);
                setPendingMapUpdate(null);
              }}
              onConfirm={handleConfirmMapUpdate}
            />
          </main>
        )}
      </div>
    </div>
  );
}

"use client";

import React, { useState, useCallback, useEffect, useRef, useMemo } from "react";
import { Navbar } from "@/components/navbar";
import { addEdge, Connection, Edge, Node, useNodesState, useEdgesState, Position, ReactFlowInstance, NodeChange, EdgeChange } from '@xyflow/react';
import {
  Edit3, 
  ChevronLeft,
  ChevronRight,
  HelpCircle
} from 'lucide-react';
import { Toaster, toast } from 'sonner';

// Import extracted components
import { 
  ConceptMapVisualization, 
  ChatInterface, 
  NotesInput 
} from '@/components/concept-map';
import { SavedMapsDropdown } from '@/components/concept-map/SavedMapsDropdown';
import { SaveMapDialog } from '@/components/concept-map/SaveMapDialog';
import { WelcomeModal } from '@/components/WelcomeModal';

// Import types and utilities
import { ConceptMapResponse, LoadingState, ChatMessage, TopicChat } from '@/types/concept-map-types';
import { shouldGenerateConceptMap } from '@/utils/intent-detection';
import { GoogleImage } from '@/utils/google-images';
import { getLayoutedElements } from '@/utils/layout';

const flowKey = 'biobuddy-concept-map-flow';
const SAVED_MAPS_KEY = 'biobuddy-saved-maps';
const TOPIC_CHATS_KEY = 'biobuddy-topic-chats';
const ACTIVE_TOPIC_KEY = 'biobuddy-active-topic';

interface SavedMap {
  id: string;
  name: string;
  timestamp: string;
  nodes: Node[];
  edges: Edge[];
  chatHistory: ChatMessage[];
}

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





export default function MapPage() {
  const [inputText, setInputText] = useState("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [isLeftPanelCollapsed, setIsLeftPanelCollapsed] = useState(false);
  const [showSuccessBanner, setShowSuccessBanner] = useState(true);
  const [chatInput, setChatInput] = useState("");
  const [isChatMode, setIsChatMode] = useState(true);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [isRestoringFromStorage, setIsRestoringFromStorage] = useState(true);
  const [isRegeneratingMap, setIsRegeneratingMap] = useState(false);
  const lastToastedMapHashRef = useRef<string>('');
  const [savedMaps, setSavedMaps] = useState<SavedMap[]>([]);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [saveMapName, setSaveMapName] = useState('');
  const [showLoadMenu, setShowLoadMenu] = useState(false);
  const [autoGenerateMap, setAutoGenerateMap] = useState(true);
  const [loadingBetterImages, setLoadingBetterImages] = useState<number | null>(null);

  // Topic-based chat system
  const [topicChats, setTopicChats] = useState<TopicChat[]>([]);
  const [activeTopicId, setActiveTopicId] = useState<string | null>(null);

  // Derived state for active topic
  const activeTopic = useMemo(() => 
    topicChats.find(t => t.id === activeTopicId), 
    [topicChats, activeTopicId]
  );
  const chatMessages = useMemo(() => activeTopic?.messages || [], [activeTopic?.messages]);
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const conceptMapData = activeTopic?.conceptMapData || null;
  const loadingState = activeTopic?.loadingState || 'idle';
  const [rfInstance, setRfInstance] = useState<ReactFlowInstance | null>(null);

  // Undo history: store serializable snapshots (strip function callbacks)
  const historyRef = useRef<{ nodes: SerializableNode[]; edges: SerializableEdge[] }[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [historyVersion, setHistoryVersion] = useState(0); // trigger re-render when history changes (setter used, getter unused by design)
  const isProgrammaticChangeRef = useRef(false);
  const nodesRef = useRef<Node[]>(nodes);
  const edgesRef = useRef<Edge[]>(edges);
  const prevActiveTopicIdRef = useRef<string | null>(null);
  const processedConceptMapRef = useRef<string | null>(null);

  useEffect(() => { nodesRef.current = nodes; }, [nodes]);
  useEffect(() => { edgesRef.current = edges; }, [edges]);

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
    if (isProgrammaticChangeRef.current) return; // don't record during programmatic updates
    const snapshot = getStorableSnapshot();
    historyRef.current.push(snapshot);
    setHistoryVersion((v) => v + 1);
  }, [getStorableSnapshot]);

  // restoreFromSnapshot and handleUndo are defined after mutation handlers

  useEffect(() => {
    if (loadingState === 'success') {
      setShowSuccessBanner(true);
      const timer = setTimeout(() => {
        setShowSuccessBanner(false);
      }, 10000);
      
      return () => clearTimeout(timer);
    }
  }, [loadingState]);




  // Load saved maps from localStorage on mount
  useEffect(() => {
    try {
      const savedMapsJson = localStorage.getItem(SAVED_MAPS_KEY);
      if (savedMapsJson) {
        const maps = JSON.parse(savedMapsJson);
        setSavedMaps(maps);
        console.log('📚 Loaded saved maps:', maps.length);
      }
    } catch (error) {
      console.error('Error loading saved maps:', error);
    }
  }, []);

  // Load topic chats from localStorage on mount
  useEffect(() => {
    try {
      const savedTopics = localStorage.getItem(TOPIC_CHATS_KEY);
      const savedActiveId = localStorage.getItem(ACTIVE_TOPIC_KEY);
      
      if (savedTopics) {
        const topics: TopicChat[] = JSON.parse(savedTopics);
        setTopicChats(topics);
        
        // Set active topic (either saved one, or first one, or null)
        if (savedActiveId && topics.find(t => t.id === savedActiveId)) {
          setActiveTopicId(savedActiveId);
        } else if (topics.length > 0) {
          setActiveTopicId(topics[0].id);
        }
        
        console.log('📚 Loaded', topics.length, 'topic chats from localStorage');
      }
    } catch (error) {
      console.error('Error loading topic chats:', error);
    }
  }, []);

  // Auto-save topic chats to localStorage
  useEffect(() => {
    if (topicChats.length > 0) {
      try {
        localStorage.setItem(TOPIC_CHATS_KEY, JSON.stringify(topicChats));
        if (activeTopicId) {
          localStorage.setItem(ACTIVE_TOPIC_KEY, activeTopicId);
        }
      } catch (error) {
        console.error('Error saving topic chats:', error);
      }
    }
  }, [topicChats, activeTopicId]);

  // Sync nodes and edges when active topic ID changes
  useEffect(() => {
    // Only sync when the active topic ID changes, not when the topic object changes
    if (activeTopicId !== prevActiveTopicIdRef.current) {
      const topic = topicChats.find(t => t.id === activeTopicId);
      if (topic) {
        setNodes(topic.nodes || []);
        setEdges(topic.edges || []);
      } else {
        setNodes([]);
        setEdges([]);
      }
      prevActiveTopicIdRef.current = activeTopicId;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTopicId, setNodes, setEdges]);

  // Update active topic when nodes or edges change
  useEffect(() => {
    if (activeTopicId) {
      setTopicChats(prev => prev.map(topic => 
        topic.id === activeTopicId
          ? { ...topic, nodes, edges, updatedAt: new Date().toISOString() }
          : topic
      ));
    }
  }, [nodes, edges, activeTopicId]);

  // Check if user has seen onboarding
  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem('hasSeenOnboarding');
    if (!hasSeenOnboarding) {
      setShowWelcomeModal(true);
    }
  }, []);

  // Close load menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (showLoadMenu && !(e.target as Element).closest('.relative')) {
        setShowLoadMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showLoadMenu]);

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

  const handleAddNode = (label: string, type: string) => {
    pushHistory();
    // For now, add node at center of viewport (0,0)
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
  };

  // Reconstruct nodes/edges from a stored snapshot by reattaching callbacks
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
    const last = historyRef.current.pop()!;
    restoreFromSnapshot(last);
    setHistoryVersion((v) => v + 1);
  }, [restoreFromSnapshot]);

  // Convert conceptMapData to ReactFlow nodes/edges when it changes
  useEffect(() => {
    if (!conceptMapData || !conceptMapData.nodes || !conceptMapData.edges) {
      return;
    }

    // Create a hash of the conceptMapData to avoid processing the same data twice
    const conceptMapHash = `${conceptMapData.nodes.length}-${conceptMapData.edges.length}-${activeTopicId}`;
    if (processedConceptMapRef.current === conceptMapHash) {
      return;
    }

    console.log('🔄 Converting conceptMapData to ReactFlow format...');
    
    // Convert to ReactFlow format
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
      data: {
        onUpdateEdge: handleUpdateEdge,
        onDeleteEdge: handleDeleteEdge,
      },
    }));

    // Apply layout
    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
      reactFlowNodes,
      reactFlowEdges
    );

    console.log('✅ Layout complete, setting nodes/edges');
    
    // Update nodes and edges
    isProgrammaticChangeRef.current = true;
    setNodes(layoutedNodes);
    setEdges(layoutedEdges);
    setTimeout(() => { isProgrammaticChangeRef.current = false; }, 0);
    
    processedConceptMapRef.current = conceptMapHash;
  }, [conceptMapData, activeTopicId, handleUpdateNode, handleDeleteNode, handleUpdateEdge, handleDeleteEdge, setNodes, setEdges]);

  // Reset processed conceptMap ref when switching topics
  useEffect(() => {
    processedConceptMapRef.current = null;
  }, [activeTopicId]);

  const handleSaveMap = useCallback((name: string) => {
    if (!name.trim()) {
      toast.error('Please enter a name for the map');
      return;
    }

    if (nodes.length === 0) {
      toast.error('No map to save');
      return;
    }

    const newMap: SavedMap = {
      id: `map-${Date.now()}`,
      name: name.trim(),
      timestamp: new Date().toISOString(),
      nodes: nodes,
      edges: edges,
      chatHistory: chatMessages,
    };

    const updatedMaps = [...savedMaps, newMap];
    setSavedMaps(updatedMaps);
    
    // Save to localStorage
    try {
      localStorage.setItem(SAVED_MAPS_KEY, JSON.stringify(updatedMaps));
      toast.success('Map saved successfully!', {
        description: `Saved as "${name}"`,
      });
      console.log('💾 Saved map:', name);
    } catch (error) {
      console.error('Error saving map:', error);
      toast.error('Failed to save map', {
        description: 'Storage limit may have been reached',
      });
    }

    setShowSaveDialog(false);
    setSaveMapName('');
  }, [nodes, edges, chatMessages, savedMaps]);

  const handleLoadMap = useCallback((mapId: string) => {
    const mapToLoad = savedMaps.find(m => m.id === mapId);
    
    if (!mapToLoad) {
      toast.error('Map not found');
      return;
    }

    // Reconstruct nodes with callbacks
    const reconstructedNodes = mapToLoad.nodes.map((node: Node) => ({
      ...node,
      data: {
        ...node.data,
        onUpdateNode: handleUpdateNode,
        onDeleteNode: handleDeleteNode,
      }
    }));

    // Reconstruct edges with callbacks
    const reconstructedEdges = mapToLoad.edges.map((edge: Edge) => ({
      ...edge,
      data: {
        ...edge.data,
        onUpdateEdge: handleUpdateEdge,
        onDeleteEdge: handleDeleteEdge,
      }
    }));

    // Update active topic with loaded map data
    if (activeTopicId) {
      setTopicChats(prev => prev.map(topic =>
        topic.id === activeTopicId
          ? {
              ...topic,
              nodes: reconstructedNodes,
              edges: reconstructedEdges,
              messages: mapToLoad.chatHistory || [],
              loadingState: 'success' as LoadingState,
              updatedAt: new Date().toISOString()
            }
          : topic
      ));
    }
    setShowLoadMenu(false);

    toast.success('Map loaded!', {
      description: `Loaded "${mapToLoad.name}"`,
    });

    console.log('📂 Loaded map:', mapToLoad.name);
  }, [savedMaps, handleUpdateNode, handleDeleteNode, handleUpdateEdge, handleDeleteEdge, activeTopicId]);

  const handleDeleteMap = useCallback((mapId: string) => {
    const mapToDelete = savedMaps.find(m => m.id === mapId);
    
    if (!mapToDelete) return;

    const updatedMaps = savedMaps.filter(m => m.id !== mapId);
    setSavedMaps(updatedMaps);

    try {
      localStorage.setItem(SAVED_MAPS_KEY, JSON.stringify(updatedMaps));
      toast.success('Map deleted', {
        description: `Deleted "${mapToDelete.name}"`,
      });
      console.log('🗑️ Deleted map:', mapToDelete.name);
    } catch (error) {
      console.error('Error deleting map:', error);
      toast.error('Failed to delete map');
    }
  }, [savedMaps]);

  // Topic management functions
  const handleCreateTopic = useCallback((name: string) => {
    const newTopic: TopicChat = {
      id: `topic-${Date.now()}`,
      name: name.trim() || 'New Topic',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages: [],
      nodes: [],
      edges: [],
      conceptMapData: null,
      loadingState: 'idle',
    };
    
    setTopicChats(prev => [...prev, newTopic]);
    setActiveTopicId(newTopic.id);
    
    toast.success('New topic created!', {
      description: `Created "${newTopic.name}"`,
    });
    
    console.log('📝 Created new topic:', newTopic.name);
  }, []);

  const handleSwitchTopic = useCallback((topicId: string) => {
    setActiveTopicId(topicId);
    const topic = topicChats.find(t => t.id === topicId);
    if (topic) {
      console.log('🔄 Switched to topic:', topic.name);
    }
  }, [topicChats]);

  const handleDeleteTopic = useCallback((topicId: string) => {
    const topic = topicChats.find(t => t.id === topicId);
    if (!topic) return;
    
    setTopicChats(prev => prev.filter(t => t.id !== topicId));
    
    // If deleting active topic, switch to another
    if (activeTopicId === topicId) {
      const remaining = topicChats.filter(t => t.id !== topicId);
      setActiveTopicId(remaining.length > 0 ? remaining[0].id : null);
    }
    
    toast.success('Topic deleted', {
      description: `Deleted "${topic.name}"`,
    });
    
    console.log('🗑️ Deleted topic:', topic.name);
  }, [topicChats, activeTopicId]);

  const handleRenameTopic = useCallback((topicId: string, newName: string) => {
    setTopicChats(prev => prev.map(topic =>
      topic.id === topicId
        ? { ...topic, name: newName.trim(), updatedAt: new Date().toISOString() }
        : topic
    ));
    
    toast.success('Topic renamed');
  }, []);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(e.target.value);
    // Reset states when user changes input
    if (loadingState !== 'idle' && activeTopicId) {
      setTopicChats(prev => prev.map(topic =>
        topic.id === activeTopicId
          ? { ...topic, loadingState: 'idle' as LoadingState, conceptMapData: null, updatedAt: new Date().toISOString() }
          : topic
      ));
      setErrorMessage("");
    }
  };

  const handleGenerateMap = async () => {
    console.log("🚀 Generate concept map clicked");
    console.log("📝 Input text length:", inputText.length);
    
    // Validate input
    if (inputText.trim().length === 0) {
      console.log("❌ Empty input text");
      return;
    }

    if (inputText.length < 50) {
      toast.error("Notes must be at least 50 characters to generate a meaningful concept map.");
      return;
    }

    if (inputText.length > 10000) {
      toast.error("Notes must be less than 10,000 characters.");
      return;
    }

    // Use the reusable function
    await generateConceptMapFromText(inputText);
  };

  const handleSendChatMessage = async (userMessage: string) => {
    if (!userMessage.trim()) return;

    // Prepare user message (but don't add to state yet)
    const userMsg = { role: 'user' as const, content: userMessage.trim() };
    const updatedChatMessages = [...chatMessages, userMsg];
    
    // Decide whether to generate concept map based on intent (early check)
    const shouldGenerate = autoGenerateMap && shouldGenerateConceptMap(userMessage, updatedChatMessages);

    // Check if there's an unsaved map ONLY if we're going to generate a new map
    if (shouldGenerate && nodes.length > 0 && !savedMaps.some(m => 
      JSON.stringify(m.nodes) === JSON.stringify(nodes) && 
      JSON.stringify(m.edges) === JSON.stringify(edges)
    )) {
      // Prompt to save current map
      const shouldSave = window.confirm(
        'You have an unsaved concept map. Would you like to save it before generating a new one?'
      );
      
      if (shouldSave) {
        // User wants to save, show dialog and exit (message not added yet)
        setShowSaveDialog(true);
        return; // Exit and wait for user to save
      }
    }

    // Update active topic's messages (only if we're proceeding)
    setTopicChats(prev => prev.map(topic =>
      topic.id === activeTopicId
        ? { ...topic, messages: [...topic.messages, userMsg], updatedAt: new Date().toISOString() }
        : topic
    ));
    setChatInput("");
    setIsChatLoading(true);

    try {
      console.log("🤖 Sending chat message to AI:", userMessage);

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage.trim(),
          conversationHistory: updatedChatMessages
        })
      });

      console.log("📊 Chat API Response status:", response.status);

      if (!response.ok) {
        // Try to get error message from response
        let errorMessage = `Request failed with status ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.details || errorMessage;
        } catch {
          // If JSON parsing fails, try text (but don't fail if that fails too)
          try {
            const errorText = await response.text();
            // Only use first 200 chars to avoid huge HTML error pages
            errorMessage = errorText.substring(0, 200) || errorMessage;
          } catch (textError) {
            // Give up and use default message
            console.error('Could not parse error response:', textError);
          }
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log("✅ Chat API Response data:", data);

      if (!data.message) {
        throw new Error('Invalid response format from chat API');
      }

      // Final client-side sanitization
      let sanitizedMessage = data.message;

      // Remove any section headers that might have slipped through
      if (sanitizedMessage.includes('IMAGE_SEARCH_TERMS:') || sanitizedMessage.includes('CONCEPT_MAP:')) {
        console.warn('⚠️ Client-side sanitization needed');
        sanitizedMessage = sanitizedMessage
          .split('IMAGE_SEARCH_TERMS:')[0]
          .split('CONCEPT_MAP:')[0]
          .trim();
      }

      // Add assistant response with images
      setTopicChats(prev => prev.map(topic =>
        topic.id === activeTopicId
          ? { 
              ...topic, 
              messages: [...topic.messages, { 
                role: 'assistant', 
                content: sanitizedMessage,
                images: data.images || [],
                imageSource: 'wikimedia',
                searchTerms: data.searchTerms,
              }], 
              conceptMapData: data.conceptMap || topic.conceptMapData,
              loadingState: 'success' as LoadingState,
              updatedAt: new Date().toISOString()
            }
          : topic
      ));

      console.log("✅ Chat message processed successfully!");

      // shouldGenerate was already determined earlier, no need to recalculate

      if (shouldGenerate) {
        // If Claude provided a concept map, use it directly (already set above)
        if (data.conceptMap && data.conceptMap.nodes && data.conceptMap.edges) {
          console.log('📊 Using concept map from Claude');
          setShowSuccessBanner(true);
          setTimeout(() => setShowSuccessBanner(false), 5000);
        } else {
          // Fallback: generate from explanation if Claude didn't provide concept map
          console.log('⚠️ No concept map in response, generating from explanation');
          await generateConceptMapFromText(data.message);
        }
      } else {
        console.log('⏭️ Skipping concept map generation (follow-up/clarification question)');
        // Keep existing map visible
      }

    } catch (error) {
      console.error("❌ Error sending chat message:", error);
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      // Show toast with retry option
      toast.error('AI chat failed', {
        description: `Sorry, I encountered an error: ${errorMessage}`,
        action: {
          label: 'Retry',
          onClick: () => {
            setTopicChats(prev => prev.map(topic =>
              topic.id === activeTopicId
                ? { ...topic, messages: topic.messages.slice(0, -1), updatedAt: new Date().toISOString() }
                : topic
            ));
            handleSendChatMessage(userMessage);
          }
        },
        duration: 5000,
      });
      
      // Remove the user message since it failed
      setTopicChats(prev => prev.map(topic =>
        topic.id === activeTopicId
          ? { ...topic, messages: topic.messages.slice(0, -1), updatedAt: new Date().toISOString() }
          : topic
      ));
    } finally {
      setIsChatLoading(false);
    }
  };

  const handleRefineMessage = async (messageIndex: number, refinementType: 'simplify' | 'detail' | 'regenerate') => {
    // Get the original user question (AI responses are at odd indices, so user message is index - 1)
    const originalQuestion = chatMessages[messageIndex - 1]?.content;
    
    if (!originalQuestion) {
      console.error('Could not find original question for refinement');
      return;
    }
    
    // For regenerate, replace the existing response instead of adding new messages
    if (refinementType === 'regenerate') {
      console.log('🔄 Regenerating response');
      setIsChatLoading(true);
      
      try {
        // Build conversation history up to but not including the message being regenerated
        const conversationHistory = chatMessages.slice(0, messageIndex - 1);
        
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: originalQuestion,
            conversationHistory
          }),
        });

        if (!response.ok) {
          // Try to get error message from response
          let errorMessage = `Request failed with status ${response.status}`;
          try {
            const errorData = await response.json();
            errorMessage = errorData.error || errorData.details || errorMessage;
          } catch {
            // If JSON parsing fails, try text (but don't fail if that fails too)
            try {
              const errorText = await response.text();
              // Only use first 200 chars to avoid huge HTML error pages
              errorMessage = errorText.substring(0, 200) || errorMessage;
            } catch (textError) {
              // Give up and use default message
              console.error('Could not parse error response:', textError);
            }
          }
          throw new Error(errorMessage);
        }

        const data = await response.json();

        // Replace the assistant message at messageIndex with images
        setTopicChats(prev => prev.map(topic => {
          if (topic.id === activeTopicId) {
            const updated = [...topic.messages];
            updated[messageIndex] = { 
              role: 'assistant', 
              content: data.message, 
              images: data.images || [],
              imageSource: 'wikimedia',
              searchTerms: data.searchTerms
            } as ChatMessage;
            return {
              ...topic,
              messages: updated,
              conceptMapData: data.conceptMap || topic.conceptMapData,
              loadingState: (data.conceptMap && data.conceptMap.nodes && data.conceptMap.edges) ? 'success' as LoadingState : topic.loadingState,
              updatedAt: new Date().toISOString()
            };
          }
          return topic;
        }));

        // Decide whether to generate concept map based on intent
        const shouldGenerate = autoGenerateMap && shouldGenerateConceptMap(originalQuestion, conversationHistory);

        if (shouldGenerate) {
          // If Claude provided a concept map, use it directly (already set above)
          if (data.conceptMap && data.conceptMap.nodes && data.conceptMap.edges) {
            console.log('📊 Using regenerated concept map from Claude');
            setShowSuccessBanner(true);
            setTimeout(() => setShowSuccessBanner(false), 5000);
          } else {
            // Fallback: generate from explanation if Claude didn't provide concept map
            await generateConceptMapFromText(data.message);
          }
        } else {
          console.log('⏭️ Skipping concept map generation for regenerated response (follow-up/clarification question)');
          // Keep existing map visible
        }

      } catch (error) {
        console.error("❌ Error regenerating response:", error);
        
        toast.error('Failed to regenerate response', {
          description: error instanceof Error ? error.message : 'Unknown error',
          action: {
            label: 'Retry',
            onClick: () => handleRefineMessage(messageIndex, 'regenerate')
          },
          duration: 5000,
        });
      } finally {
        setIsChatLoading(false);
      }
      
      return; // Exit early for regenerate
    }
    
    // For simplify and detail, create refined prompt and add new messages
    let refinedPrompt = '';
    if (refinementType === 'simplify') {
      refinedPrompt = `${originalQuestion}\n\nPlease explain this in simpler terms, as if explaining to someone with basic knowledge. Use everyday language and analogies.`;
    } else if (refinementType === 'detail') {
      refinedPrompt = `${originalQuestion}\n\nPlease provide a more detailed explanation with additional examples, mechanisms, and technical information.`;
    }
    
    console.log('🔄 Refining message with type:', refinementType);
    
    // Use existing message handler for simplify and detail
    await handleSendChatMessage(refinedPrompt);
  };

  const handleSearchBetterImages = async (messageIndex: number, searchTerms: string[]) => {
    console.log('🔵 Find Better Images clicked!', { messageIndex, searchTerms });
    setLoadingBetterImages(messageIndex);
    
    try {
      let images: GoogleImage[] = [];
      
      // Try each search term
      for (const term of searchTerms) {
        console.log('🔵 Fetching Google images for term:', term);
        const response = await fetch('/api/google-images', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ searchTerm: term, limit: 3 }),
        });

        if (!response.ok) {
          console.error('Failed to fetch Google images:', response.statusText);
          continue;
        }

        const data = await response.json();
        if (data.images && data.images.length > 0) {
          images = data.images;
          console.log(`📸 Found ${data.images.length} Google images for "${term}"`);
          break;
        }
      }
      
      if (images.length === 0) {
        toast.error('No additional images found', {
          description: 'Try refining your question or topic',
        });
        return;
      }
      
      // Update the message with new images
      setTopicChats(prev => prev.map(topic => {
        if (topic.id === activeTopicId) {
          const updated = [...topic.messages];
          if (updated[messageIndex]) {
            updated[messageIndex] = {
              ...updated[messageIndex],
              images: images,
              imageSource: 'google',
            };
          }
          return {
            ...topic,
            messages: updated,
            updatedAt: new Date().toISOString()
          };
        }
        return topic;
      }));
      
      toast.success('Updated with Google images!');
      
    } catch (error) {
      console.error('Error searching better images:', error);
      toast.error('Failed to search additional sources');
    } finally {
      setLoadingBetterImages(null);
    }
  };

  const generateConceptMapFromText = useCallback(async (text: string) => {
    console.log("🚀 Generating concept map from text");
    console.log("📝 Text length:", text.length);

    // Set loading state
    if (!activeTopicId) return;
    
    setTopicChats(prev => prev.map(topic =>
      topic.id === activeTopicId
        ? { ...topic, loadingState: 'loading' as LoadingState, updatedAt: new Date().toISOString() }
        : topic
    ));
    setErrorMessage("");

    try {
      console.log("🌐 Making fetch request to /api/generate-concept-map");
      
      const response = await fetch('/api/generate-concept-map', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          notes: text.trim()
        })
      });

      console.log("📊 API Response status:", response.status);

      if (!response.ok) {
        // Try to get error message from response
        let errorMessage = `Request failed with status ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.details || errorMessage;
        } catch {
          // If JSON parsing fails, try text (but don't fail if that fails too)
          try {
            const errorText = await response.text();
            // Only use first 200 chars to avoid huge HTML error pages
            errorMessage = errorText.substring(0, 200) || errorMessage;
          } catch (textError) {
            // Give up and use default message
            console.error('Could not parse error response:', textError);
          }
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log("📋 API Response data:", data);

      // Validate response structure
      if (!data.nodes || !data.edges || !Array.isArray(data.nodes) || !Array.isArray(data.edges)) {
        throw new Error('Invalid response format from API');
      }

      // Success!
      console.log("✅ Concept map generated successfully!");
      console.log(`📊 Generated ${data.nodes.length} nodes and ${data.edges.length} edges`);
      
      if (activeTopicId) {
        setTopicChats(prev => prev.map(topic =>
          topic.id === activeTopicId
            ? { ...topic, conceptMapData: data, loadingState: 'success' as LoadingState, updatedAt: new Date().toISOString() }
            : topic
        ));
      }
      setErrorMessage("");

    } catch (error) {
      console.error("❌ Error generating concept map:", error);
      
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'An unexpected error occurred while generating the concept map.';
      
      if (activeTopicId) {
        setTopicChats(prev => prev.map(topic =>
          topic.id === activeTopicId
            ? { ...topic, loadingState: 'error' as LoadingState, updatedAt: new Date().toISOString() }
            : topic
        ));
      }
      
      setErrorMessage(errorMessage);
      
      // Show toast with retry option
      toast.error('Failed to generate concept map', {
        description: errorMessage,
        action: {
          label: 'Retry',
          onClick: () => generateConceptMapFromText(inputText)
        },
        duration: 5000,
      });
    }
  }, [inputText, activeTopicId]);

  const handleRegenerateMindmap = useCallback(async () => {
    // Find the last assistant message
    let lastAssistantMessage = '';
    for (let i = chatMessages.length - 1; i >= 0; i--) {
      if (chatMessages[i].role === 'assistant') {
        lastAssistantMessage = chatMessages[i].content;
        break;
      }
    }
    
    if (!lastAssistantMessage) {
      toast.error('No response to regenerate map from');
      return;
    }
    
    console.log('🔄 Regenerating mindmap only');
    setIsRegeneratingMap(true);
    
    try {
      // Use the existing generateConceptMapFromText function
      await generateConceptMapFromText(lastAssistantMessage);
      
      toast.success('Mindmap regenerated successfully');
    } catch (error) {
      console.error("❌ Error regenerating mindmap:", error);
      
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
  }, [chatMessages, generateConceptMapFromText]);

  // Show toast notification when a NEW mindmap is generated
  useEffect(() => {
    if (isRestoringFromStorage) return;            // avoid firing on restore
    if (!isChatMode) return;                       // only in chat mode
    if (loadingState !== 'success') return;        // map generation done
    if (!conceptMapData) return;                   // no map data yet
  
    // Create a hash of the conceptMapData to detect when a NEW map is generated
    // Use conceptMapData instead of nodes/edges because it only changes when a new map is generated
    const conceptNodeIds = conceptMapData.nodes.map(n => n.id).sort().join(',');
    const currentMapHash = `${conceptMapData.nodes.length}-${conceptMapData.edges.length}-${conceptNodeIds}`;
    
    // Only show toast if this is a different map than the last one we toasted for
    if (currentMapHash === lastToastedMapHashRef.current) return;
  
    toast('Mindmap too confusing? Click regenerate', {
      description: 'You can try a different structure by regenerating the map.',
      position: 'bottom-right',
      duration: 8000,
      action: { label: 'Regenerate', onClick: () => handleRegenerateMindmap() },
      className: 'bg-amber-50 text-amber-900 border border-amber-200',
      style: {
        backgroundColor: 'rgba(35, 117, 224, 0.9)',
        color: '#ffffff',
        borderRadius: '10px',
        fontSize: '16px',
        fontWeight: 'bold',
        textAlign: 'left',
      },
    });
  
    lastToastedMapHashRef.current = currentMapHash;
  }, [isRestoringFromStorage, isChatMode, loadingState, conceptMapData, handleRegenerateMindmap]);

  const handleClearChat = () => {
    if (!activeTopicId) return;
    
    const topic = topicChats.find(t => t.id === activeTopicId);
    if (!topic) return;
    
    if (window.confirm(`Clear all messages and map for "${topic.name}"?`)) {
      setTopicChats(prev => prev.map(t =>
        t.id === activeTopicId
          ? {
              ...t,
              messages: [],
              nodes: [],
              edges: [],
              conceptMapData: null,
              loadingState: 'idle',
              updatedAt: new Date().toISOString()
            }
          : t
      ));
      
      toast.success('Topic cleared');
    }
  };

  const handleCloseWelcomeModal = () => {
    setShowWelcomeModal(false);
    localStorage.setItem('hasSeenOnboarding', 'true');
    console.log('👋 Onboarding completed');
  };

  const handleOpenWelcomeModal = () => {
    setShowWelcomeModal(true);
    console.log('👋 Reopening welcome tutorial');
  };

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
      
      // Validate and type cast the imported data
      const data = importedData as ImportedData;
      
      // Validate the imported data structure
      if (!data.nodes || !data.edges) {
        throw new Error('Invalid JSON format: missing nodes or edges');
      }
      
      if (!Array.isArray(data.nodes) || !Array.isArray(data.edges)) {
        throw new Error('Invalid JSON format: nodes and edges must be arrays');
      }
      
      // Reconstruct nodes with proper data structure and callbacks
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
      
      // Reconstruct edges with proper data structure and callbacks
      const importedEdges = data.edges.map((edge: ImportedEdge) => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        label: edge.label || '',
        type: 'editableEdge',
        animated: true,
        style: { stroke: '#64748b', strokeWidth: 2 },
        markerEnd: { type: 'arrowclosed' as const, color: '#64748b' },
        data: {
          onUpdateEdge: handleUpdateEdge,
          onDeleteEdge: handleDeleteEdge,
        },
      } as Edge));
      
      console.log(`✅ Imported ${importedNodes.length} nodes and ${importedEdges.length} edges`);
      
      // Set the imported data (clears prior history, starting a fresh session)
      historyRef.current = [];
      setHistoryVersion((v) => v + 1);
      
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
  }, [handleUpdateNode, handleDeleteNode, handleUpdateEdge, handleDeleteEdge, activeTopicId]);

const onSave = useCallback(() => {
  if (rfInstance) {
    const flow = rfInstance.toObject();
    
    // Debug: Check what's being saved
    console.log('🔍 DEBUG - Flow being saved:', {
      nodeCount: flow.nodes.length,
      firstNode: flow.nodes[0],
      firstNodeData: flow.nodes[0]?.data
    });
    
    localStorage.setItem(flowKey, JSON.stringify(flow));
    console.log('💾 Concept map saved to localStorage');
  }
}, [rfInstance]);

  interface StoredNode extends Node {
    data: {
      label: string;
      type?: string;
      onUpdateNode?: (nodeId: string, label: string, type?: string) => void;
      onDeleteNode?: (nodeId: string) => void;
    };
  }

  interface StoredEdge extends Edge {
    data?: {
      onUpdateEdge?: (edgeId: string, label: string) => void;
      onDeleteEdge?: (edgeId: string) => void;
    };
  }

  const onRestore = useCallback(() => {
    console.log('🔄 onRestore called - topic-based system handles restoration automatically');
    // Legacy localStorage restoration is no longer needed since we use topic-based storage
    setIsRestoringFromStorage(false);
  }, []);

  // Auto-save to localStorage whenever nodes or edges change
  useEffect(() => {
    if (rfInstance && (nodes.length > 0 || edges.length > 0)) {
      onSave();
    }
  }, [nodes, edges, rfInstance, onSave]);

  // Wrap change handlers to record history before ReactFlow applies them
  const wrappedOnNodesChange = useCallback((changes: NodeChange[]) => {
    if (!isProgrammaticChangeRef.current) {
      pushHistory();
    }
    onNodesChange(changes);
  }, [onNodesChange, pushHistory]);

  const wrappedOnEdgesChange = useCallback((changes: EdgeChange[]) => {
    if (!isProgrammaticChangeRef.current) {
      pushHistory();
    }
    onEdgesChange(changes);
  }, [onEdgesChange, pushHistory]);

  // Programmatic setters passed to child to avoid history loops
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

  // Ctrl/Cmd + Z keyboard shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const tag = target?.tagName?.toLowerCase();
      const isEditable = (target as HTMLElement)?.isContentEditable ?? false;
      if (tag === 'input' || tag === 'textarea' || isEditable) return; // don't hijack text input undo
      if ((e.ctrlKey || e.metaKey) && (e.key === 'z' || e.key === 'Z')) {
        e.preventDefault();
        handleUndo();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handleUndo]);

  // Restore concept map from localStorage on mount (after all handlers are defined)
  useEffect(() => {
    const restoreData = async () => {
      await onRestore();
      // Add a small delay to prevent flashing
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
      
      <WelcomeModal 
        isOpen={showWelcomeModal} 
        onClose={handleCloseWelcomeModal}
      />
      
      {/* Topics Sidebar */}
      <div className="w-64 border-r border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 flex flex-col">
        {/* Sidebar Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">
            My Topics
          </h2>
          <button
            onClick={() => {
              const name = prompt('Topic name:');
              if (name) handleCreateTopic(name);
            }}
            className="w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2 text-sm font-medium"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Topic
          </button>
        </div>

        {/* Topics List */}
        <div className="flex-1 overflow-y-auto p-2">
          {topicChats.length === 0 ? (
            <div className="text-center py-8 px-4">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                No topics yet. Create your first topic to get started!
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              {topicChats.map(topic => (
                <div
                  key={topic.id}
                  className={`group relative p-3 rounded-lg cursor-pointer transition-colors ${
                    topic.id === activeTopicId
                      ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-700/50'
                  }`}
                  onClick={() => handleSwitchTopic(topic.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className={`text-sm font-medium truncate ${
                        topic.id === activeTopicId
                          ? 'text-blue-900 dark:text-blue-100'
                          : 'text-slate-900 dark:text-white'
                      }`}>
                        {topic.name}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {topic.messages.length} messages
                        {topic.nodes.length > 0 && ` • ${topic.nodes.length} nodes`}
                      </p>
                    </div>
                    
                    {/* Delete button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (window.confirm(`Delete "${topic.name}"?`)) {
                          handleDeleteTopic(topic.id);
                        }
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 dark:hover:bg-red-900/20 rounded transition-opacity"
                      title="Delete topic"
                    >
                      <svg className="w-4 h-4 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar />
        
        {/* Show welcome or active topic content */}
        {!activeTopicId ? (
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="text-center max-w-md">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                Welcome to BioBuddy
              </h2>
              <p className="text-slate-600 dark:text-slate-400 mb-6">
                Create your first topic to start generating concept maps and learning!
              </p>
              <button
                onClick={() => {
                  const name = prompt('What topic would you like to study?');
                  if (name) handleCreateTopic(name);
                }}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
              >
                Create Your First Topic
              </button>
            </div>
          </div>
        ) : (
          <main className="flex-1 container mx-auto px-4 py-8 overflow-auto">
        {/* Active topic name header */}
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
          {/* Left Panel - Text Input - h-svh is used to make the height of the panel take up the full height of the viewport*/} 
          <div className={`bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 flex flex-col transition-all duration-300 relative h-svh ${
  isLeftPanelCollapsed ? 'p-2' : 'p-6'
}`}>
            {/* Collapse/Expand Button */}
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
                    onGenerateMap={handleGenerateMap}
                    loadingState={loadingState}
                    isChatMode={isChatMode}
                    onToggleChatMode={() => setIsChatMode(!isChatMode)}
                    onClearAll={handleClearChat}
                  />
                ) : (
                  <ChatInterface
                    chatMessages={chatMessages}
                    chatInput={chatInput}
                    setChatInput={setChatInput}
                    onSendMessage={handleSendChatMessage}
                    isChatLoading={isChatLoading}
                    onClearChat={handleClearChat}
                    onToggleChatMode={() => setIsChatMode(!isChatMode)}
                    onRefineMessage={handleRefineMessage}
                    autoGenerateMap={autoGenerateMap}
                    setAutoGenerateMap={setAutoGenerateMap}
                    onSearchBetterImages={handleSearchBetterImages}
                    loadingBetterImages={loadingBetterImages}
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

          {/* Right Panel - Concept Map Visualization */}
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
              onUpdateEdge={handleUpdateEdge}
              onDeleteEdge={handleDeleteEdge}
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
              onSaveMap={() => setShowSaveDialog(true)}
            />
          </div>
        </div>

        {/* Save Map Dialog */}
        <SaveMapDialog
          open={showSaveDialog}
          name={saveMapName}
          onChangeName={setSaveMapName}
          onCancel={() => { setShowSaveDialog(false); setSaveMapName(''); }}
          onSave={() => handleSaveMap(saveMapName)}
        />
      </main>
        )}
      </div>
    </div>
  );
}



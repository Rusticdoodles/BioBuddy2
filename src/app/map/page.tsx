"use client";

import React, { useState, useCallback, useEffect, useRef } from "react";
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
import { ConceptMapResponse, LoadingState, ChatMessage } from '@/types/concept-map-types';
import { shouldGenerateConceptMap } from '@/utils/intent-detection';

const flowKey = 'biobuddy-concept-map-flow';
const SAVED_MAPS_KEY = 'biobuddy-saved-maps';

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
  const [loadingState, setLoadingState] = useState<LoadingState>('idle');
  const [conceptMapData, setConceptMapData] = useState<ConceptMapResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [isLeftPanelCollapsed, setIsLeftPanelCollapsed] = useState(false);
  const [showSuccessBanner, setShowSuccessBanner] = useState(true);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
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

  // ReactFlow state - managed at parent level
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [rfInstance, setRfInstance] = useState<ReactFlowInstance | null>(null);

  // Undo history: store serializable snapshots (strip function callbacks)
  const historyRef = useRef<{ nodes: SerializableNode[]; edges: SerializableEdge[] }[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [historyVersion, setHistoryVersion] = useState(0); // trigger re-render when history changes (setter used, getter unused by design)
  const isProgrammaticChangeRef = useRef(false);
  const nodesRef = useRef<Node[]>(nodes);
  const edgesRef = useRef<Edge[]>(edges);

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

  // Load chat history from localStorage on mount
  useEffect(() => {
    const savedMessages = localStorage.getItem('chatHistory');
    if (savedMessages) {
      try {
        const parsed = JSON.parse(savedMessages);
        setChatMessages(parsed);
      } catch (error) {
        console.error('Failed to load chat history:', error);
      }
    }
  }, []);

  // Save chat history to localStorage whenever it changes
  useEffect(() => {
    if (chatMessages.length > 0) {
      localStorage.setItem('chatHistory', JSON.stringify(chatMessages));
    }
  }, [chatMessages]);

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

    setNodes(reconstructedNodes);
    setEdges(reconstructedEdges);
    setChatMessages(mapToLoad.chatHistory || []);
    setLoadingState('success');
    setShowLoadMenu(false);

    toast.success('Map loaded!', {
      description: `Loaded "${mapToLoad.name}"`,
    });

    console.log('📂 Loaded map:', mapToLoad.name);
  }, [savedMaps, handleUpdateNode, handleDeleteNode, handleUpdateEdge, handleDeleteEdge, setNodes, setEdges, setChatMessages]);

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

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(e.target.value);
    // Reset states when user changes input
    if (loadingState !== 'idle') {
      setLoadingState('idle');
      setConceptMapData(null);
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

    // Add user message to chat state (only if we're proceeding)
    setChatMessages(prev => [...prev, userMsg]);
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
          conversationHistory: chatMessages
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

      // Add assistant response with images
      const aiMsg = { role: 'assistant' as const, content: data.message, images: data.images || [] };
      setChatMessages(prev => [...prev, aiMsg]);

      console.log("✅ Chat message processed successfully!");

      // shouldGenerate was already determined earlier, no need to recalculate

      if (shouldGenerate) {
        // If Claude provided a concept map, use it directly
        if (data.conceptMap && data.conceptMap.nodes && data.conceptMap.edges) {
          console.log('📊 Using concept map from Claude');
          setConceptMapData(data.conceptMap);
          setLoadingState('success');
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
            setChatMessages(prev => prev.slice(0, -1)); // Remove user message
            handleSendChatMessage(userMessage);
          }
        },
        duration: 5000,
      });
      
      // Remove the user message since it failed
      setChatMessages(prev => prev.slice(0, -1));
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
        setChatMessages(prev => {
          const updated = [...prev];
          updated[messageIndex] = { role: 'assistant', content: data.message, images: data.images || [] } as ChatMessage;
          return updated;
        });

        // Decide whether to generate concept map based on intent
        const shouldGenerate = autoGenerateMap && shouldGenerateConceptMap(originalQuestion, conversationHistory);

        if (shouldGenerate) {
          // If Claude provided a concept map, use it directly
          if (data.conceptMap && data.conceptMap.nodes && data.conceptMap.edges) {
            console.log('📊 Using regenerated concept map from Claude');
            setConceptMapData(data.conceptMap);
            setLoadingState('success');
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

  const generateConceptMapFromText = useCallback(async (text: string) => {
    console.log("🚀 Generating concept map from text");
    console.log("📝 Text length:", text.length);

    // Set loading state
    setLoadingState('loading');
    setErrorMessage("");
    setConceptMapData(null);

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
      
      setLoadingState('success');
      setConceptMapData(data);
      setErrorMessage("");

    } catch (error) {
      console.error("❌ Error generating concept map:", error);
      
      setLoadingState('error');
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'An unexpected error occurred while generating the concept map.';
      
      setErrorMessage(errorMessage);
      setConceptMapData(null);
      
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
  }, [inputText]);

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
    setLoadingState('loading');
    
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
    if (window.confirm('Are you sure you want to clear the chat history and concept map? This cannot be undone.')) {
      setChatMessages([]);
      setNodes([]);
      setEdges([]);
      setConceptMapData(null);
      setLoadingState('idle');
      localStorage.removeItem('chatHistory');
      localStorage.removeItem(flowKey);
      lastToastedMapHashRef.current = ''; // Reset toast tracking
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
      setNodes(importedNodes);
      setEdges(importedEdges);
      setLoadingState('success');
      
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
  }, [handleUpdateNode, handleDeleteNode, handleUpdateEdge, handleDeleteEdge, setNodes, setEdges]);

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
    console.log('🔄 onRestore called - handlers should be ready');
    const restoreFlow = async () => {
      try {
        const flow = JSON.parse(localStorage.getItem(flowKey) || 'null') as { nodes: StoredNode[]; edges: StoredEdge[] };
        
        if (flow && (flow.nodes?.length > 0 || flow.edges?.length > 0)) {
          // Reconstruct nodes with proper data structure including callback functions
          const reconstructedNodes = flow.nodes.map((node: StoredNode) => ({
            ...node,
            data: {
              ...node.data,
              onUpdateNode: handleUpdateNode,
              onDeleteNode: handleDeleteNode,
            }
          }));
          
          // Reconstruct edges with proper data structure including callback functions
          const reconstructedEdges = flow.edges.map((edge: StoredEdge) => ({
            ...edge,
            data: {
              ...edge.data,
              onUpdateEdge: handleUpdateEdge,
              onDeleteEdge: handleDeleteEdge,
            }
          }));
          
          console.log('🔍 About to restore:', { 
            nodeCount: reconstructedNodes.length, 
            firstNodeData: reconstructedNodes[0]?.data 
          });

          historyRef.current = [];
          setHistoryVersion((v) => v + 1);
          isProgrammaticChangeRef.current = true;
          setNodes(reconstructedNodes);
          setEdges(reconstructedEdges);
          setTimeout(() => { isProgrammaticChangeRef.current = false; }, 0);
          setLoadingState('success');

          console.log('📂 Concept map restored from localStorage');
          console.log('✅ State should now have', reconstructedNodes.length, 'nodes');
        }
      } catch (error) {
        console.error('Error restoring from localStorage:', error);
      } finally {
        // Always set loading to false, whether restore succeeded or not
        setIsRestoringFromStorage(false);
      }
    };
    
    restoreFlow();
  }, [setNodes, setEdges, handleUpdateNode, handleDeleteNode, handleUpdateEdge, handleDeleteEdge]);

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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
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
      
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                Concept Map Generator
              </h1>
              <p className="text-slate-600 dark:text-slate-300">
                Paste your notes and watch them transform into visual concept maps
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <SavedMapsDropdown
                savedMaps={savedMaps}
                showLoadMenu={showLoadMenu}
                onToggleMenu={() => setShowLoadMenu(!showLoadMenu)}
                onLoadMap={handleLoadMap}
                onDeleteMap={handleDeleteMap}
              />

              {/* Help button */}
              <button
                onClick={handleOpenWelcomeModal}
                className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg transition-colors border border-slate-300 dark:border-slate-600"
                title="Show tutorial"
                aria-label="Show tutorial"
              >
                <HelpCircle className="w-5 h-5" />
                <span className="text-sm font-medium">Help</span>
              </button>
            </div>
          </div>
        </div>

        <div className={`grid grid-cols-1 gap-8 h-[calc(100vh-140px)] transition-all duration-300 ${
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
    </div>
  );
}


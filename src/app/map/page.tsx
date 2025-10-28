"use client";

import React, { useState, useCallback, useEffect } from "react";
import { Navbar } from "@/components/navbar";
import { addEdge, Connection, Edge, Node, useNodesState, useEdgesState, Position, ReactFlowInstance } from '@xyflow/react';
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
import { WelcomeModal } from '@/components/WelcomeModal';

// Import types and utilities
import { ConceptMapResponse, LoadingState, ChatMessage } from '@/types/concept-map-types';

const flowKey = 'biobuddy-concept-map-flow';





export default function MapPage() {
  const [inputText, setInputText] = useState("");
  const [loadingState, setLoadingState] = useState<LoadingState>('idle');
  const [conceptMapData, setConceptMapData] = useState<ConceptMapResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [isLeftPanelCollapsed, setIsLeftPanelCollapsed] = useState(false);
  const [showSuccessBanner, setShowSuccessBanner] = useState(true);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [isChatMode, setIsChatMode] = useState(false);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [isRestoringFromStorage, setIsRestoringFromStorage] = useState(true);

  // ReactFlow state - managed at parent level
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [rfInstance, setRfInstance] = useState<ReactFlowInstance | null>(null);

  useEffect(() => {
    if (loadingState === 'success') {
      setShowSuccessBanner(true);
      const timer = setTimeout(() => {
        setShowSuccessBanner(false);
      }, 10000);
      
      return () => clearTimeout(timer);
    }
  }, [loadingState]);

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

  const handleDeleteNode = useCallback((nodeId: string) => {
    setNodes((nds) => nds.filter((node) => node.id !== nodeId));
    setEdges((eds) => eds.filter((edge) => edge.source !== nodeId && edge.target !== nodeId));
  }, [setNodes, setEdges]);

  const handleUpdateNode = useCallback((nodeId: string, label: string, type?: string) => {
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
  }, [handleDeleteNode, setNodes]);

  const handleUpdateEdge = useCallback((edgeId: string, label: string) => {
    setEdges((eds) =>
      eds.map((edge) =>
        edge.id === edgeId ? { ...edge, label, data: { ...edge.data, label } } : edge
      )
    );
  }, [setEdges]);

  const handleDeleteEdge = useCallback((edgeId: string) => {
    setEdges((eds) => eds.filter((edge) => edge.id !== edgeId));
  }, [setEdges]);

  const onConnect = useCallback(
    (params: Connection) => {
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
    [setEdges, handleUpdateEdge, handleDeleteEdge]
  );

  const handleAddNode = (label: string, type: string) => {
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

    // Add user message to chat
    const userMsg = { role: 'user' as const, content: userMessage.trim() };
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
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("✅ Chat API Response data:", data);

      if (!data.response) {
        throw new Error('Invalid response format from chat API');
      }

      // Add AI response to chat
      const aiMsg = { role: 'assistant' as const, content: data.response };
      setChatMessages(prev => [...prev, aiMsg]);

      console.log("✅ Chat message processed successfully!");

      // Automatically generate concept map from AI response
      console.log("🗺️ Auto-generating concept map from AI response...");
      await generateConceptMapFromText(data.response);

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
    
    // Create refined prompt based on type
    let refinedPrompt = '';
    if (refinementType === 'simplify') {
      refinedPrompt = `${originalQuestion}\n\nPlease explain this in simpler terms, as if explaining to someone with basic knowledge. Use everyday language and analogies.`;
    } else if (refinementType === 'detail') {
      refinedPrompt = `${originalQuestion}\n\nPlease provide a more detailed explanation with additional examples, mechanisms, and technical information.`;
    } else if (refinementType === 'regenerate') {
      refinedPrompt = originalQuestion; // Same question, new response
    }
    
    console.log('🔄 Refining message with type:', refinementType);
    
    // Use existing message handler
    await handleSendChatMessage(refinedPrompt);
  };

  const generateConceptMapFromText = async (text: string) => {
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

      const data = await response.json();
      console.log("📋 API Response data:", data);

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }

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
  };

  const handleClearChat = () => {
    if (window.confirm('Are you sure you want to clear the chat history and concept map? This cannot be undone.')) {
      setChatMessages([]);
      setNodes([]);
      setEdges([]);
      setConceptMapData(null);
      setLoadingState('idle');
      localStorage.removeItem('chatHistory');
      localStorage.removeItem(flowKey);
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
      
      // Set the imported data
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

          setNodes(reconstructedNodes);
          setEdges(reconstructedEdges);
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
            
            {/* Help button */}
            <button
              onClick={handleOpenWelcomeModal}
              className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg transition-colors border border-slate-300 dark:border-slate-600"
              title="Show tutorial"
              aria-label="Show tutorial"
            >
              <HelpCircle className="w-5 h-5" />
              <span className="-ml-1 text-sm font-medium">Help</span>
            </button>
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
                  />
              )}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-slate-400 dark:text-slate-500">
                <Edit3 className="w-6 h-6 mb-2" />
                <span className="text-xs writing-mode-vertical text-center">Your Notes</span>
              </div>
            )}
          </div>

          {/* Right Panel - Concept Map Visualization */}
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 p-6 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                  Concept Map
                </h2>
                {isChatMode && loadingState === 'success' && (
                  <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-1 rounded">
                    From AI Chat
                  </span>
                )}
              </div>
              <span className="text-sm text-slate-500 dark:text-slate-400">
                {loadingState === 'loading' ? 'Analyzing...' : 
                 loadingState === 'success' ? 'Ready' : 
                 loadingState === 'error' ? 'Error' : 'Interactive visualization'}
              </span>
            </div>
            
            <ConceptMapVisualization
              loadingState={loadingState}
              conceptMapData={conceptMapData}
              errorMessage={errorMessage}
              showSuccessBanner={showSuccessBanner}
              isChatMode={isChatMode}
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onUpdateNode={handleUpdateNode}
              onDeleteNode={handleDeleteNode}
              onUpdateEdge={handleUpdateEdge}
              onDeleteEdge={handleDeleteEdge}
              onConnect={onConnect}
              onAddNode={handleAddNode}
              setNodes={setNodes}
              setEdges={setEdges}
              rfInstance={rfInstance}
              setRfInstance={setRfInstance}
              onRestore={onRestore}
              onImportJSON={handleImportJSON}
              onToggleChatMode={() => setIsChatMode(!isChatMode)}
              isRestoringFromStorage={isRestoringFromStorage}
            />
          </div>
        </div>
      </main>
    </div>
  );
}


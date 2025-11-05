"use client";

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  Connection,
  Edge,
  Node,
  BackgroundVariant,
  ConnectionLineType,
  NodeChange,
  EdgeChange,
  ReactFlowInstance,
  SelectionMode,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { 
  Plus, 
  FileText,
  Info,
  X,
  Upload,
  MessageSquare,
  RotateCw,
  Sparkles
} from 'lucide-react';
import { toast } from 'sonner';

import { ConceptNode } from './ConceptNode';
import { EditableEdge } from './EditableEdge';
import { AddNodeForm } from './AddNodeForm';
import { nodeTypeColors } from '@/constants/concept-map-constants';
import { ConceptMapResponse, LoadingState } from '@/types/concept-map-types';
import { getLayoutedElements } from '@/utils/layout';

interface ConceptMapVisualizationProps {
  loadingState: LoadingState;
  conceptMapData: ConceptMapResponse | null;
  errorMessage: string;
  showSuccessBanner: boolean;
  isChatMode: boolean;
  nodes: Node[];
  edges: Edge[];
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onUpdateNode: (nodeId: string, label: string, type?: string) => void;
  onDeleteNode: (nodeId: string) => void;
  onConnect: (params: Connection) => void;
  onAddNode: (label: string, type: string) => void;
  setNodes: React.Dispatch<React.SetStateAction<Node[]>>;
  setEdges: React.Dispatch<React.SetStateAction<Edge[]>>;
  rfInstance: ReactFlowInstance | null;
  setRfInstance: (instance: ReactFlowInstance | null) => void;
  onRestore: () => void;
  onImportJSON: (data: unknown) => void;
  onToggleChatMode: () => void;
  isRestoringFromStorage: boolean;
  onRegenerateMindmap: () => void;
  isRegeneratingMap: boolean;
}

export const ConceptMapVisualization: React.FC<ConceptMapVisualizationProps> = ({
  loadingState,
  conceptMapData,
  errorMessage,
  showSuccessBanner,
  isChatMode,
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onUpdateNode,
  onDeleteNode,
  onConnect,
  onAddNode,
  setNodes,
  setEdges,
  rfInstance,
  setRfInstance,
  onImportJSON,
  onToggleChatMode,
  isRestoringFromStorage,
  onRegenerateMindmap,
  isRegeneratingMap
}) => {
  // DEBUG: Log what we're receiving
  console.log('🎨 ConceptMapVisualization render:', {
    loadingState,
    nodeCount: nodes.length,
    edgeCount: edges.length,
    hasConceptMapData: !!conceptMapData
  });

  const [showAddNodeForm, setShowAddNodeForm] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (showExportMenu && !(e.target as Element).closest('.relative')) {
        setShowExportMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showExportMenu]);

  // NOTE: This effect is disabled in the topic-based system because nodes/edges are managed 
  // by the parent component's topic state. The parent handles syncing conceptMapData to nodes/edges.
  // 
  // If you need to re-enable this for non-topic-based usage, uncomment below:
  //
  // React.useEffect(() => {
  //   console.log('📊 conceptMapData changed:', conceptMapData);
  //   
  //   if (!conceptMapData || !conceptMapData.nodes || !conceptMapData.edges) {
  //     console.log('📊 No valid conceptMapData, skipping processing (preserving existing state)');
  //     return;
  //   }
  //
  //   console.log('✅ Valid conceptMapData found, processing...');
  //   console.log('📊 Nodes:', conceptMapData.nodes.length);
  //   console.log('📊 Edges:', conceptMapData.edges.length);
  //
  //   const reactFlowNodes: Node[] = conceptMapData.nodes.map((node) => ({
  //     id: node.id,
  //     type: 'conceptNode',
  //     position: { x: 0, y: 0 },
  //     data: {
  //       label: node.label,
  //       type: node.type,
  //       onUpdateNode,
  //       onDeleteNode,
  //     },
  //   }));
  //
  //   const reactFlowEdges: Edge[] = conceptMapData.edges.map((edge, index) => ({
  //     id: `edge-${edge.source}-${edge.target}-${index}`,
  //     source: edge.source,
  //     target: edge.target,
  //     label: edge.label,
  //     type: 'editableEdge',
  //     animated: true,
  //     style: { 
  //       stroke: '#64748b', 
  //       strokeWidth: 2,
  //     },
  //     markerEnd: {
  //       type: 'arrowclosed',
  //       color: '#64748b',
  //     },
  //     data: {
  //       onUpdateEdge,
  //       onDeleteEdge,
  //     },
  //   }));
  //
  //   const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
  //     reactFlowNodes,
  //     reactFlowEdges
  //   );
  //
  //   setNodes(layoutedNodes);
  //   setEdges(layoutedEdges);
  // }, [conceptMapData, setNodes, setEdges, onUpdateEdge, onDeleteEdge, onUpdateNode, onDeleteNode]);

  // Show success toast instead of inline banner
  useEffect(() => {
    if (loadingState !== 'success') return;
    if (!showSuccessBanner) return;
    if (nodes.length === 0) return;

    toast.success('Concept map generated successfully!', {
      description: `Found ${nodes.length} concepts with ${edges.length} relationships`,
    });
  }, [loadingState, showSuccessBanner, nodes.length, edges.length]);

  const handleAddNode = (label: string, type: string) => {
    onAddNode(label, type);
    setShowAddNodeForm(false);
  };


  const handleExportJSON = () => {
    const exportData = {
      nodes: nodes.map(node => ({
        id: node.id,
        label: node.data.label,
        type: node.data.type,
        position: node.position
      })),
      edges: edges.map(edge => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        label: edge.label || ''
      })),
      timestamp: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'concept-map.json';
    link.click();
    URL.revokeObjectURL(url);

    toast.success('Concept map exported!', {
      description: 'JSON file saved to your downloads folder',
    });
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target?.result as string);
        onImportJSON(json);
      } catch (error) {
        toast.error('Invalid JSON file', {
          description: 'Please select a valid concept map JSON file.',
        });
        console.error('Error parsing JSON:', error);
      }
    };
    reader.readAsText(file);
    
    // Reset input so the same file can be selected again
    event.target.value = '';
  };

  // Memoize nodeTypes to prevent recreation on every render
  const nodeTypes = useMemo(() => ({
    conceptNode: (props: { data: { label: string; type?: string; onUpdateNode?: (nodeId: string, label: string, type?: string) => void; onDeleteNode?: (nodeId: string) => void }; id: string; selected?: boolean; [key: string]: unknown }) => {
      const nodeData = props.data || { label: '', type: 'default' };
      return (
        <ConceptNode 
          {...props}
          data={{
            ...nodeData,
            type: nodeData.type || 'default',
            onUpdateNode,
            onDeleteNode,
          }}
        />
      );
    }
  }), [onUpdateNode, onDeleteNode]);

  // Memoize edgeTypes to prevent recreation on every render
  const edgeTypes = useMemo(() => ({
    editableEdge: EditableEdge,
  }), []);

  const handleTidyLayout = useCallback(() => {
    if (nodes.length === 0) return;
    
    console.log('🧹 Tidying layout with Dagre hierarchical algorithm...');
    
    // Import is already at top of file
    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
      nodes,
      edges
    );
    
    setNodes(layoutedNodes);
    setEdges(layoutedEdges);
    
    toast.success('Layout organized!', {
      description: 'Nodes arranged in hierarchical structure'
    });
  }, [nodes, edges, setNodes, setEdges]);

  const handlePerfectLayout = useCallback(() => {
    if (nodes.length === 0) return;
    
    console.log('✨ Running perfect layout algorithm...');
    
    // Step 1: Apply Dagre layout with optimized settings
    const { nodes: dagreNodes, edges: dagreEdges } = getLayoutedElements(
      nodes,
      edges,
      'TB' // Top to bottom
    );
    
    // Step 2: Center the graph in viewport
    const centerX = dagreNodes.reduce((sum, n) => sum + n.position.x, 0) / dagreNodes.length;
    const centerY = dagreNodes.reduce((sum, n) => sum + n.position.y, 0) / dagreNodes.length;
    
    const viewportCenterX = (window.innerWidth - 300) / 2; // Account for sidebar
    const viewportCenterY = window.innerHeight / 2;
    
    const offsetX = viewportCenterX - centerX;
    const offsetY = viewportCenterY - centerY;
    
    const centeredNodes = dagreNodes.map(node => ({
      ...node,
      position: {
        x: node.position.x + offsetX,
        y: node.position.y + offsetY
      }
    }));
    
    // Step 3: Apply with animation
    setNodes(centeredNodes);
    setEdges(dagreEdges);
    
    // Step 4: Fit view to show entire graph
    if (rfInstance) {
      setTimeout(() => {
        rfInstance.fitView({ 
          padding: 0.2,
          duration: 500,
          maxZoom: 1.2
        });
      }, 100);
    }
    
    toast.success('Layout optimized!', {
      description: 'Graph reorganized for clarity'
    });
    
    console.log('✅ Perfect layout complete');
  }, [nodes, edges, setNodes, setEdges, rfInstance]);

  // Keyboard shortcut for Perfect Layout
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Cmd+Shift+L or Ctrl+Shift+L for "Perfect Layout"
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'l') {
        e.preventDefault();
        handlePerfectLayout();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handlePerfectLayout]);

  return (
    <div className="flex-1 bg-slate-50 dark:bg-slate-700 rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-600 flex items-center justify-center p-6">
      {/* Hidden file input - always rendered */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleFileSelect}
        className="hidden"
      />
      {isRestoringFromStorage && (
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="animate-spin h-8 w-8 text-blue-600" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-slate-700 dark:text-slate-300 mb-2">
            Loading your saved work...
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs">
            Restoring your concept map from last session
          </p>
        </div>
      )}
      {loadingState === 'idle' && !isRestoringFromStorage && (
        <div className="text-center max-w-md mx-auto">
          <div className="w-16 h-16 bg-slate-200 dark:bg-slate-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg 
              className="w-8 h-8 text-slate-400 dark:text-slate-500" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" 
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-slate-700 dark:text-slate-300 mb-2">
            Your concept map will appear here
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
            {isChatMode 
              ? "Ask the AI a question to get started, and your concept map will be automatically generated."
              : "Choose how you'd like to create your concept map:"}
          </p>
          
          {/* Action buttons */}
          {!isChatMode && (
            <div className="flex flex-col gap-3">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium shadow-sm"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                Import Saved Map
              </button>
              
              <div className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide font-semibold">
                Or start fresh
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => {
                    // Focus on the notes textarea
                    const textarea = document.querySelector('textarea');
                    if (textarea) {
                      textarea.focus();
                      textarea.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }
                  }}
                  className="flex flex-col items-center gap-2 px-4 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg transition-colors border border-slate-300 dark:border-slate-600"
                >
                  <FileText className="w-5 h-5" />
                  <span className="text-sm font-medium">Paste Notes</span>
                </button>
                
                <button
                  onClick={onToggleChatMode}
                  className="flex flex-col items-center gap-2 px-4 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg transition-colors border border-slate-300 dark:border-slate-600"
                >
                  <MessageSquare className="w-5 h-5" />
                  <span className="text-sm font-medium">Ask AI</span>
                </button>
              </div>
            </div>
          )}
          
          {isChatMode && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 text-left">
              <p className="text-sm text-blue-900 dark:text-blue-100 font-medium mb-2">
                Try asking:
              </p>
              <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                <li>• &ldquo;Explain photosynthesis&rdquo;</li>
                <li>• &ldquo;What is the Krebs cycle?&rdquo;</li>
                <li>• &ldquo;How does DNA replication work?&rdquo;</li>
              </ul>
            </div>
          )}
        </div>
      )}

      {loadingState === 'loading' && (
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="animate-spin h-8 w-8 text-blue-600" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-slate-700 dark:text-slate-300 mb-2">
            Analyzing data...
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs">
            Our AI is identifying key concepts and relationships. This may take a few moments.
          </p>
        </div>
      )}

      {loadingState === 'error' && (
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg 
              className="w-8 h-8 text-red-600" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z" 
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-red-700 dark:text-red-300 mb-2">
            Error generating concept map
          </h3>
          <p className="text-sm text-red-600 dark:text-red-400 max-w-xs">
            {errorMessage}
          </p>
        </div>
      )}

      {loadingState === 'success' && nodes.length > 0 && (
        <div className="w-full h-full flex flex-col">
          
          {/* ReactFlow Visualization */}
          <div data-tour="concept-map" className="flex-1 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden relative">
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onInit={setRfInstance}
              nodeTypes={nodeTypes}
              edgeTypes={edgeTypes}
              fitView
              fitViewOptions={{ padding: 0.2 }}
              defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
              minZoom={0.1}
              maxZoom={2}
              attributionPosition="bottom-left"
              className="bg-slate-50 dark:bg-slate-900"
              connectionLineType={ConnectionLineType.SmoothStep}
              snapToGrid={true}
              snapGrid={[20, 20]}
              nodesDraggable={true}
              nodesConnectable={true}
              elementsSelectable={true}
              multiSelectionKeyCode="Control"
              selectionKeyCode="Shift"
              deleteKeyCode="Delete"
              selectionMode={SelectionMode.Partial}
              onSelectionChange={(params) => {
                if (params.nodes.length > 0) {
                  console.log(`✅ Selected ${params.nodes.length} nodes`);
                }
              }}
            >
              <Background 
                variant={BackgroundVariant.Dots} 
                gap={20} 
                size={1}
                color="#cbd5e1"
                className="dark:opacity-30"
              />
              <Controls 
                className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 dark:text-black"
                style={{
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                }}
              />
              
              <MiniMap 
                className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                nodeColor={(node) => {
                  const nodeType = (node.data as { type?: string })?.type || 'default';
                  const colors = nodeTypeColors[nodeType] || nodeTypeColors.default;
                  return colors.text.includes('blue') ? '#3b82f6' :
                         colors.text.includes('green') ? '#10b981' :
                         colors.text.includes('purple') ? '#8b5cf6' :
                         colors.text.includes('orange') ? '#f97316' :
                         colors.text.includes('red') ? '#ef4444' :
                         colors.text.includes('indigo') ? '#6366f1' : '#6b7280';
                }}
                nodeStrokeWidth={2}
                nodeBorderRadius={8}
                maskColor="rgba(0, 0, 0, 0.1)"
                style={{
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                }}
              />
              
              {/* Info Panel Toggle Button */}
              <button
                onClick={() => setShowInfo(!showInfo)}
                className="absolute top-4 left-4 z-10 p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-all duration-200"
                aria-label="Toggle info panel"
                title="Show/Hide Legend and Tips"
              >
                Legend & Help <Info className={`inline w-4 h-4 align-[-0.125em] transition-colors ${showInfo ? 'text-blue-600' : ' inline w-4 h-4 align-[-0.125em] text-slate-600 dark:text-slate-300'}`} />
              </button>

              {/* Floating Info Panel */}
              {showInfo && (
                <div className="absolute top-16 left-4 z-10 w-80 max-h-[calc(100%-100px)] overflow-y-auto bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl">
                  {/* Legend Section */}
                  <div className="p-4 border-b border-slate-200 dark:border-slate-700">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-semibold text-slate-900 dark:text-white">Legend</h4>
                      <button
                        onClick={() => setShowInfo(false)}
                        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2 text-xs">
                      {Object.entries(nodeTypeColors).filter(([key]) => key !== 'default').map(([type, colors]) => (
                        <div key={type} className="flex items-center gap-1">
                          <div className={`w-3 h-3 rounded ${colors.bg} ${colors.border} border`}></div>
                          <span className="text-slate-600 dark:text-slate-300 capitalize">{type}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Editing Tips Section */}
                  <div className="p-4">
                    <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">Editing Tips</h4>
                    <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-2">
                      <li className="flex items-start gap-2">
                        <span className="text-blue-600 dark:text-blue-400">•</span>
                        <span>Click node labels to edit them</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-600 dark:text-blue-400">•</span>
                        <span>Click node types to change categories</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-600 dark:text-blue-400">•</span>
                        <span>Hover over nodes/edges to see delete buttons</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-600 dark:text-blue-400">•</span>
                        <span>Click the + button to add new nodes</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-600 dark:text-blue-400">•</span>
                        <span>Drag from handles to create connections</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-600 dark:text-blue-400">•</span>
                        <span>Click edge labels to edit them</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-600 dark:text-blue-400">•</span>
                        <span>Use the export buttons to save your map</span>
                      </li>
                    </ul>
                  </div>
                </div>
              )}
              
              {/* Debug info overlay */}
              <div className="absolute top-2 right-2 bg-white dark:bg-slate-800 p-2 rounded border border-slate-200 dark:border-slate-700 text-xs">
                <div>Nodes: {nodes.length}</div>
                <div>Edges: {edges.length}</div>
              </div>
            </ReactFlow>
            
            {/* Floating Action Buttons */}
            <div data-tour="map-controls" className="absolute bottom-56 right-4 flex flex-col gap-2">
              {/* Regenerate button */}
              {loadingState === 'success' && nodes.length > 0 && (
                <button
                  onClick={onRegenerateMindmap}
                  disabled={isRegeneratingMap}
                  className={`w-12 h-12 rounded-full shadow-lg transition-all duration-200 flex items-center justify-center group mb-2 ${
                    isRegeneratingMap
                      ? 'bg-slate-400 text-slate-200 cursor-not-allowed'
                      : 'bg-amber-600 hover:bg-amber-700 text-white hover:shadow-xl'
                  }`}
                  title="Regenerate the mindmap from current explanation"
                >
                  <RotateCw className={`w-5 h-5 ${isRegeneratingMap ? 'animate-spin' : ''}`} />
                </button>
              )}

              {/* Perfect Layout Button */}
              <button
                onClick={handlePerfectLayout}
                disabled={nodes.length === 0}
                className="w-12 h-12 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center group disabled:opacity-50 disabled:cursor-not-allowed"
                title="Optimize layout for maximum clarity"
                aria-label="Perfect layout"
              >
                <Sparkles className="w-5 h-5" />
              </button>

              {/* Tidy Layout Button */}
              <button
                onClick={handleTidyLayout}
                className="w-12 h-12 bg-purple-600 hover:bg-purple-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center group"
                aria-label="Tidy layout"
                title="Auto-arrange nodes"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>

              {/* Add Node button */}
              <button
                onClick={() => setShowAddNodeForm(true)}
                className="w-12 h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center group"
                aria-label="Add new node"
              >
                <Plus className="w-6 h-6" />
              </button>
              
              {/* Hidden file input */}
              <input ref={fileInputRef} type="file" accept=".json" onChange={handleFileSelect} className="hidden" />

              {/* Export/Import dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowExportMenu(!showExportMenu)}
                  className="w-12 h-12 bg-purple-600 hover:bg-purple-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center group"
                  aria-label="Export/Import options"
                  title="Export/Import"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                  </svg>
                </button>

                {showExportMenu && (
                  <div className="absolute bottom-0 right-14 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 py-2 min-w-40">
                    <button
                      onClick={() => {
                        handleExportJSON();
                        setShowExportMenu(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2"
                    >
                      <FileText className="w-4 h-4 text-purple-600" />
                      Export JSON
                    </button>
                    <button
                      onClick={() => {
                        fileInputRef.current?.click();
                        setShowExportMenu(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2"
                    >
                      <Upload className="w-4 h-4 text-orange-600" />
                      Import JSON
                    </button>
                  </div>
                )}
              </div>
            </div>
            
            {/* Add Node Form Modal */}
            {showAddNodeForm && (
              <AddNodeForm
                onClose={() => setShowAddNodeForm(false)}
                onAdd={handleAddNode}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

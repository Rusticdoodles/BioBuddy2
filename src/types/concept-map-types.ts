import { WikimediaImage } from '@/utils/wikimedia';
import { Node, Edge } from '@xyflow/react';
// TypeScript types for concept map components

export interface ConceptNode {
  id: string;
  label: string;
  type: string;
}

export interface ConceptEdge {
  source: string;
  target: string;
  label: string;
}

export interface ConceptMapResponse {
  nodes: ConceptNode[];
  edges: ConceptEdge[];
}

// Loading states
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

// Topic-based chat system
export interface TopicChat {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  messages: ChatMessage[];
  nodes: Node[];
  edges: Edge[];
  conceptMapData: ConceptMapResponse | null;
  loadingState: LoadingState;
}

// Node type colors for different concept types
export interface NodeTypeColors {
  bg: string;
  text: string;
  border: string;
  color: string;
}

export type NodeTypeColorMap = Record<string, NodeTypeColors>;

// Chat message types
export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  images?: WikimediaImage[];
  imageSource?: 'wikimedia' | 'google';
  searchTerms?: string[];
  isSuggestion?: boolean;
  suggestedTopicName?: string;
}

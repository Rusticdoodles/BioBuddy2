import { WikimediaImage } from '@/utils/wikimedia';
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
}

// BioBuddy Type Definitions
// This file will contain all TypeScript interfaces and types for the application

// Concept Map Types
export interface Concept {
  id: string;
  label: string;
  description?: string;
  category?: string;
}

export interface Connection {
  id: string;
  sourceId: string;
  targetId: string;
  label?: string;
  strength?: number;
}

export interface ConceptMap {
  id: string;
  title: string;
  concepts: Concept[];
  connections: Connection[];
  createdAt: Date;
  updatedAt: Date;
}

// API Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Form Types
export interface TextInputForm {
  text: string;
  options?: {
    includeCategories?: boolean;
    maxConcepts?: number;
    language?: string;
  };
}


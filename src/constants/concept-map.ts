import { NodeTypeColorMap } from '@/types/concept-map-types';

// Node type colors for different concept types
export const nodeTypeColors: NodeTypeColorMap = {
  organelle: { 
    bg: 'bg-blue-50 dark:bg-blue-900/30', 
    text: 'text-blue-800 dark:text-blue-200', 
    border: 'border-blue-200 dark:border-blue-700' 
  },
  molecule: { 
    bg: 'bg-green-50 dark:bg-green-900/30', 
    text: 'text-green-800 dark:text-green-200', 
    border: 'border-green-200 dark:border-green-700' 
  },
  process: { 
    bg: 'bg-purple-50 dark:bg-purple-900/30', 
    text: 'text-purple-800 dark:text-purple-200', 
    border: 'border-purple-200 dark:border-purple-700' 
  },
  structure: { 
    bg: 'bg-orange-50 dark:bg-orange-900/30', 
    text: 'text-orange-800 dark:text-orange-200', 
    border: 'border-orange-200 dark:border-orange-700' 
  },
  system: { 
    bg: 'bg-red-50 dark:bg-red-900/30', 
    text: 'text-red-800 dark:text-red-200', 
    border: 'border-red-200 dark:border-red-700' 
  },
  function: { 
    bg: 'bg-indigo-50 dark:bg-indigo-900/30', 
    text: 'text-indigo-800 dark:text-indigo-200', 
    border: 'border-indigo-200 dark:border-indigo-700' 
  },
  default: { 
    bg: 'bg-gray-50 dark:bg-gray-900/30', 
    text: 'text-gray-800 dark:text-gray-200', 
    border: 'border-gray-200 dark:border-gray-700' 
  },
};

// Node type options for dropdowns
export const nodeTypeOptions = [
  { value: 'organelle', label: 'Organelle' },
  { value: 'molecule', label: 'Molecule' },
  { value: 'process', label: 'Process' },
  { value: 'structure', label: 'Structure' },
  { value: 'system', label: 'System' },
  { value: 'function', label: 'Function' },
];

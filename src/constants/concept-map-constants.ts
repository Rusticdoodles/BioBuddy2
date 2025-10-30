import { NodeTypeColorMap } from '@/types/concept-map-types';

// Node type colors for different concept types
export const nodeTypeColors: NodeTypeColorMap = {
  organelle: { 
    bg: 'bg-blue-50 dark:bg-blue-900/30', 
    text: 'text-blue-800 dark:text-blue-200', 
    border: 'border-blue-200 dark:border-blue-700',
    color: 'blue'
  },
  molecule: { 
    bg: 'bg-green-50 dark:bg-green-900/30', 
    text: 'text-green-800 dark:text-green-200', 
    border: 'border-green-200 dark:border-green-700',
    color: 'green'
  },
  process: { 
    bg: 'bg-purple-50 dark:bg-purple-900/30', 
    text: 'text-purple-800 dark:text-purple-200', 
    border: 'border-purple-200 dark:border-purple-700',
    color: 'purple'
  },
  structure: { 
    bg: 'bg-orange-50 dark:bg-orange-900/30', 
    text: 'text-orange-800 dark:text-orange-200', 
    border: 'border-orange-200 dark:border-orange-700',
    color: 'orange'
  },
  system: { 
    bg: 'bg-red-50 dark:bg-red-900/30', 
    text: 'text-red-800 dark:text-red-200', 
    border: 'border-red-200 dark:border-red-700',
    color: 'red'
  },
  function: { 
    bg: 'bg-indigo-50 dark:bg-indigo-900/30', 
    text: 'text-indigo-800 dark:text-indigo-200', 
    border: 'border-indigo-200 dark:border-indigo-700',
    color: 'indigo'
  },
  default: { 
    bg: 'bg-gray-50 dark:bg-gray-900/30', 
    text: 'text-gray-800 dark:text-gray-200', 
    border: 'border-gray-200 dark:border-gray-700',
    color: 'gray'
  },
  enzyme: { 
    bg: 'bg-yellow-50 dark:bg-yellow-900/30', 
    text: 'text-yellow-800 dark:text-yellow-200', 
    border: 'border-yellow-200 dark:border-yellow-700',
    color: '#f59e0b'
  },
  pathway: { 
    bg: 'bg-pink-50 dark:bg-pink-900/30', 
    text: 'text-pink-800 dark:text-pink-200', 
    border: 'border-pink-200 dark:border-pink-700',
    color: 'pink'
  },
  organ: { 
    bg: 'bg-teal-50 dark:bg-teal-900/30', 
    text: 'text-teal-800 dark:text-teal-200', 
    border: 'border-teal-200 dark:border-teal-700',
    color: 'teal'
  },
  tissue: { 
    bg: 'bg-lime-50 dark:bg-lime-900/30', 
    text: 'text-lime-800 dark:text-lime-200', 
    border: 'border-lime-200 dark:border-lime-700',
    color: 'lime'
  },
  cell: { 
    bg: 'bg-cyan-50 dark:bg-cyan-900/30', 
    text: 'text-cyan-800 dark:text-cyan-200', 
    border: 'border-cyan-200 dark:border-cyan-700',
    color: 'cyan'
  },
  protein: { 
    bg: 'bg-amber-50 dark:bg-amber-900/30', 
    text: 'text-amber-800 dark:text-amber-200', 
    border: 'border-amber-200 dark:border-amber-700',
    color: 'brown'
  },
  concept: { 
    bg: 'bg-gray-50 dark:bg-gray-900/30', 
    text: 'text-gray-800 dark:text-gray-200', 
    border: 'border-gray-200 dark:border-gray-700',
    color: 'gray'
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
  { value: 'enzyme', label: 'Enzyme' },
  { value: 'pathway', label: 'Pathway' },
  { value: 'organ', label: 'Organ' },
  { value: 'tissue', label: 'Tissue' },
  { value: 'cell', label: 'Cell' },
  { value: 'protein', label: 'Protein' },
  { value: 'concept', label: 'Concept' },
];

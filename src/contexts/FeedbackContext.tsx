'use client';

import { createContext, useContext, ReactNode } from 'react';

interface FeedbackContextValue {
  activeTopic?: string;
  topicName?: string;
  nodeCount?: number;
  edgeCount?: number;
  darkMode?: boolean;
}

const FeedbackContext = createContext<FeedbackContextValue | null>(null);

export const FeedbackProvider = ({ 
  children, 
  value 
}: { 
  children: ReactNode; 
  value?: FeedbackContextValue;
}) => {
  return (
    <FeedbackContext.Provider value={value || null}>
      {children}
    </FeedbackContext.Provider>
  );
};

export const useFeedbackContext = () => {
  return useContext(FeedbackContext);
};


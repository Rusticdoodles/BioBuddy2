"use client";

import React from 'react';

import { LoadingIndicator } from '@/components/LoadingIndicator';

export const TypingIndicator: React.FC = () => {
  return <LoadingIndicator 
  message="Thinking..." 
  variant="dots" 
  containerClassName="bg-slate-100 dark:bg-slate-700"
  />;
};


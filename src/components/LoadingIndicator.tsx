import React from 'react';

import { cn } from '@/lib/utils';

type LoadingIndicatorVariant = 'spinner' | 'dots';

interface LoadingIndicatorProps {
  message: string;
  variant?: LoadingIndicatorVariant;
  containerClassName?: string;
  textClassName?: string;
}

export const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({
  message,
  variant = 'spinner',
  containerClassName,
  textClassName,
}) => {
  return (
    <div
      className={cn(
        'flex items-center gap-2 px-4 py-3 bg-slate-100 dark:bg-slate-800 rounded-lg w-fit',
        containerClassName
      )}
      role="status"
      aria-live="polite"
    >
      {variant === 'spinner' ? (
        <div
          className="w-5 h-5 border-2 border-slate-400 dark:border-slate-600 border-t-blue-600 rounded-full animate-spin"
          aria-hidden="true"
        />
      ) : (
        <div className="flex gap-1" aria-hidden="true">
          <div
            className="w-2 h-2 bg-slate-400 dark:bg-blue-500 rounded-full animate-bounce"
            style={{ animationDelay: '0ms' }}
          />
          <div
            className="w-2 h-2 bg-slate-400 dark:bg-blue-500 rounded-full animate-bounce"
            style={{ animationDelay: '150ms' }}
          />
          <div
            className="w-2 h-2 bg-slate-400 dark:bg-blue-500 rounded-full animate-bounce"
            style={{ animationDelay: '300ms' }}
          />
        </div>
      )}
      <span className={cn('text-sm text-slate-700 dark:text-slate-300', textClassName)}>{message}</span>
    </div>
  );
};



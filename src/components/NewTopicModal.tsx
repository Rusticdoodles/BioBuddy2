'use client';

import { useEffect, useRef, useState } from 'react';
import { Sparkles, X } from 'lucide-react';

interface NewTopicModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (topicName: string) => void;
  defaultValue?: string;
}

export const NewTopicModal = ({
  isOpen,
  onClose,
  onConfirm,
  defaultValue = '',
}: NewTopicModalProps) => {
  const [topicName, setTopicName] = useState(defaultValue);
  const inputRef = useRef<HTMLInputElement>(null);
  const dialogTitleId = 'new-topic-modal-title';

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setTopicName(defaultValue);

    const timer = window.setTimeout(() => {
      inputRef.current?.focus();
      inputRef.current?.select();
    }, 100);

    return () => window.clearTimeout(timer);
  }, [defaultValue, isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') {
        return;
      }

      event.preventDefault();
      handleCancel();
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  const handleCancel = () => {
    setTopicName('');
    onClose();
  };

  const handleOverlayClick = () => {
    handleCancel();
  };

  const handleOverlayKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const isOverlayTarget = event.target === event.currentTarget;
    if (!isOverlayTarget) {
      return;
    }

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleCancel();
    }
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTopicName(event.target.value);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedName = topicName.trim();
    if (!trimmedName) {
      return;
    }

    onConfirm(trimmedName);
    setTopicName('');
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in"
      onClick={handleOverlayClick}
      onKeyDown={handleOverlayKeyDown}
      role="presentation"
      tabIndex={0}
      aria-label="Close new topic modal"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={dialogTitleId}
        className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl animate-scale-in dark:bg-slate-800"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-blue-600 dark:text-blue-400" aria-hidden />
            <h2
              id={dialogTitleId}
              className="text-xl font-semibold text-slate-900 dark:text-slate-100"
            >
              Create New Topic
            </h2>
          </div>
          <button
            type="button"
            onClick={handleCancel}
            className="rounded-lg p-1 transition-colors hover:bg-slate-100 dark:hover:bg-slate-700"
            aria-label="Close new topic modal"
          >
            <X className="h-5 w-5 text-slate-600 dark:text-slate-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label
              htmlFor="topic-name"
              className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              Topic name
            </label>
            <input
              ref={inputRef}
              id="topic-name"
              type="text"
              value={topicName}
              onChange={handleInputChange}
              placeholder="e.g., Cellular Respiration, DNA Structure..."
              className="w-full rounded-lg border-2 border-slate-300 bg-white px-4 py-3 text-slate-900 transition-all placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500"
              maxLength={50}
              autoComplete="off"
            />
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
              Choose a descriptive name for your learning topic
            </p>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleCancel}
              className="flex-1 rounded-lg border-2 border-slate-300 px-4 py-2.5 font-medium text-slate-700 transition-all hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!topicName.trim()}
              className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 font-medium text-white transition-all hover:bg-blue-700 hover-lift disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Sparkles className="h-4 w-4" aria-hidden />
              Create Topic
            </button>
          </div>
        </form>

        <p className="mt-4 text-center text-xs text-slate-500 dark:text-slate-400">
          Press{' '}
          <kbd className="rounded border border-slate-300 bg-slate-100 px-1.5 py-0.5 font-mono text-xs dark:border-slate-600 dark:bg-slate-700">
            Enter
          </kbd>{' '}
          to create or{' '}
          <kbd className="rounded border border-slate-300 bg-slate-100 px-1.5 py-0.5 font-mono text-xs dark:border-slate-600 dark:bg-slate-700">
            Esc
          </kbd>{' '}
          to cancel
        </p>
      </div>
    </div>
  );
};


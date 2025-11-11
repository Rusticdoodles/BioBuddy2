'use client';

import React, { useCallback, useState } from 'react';
import { TopicChat } from '@/types/concept-map-types';
import { NewTopicModal } from '@/components/NewTopicModal';

const TOPIC_CHATS_STORAGE_KEY = 'biobuddy-topic-chats';
const ACTIVE_TOPIC_STORAGE_KEY = 'biobuddy-active-topic';

interface TopicsSidebarProps {
  topicChats: TopicChat[];
  activeTopicId: string | null;
  onCreateTopic: (name: string) => void;
  onSwitchTopic: (topicId: string) => void;
  onDeleteTopic: (topicId: string) => void;
}

export const TopicsSidebar: React.FC<TopicsSidebarProps> = ({
  topicChats,
  activeTopicId,
  onCreateTopic,
  onSwitchTopic,
  onDeleteTopic,
}) => {
  const [isNewTopicModalOpen, setIsNewTopicModalOpen] = useState(false);

  
const handleDeleteTopic = useCallback(
  (
    event: React.MouseEvent<HTMLButtonElement>,
    topicId: string,
    topicName: string,
  ) => {
    event.stopPropagation();

    const isConfirmed = window.confirm(`Delete "${topicName}"?`);
    if (!isConfirmed) {
      return;
    }

    try {
      const storedTopicsValue = localStorage.getItem(TOPIC_CHATS_STORAGE_KEY);

      if (storedTopicsValue) {
        const parsedTopics = JSON.parse(storedTopicsValue) as unknown;

        if (Array.isArray(parsedTopics)) {
          const prunedTopics = (parsedTopics as TopicChat[]).filter(
            (storedTopic) => storedTopic.id !== topicId,
          );

          localStorage.setItem(
            TOPIC_CHATS_STORAGE_KEY,
            JSON.stringify(prunedTopics),
          );

          if (activeTopicId === topicId) {
            if (prunedTopics.length > 0) {
              localStorage.setItem(
                ACTIVE_TOPIC_STORAGE_KEY,
                prunedTopics[0].id,
              );
            } else {
              localStorage.removeItem(ACTIVE_TOPIC_STORAGE_KEY);
            }
          }
        } else {
          localStorage.removeItem(TOPIC_CHATS_STORAGE_KEY);
        }
      } else if (activeTopicId === topicId) {
        localStorage.removeItem(ACTIVE_TOPIC_STORAGE_KEY);
      }
    } catch (error) {
      console.error('Failed to remove topic from localStorage:', error);
    }

    onDeleteTopic(topicId);
  },
  [activeTopicId, onDeleteTopic],
);

  const handleOpenNewTopicModal = useCallback(() => {
    setIsNewTopicModalOpen(true);
  }, []);

  const handleCloseNewTopicModal = useCallback(() => {
    setIsNewTopicModalOpen(false);
  }, []);

  const handleConfirmNewTopic = useCallback(
    (name: string) => {
      onCreateTopic(name);
      setIsNewTopicModalOpen(false);
    },
    [onCreateTopic],
  );

  const handleTopicKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>, topicId: string) => {
      if (event.key !== 'Enter' && event.key !== ' ') {
        return;
      }

      event.preventDefault();
      onSwitchTopic(topicId);
    },
    [onSwitchTopic],
  );

  return (
    <>
      <div data-tour="topics-sidebar" className="flex w-64 flex-col border-r border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800">
      {/* Sidebar Header */}
      <div className="border-b border-slate-200 p-4 dark:border-slate-700">
        <h2 className="mb-3 text-lg font-semibold text-slate-900 dark:text-white">
          My Topics
        </h2>
        <button
          data-tour="create-topic-btn"
          onClick={handleOpenNewTopicModal}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 hover-lift"
          type="button"
          aria-haspopup="dialog"
          aria-expanded={isNewTopicModalOpen}
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Topic
        </button>
      </div>

      {/* Topics List */}
      <div className="flex-1 overflow-y-auto p-2">
        {topicChats.length === 0 ? (
          <div className="py-8 px-4 text-center">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              No topics yet. Create your first topic to get started!
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            {topicChats.map((topic, index) => (
              <div
                key={topic.id}
                className={`group relative cursor-pointer rounded-lg p-3 hover-scale ${
                  topic.id === activeTopicId
                    ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
                    : 'hover:bg-slate-50 dark:hover:bg-slate-700/50'
                } animate-fade-in-up`}
                style={{
                  animationDelay: `${index * 0.05}s`,
                }}
                onClick={() => onSwitchTopic(topic.id)}
                onKeyDown={(event) => handleTopicKeyDown(event, topic.id)}
                role="button"
                tabIndex={0}
                aria-pressed={topic.id === activeTopicId}
                aria-label={`Open topic ${topic.name}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className={`text-sm font-medium truncate ${
                      topic.id === activeTopicId
                        ? 'text-blue-900 dark:text-blue-100'
                        : 'text-slate-900 dark:text-white'
                    }`}>
                      {topic.name}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {topic.messages.length} messages
                      {topic.nodes.length > 0 && ` • ${topic.nodes.length} nodes`}
                    </p>
                  </div>
                  
                  {/* Delete button */}
                  <button
                    onClick={(event) =>
                      handleDeleteTopic(event, topic.id, topic.name)
                    }
                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 dark:hover:bg-red-900/20 rounded hover-scale-sm transition-opacity"
                    title="Delete topic"
                    aria-label="Delete topic"
                  >
                    <svg className="w-4 h-4 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      </div>

      <NewTopicModal
        isOpen={isNewTopicModalOpen}
        onClose={handleCloseNewTopicModal}
        onConfirm={handleConfirmNewTopic}
      />
    </>
  );
};


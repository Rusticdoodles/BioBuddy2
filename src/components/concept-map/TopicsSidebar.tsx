import React from 'react';
import { TopicChat } from '@/types/concept-map-types';

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
  return (
    <div data-tour="topics-sidebar" className="w-64 border-r border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 flex flex-col">
      {/* Sidebar Header */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-700">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">
          My Topics
        </h2>
        <button
          data-tour="create-topic-btn"
          onClick={() => {
            const name = prompt('Topic name:');
            if (name) onCreateTopic(name);
          }}
          className="w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg hover-lift flex items-center justify-center gap-2 text-sm font-medium"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Topic
        </button>
      </div>

      {/* Topics List */}
      <div className="flex-1 overflow-y-auto p-2">
        {topicChats.length === 0 ? (
          <div className="text-center py-8 px-4">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              No topics yet. Create your first topic to get started!
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            {topicChats.map((topic, index) => (
              <div
                key={topic.id}
                className={`group relative p-3 rounded-lg cursor-pointer hover-scale ${
                  topic.id === activeTopicId
                    ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
                    : 'hover:bg-slate-50 dark:hover:bg-slate-700/50'
                } animate-fade-in-up`}
                style={{
                  animationDelay: `${index * 0.05}s`,
                }}
                onClick={() => onSwitchTopic(topic.id)}
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
                    onClick={(e) => {
                      e.stopPropagation();
                      if (window.confirm(`Delete "${topic.name}"?`)) {
                        onDeleteTopic(topic.id);
                      }
                    }}
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
  );
};


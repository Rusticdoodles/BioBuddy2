"use client";

import React, { useRef, useEffect, useState } from 'react';
import { Send, MessageSquare, Trash2, Copy, Check, FileText, ArrowDown, ArrowUp, RotateCw } from 'lucide-react';
import { ChatMessage } from '@/types/concept-map-types';

interface ChatInterfaceProps {
  chatMessages: ChatMessage[];
  chatInput: string;
  setChatInput: (value: string) => void;
  onSendMessage: (message: string) => void;
  isChatLoading: boolean;
  onClearChat: () => void;
  onToggleChatMode: () => void;
  onRefineMessage: (messageIndex: number, refinementType: 'simplify' | 'detail' | 'regenerate') => void;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  chatMessages,
  chatInput,
  setChatInput,
  onSendMessage,
  isChatLoading,
  onClearChat,
  onToggleChatMode,
  onRefineMessage
}) => {
  const chatMessagesEndRef = useRef<HTMLDivElement>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  useEffect(() => {
    // Auto-scroll to bottom when new messages arrive
    if (chatMessagesEndRef.current) {
      chatMessagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages]);

  const handleCopyMessage = (content: string, index: number) => {
    navigator.clipboard.writeText(content).then(() => {
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    }).catch(err => {
      console.error('Failed to copy:', err);
    });
  };

  const handleSendMessage = () => {
    if (chatInput.trim() && !isChatLoading) {
      onSendMessage(chatInput);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && !isChatLoading) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Header with title and toggle button */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
          AI Chat
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={onClearChat}
            className="px-3 py-1.5 text-sm bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors flex items-center gap-2"
            title="Clear all data (chat history and concept map)"
          >
            <Trash2 className="w-4 h-4" />
            Clear All
          </button>
          <button
            onClick={onToggleChatMode}
            className="px-3 py-1.5 text-sm bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors flex items-center gap-2 shrink-0 mr-12"
            title="Switch to Notes Mode"
          >
            <FileText className="w-4 h-4" />
            Notes Mode
          </button>
        </div>
      </div>



      {/* Header with Clear Chat button
      {chatMessages.length > 0 && (
        <div className="flex justify-between items-center mb-3 pb-2 border-b border-slate-200 dark:border-slate-700">
          <span className="text-sm text-slate-600 dark:text-slate-400">
            {chatMessages.length} {chatMessages.length === 1 ? 'message' : 'messages'}
          </span>
          <button
            onClick={onClearChat}
            className="flex items-center gap-1 px-3 py-1.5 text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
            aria-label="Clear chat history"
          >
            <Trash2 className="w-3 h-3" />
            Clear Chat
          </button>
        </div>
      )} */}
  
      
      {/* Chat Messages Area */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-4 px-2 py-2 min-h-0">
        {chatMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <MessageSquare className="w-12 h-12 text-slate-300 dark:text-slate-600 mb-4" />
            <h3 className="text-lg font-medium text-slate-700 dark:text-slate-300 mb-2">
              Start a conversation
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs">
              Ask me anything about biology, medicine, or any subject you&apos;re studying. I&apos;ll explain it and generate a concept map!
            </p>
            <div className="mt-6 space-y-2 text-left">
              <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">Try asking:</p>
              <div className="space-y-1 text-xs text-slate-600 dark:text-slate-300">
                <p>• &quot;Explain photosynthesis to me&quot;</p>
                <p>• &quot;What is the Krebs cycle?&quot;</p>
                <p>• &quot;How does DNA replication work?&quot;</p>
              </div>
            </div>
          </div>
        ) : (
          chatMessages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className="max-w-[80%] flex flex-col gap-2">
                <div
                  className={`rounded-lg px-4 py-2 relative group ${
                    message.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white'
                  }`}
                >
                  {/* Show loading state if this is being regenerated */}
                  {message.role === 'assistant' && isChatLoading && index === chatMessages.length - 1 ? (
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                          fill="none"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      <span className="text-sm">Regenerating...</span>
                    </div>
                  ) : (
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  )}
                  
                  {/* Copy button for AI messages */}
                  {message.role === 'assistant' && (
                    <button
                      onClick={() => handleCopyMessage(message.content, index)}
                      className="absolute top-2 right-2 p-1.5 bg-white dark:bg-slate-600 rounded opacity-0 group-hover:opacity-100 transition-opacity hover:bg-slate-50 dark:hover:bg-slate-500"
                      aria-label="Copy message"
                      title="Copy to clipboard"
                    >
                      {copiedIndex === index ? (
                        <Check className="w-3 h-3 text-green-600 dark:text-green-400" />
                      ) : (
                        <Copy className="w-3 h-3 text-slate-600 dark:text-slate-300" />
                      )}
                    </button>
                  )}
                </div>
                
                {/* Refinement buttons for AI messages */}
                {message.role === 'assistant' && !isChatLoading && (
                  <div className="flex gap-2 px-1">
                    <button
                      onClick={() => onRefineMessage(index, 'simplify')}
                      className="flex items-center gap-1 px-2 py-1 text-xs bg-slate-200 dark:bg-slate-600 hover:bg-slate-300 dark:hover:bg-slate-500 text-slate-700 dark:text-slate-200 rounded transition-colors"
                      title="Explain in simpler terms"
                    >
                      <ArrowDown className="w-3 h-3" />
                      Simplify
                    </button>
                    <button
                      onClick={() => onRefineMessage(index, 'detail')}
                      className="flex items-center gap-1 px-2 py-1 text-xs bg-slate-200 dark:bg-slate-600 hover:bg-slate-300 dark:hover:bg-slate-500 text-slate-700 dark:text-slate-200 rounded transition-colors"
                      title="Add more detail"
                    >
                      <ArrowUp className="w-3 h-3" />
                      More Detail
                    </button>
                    <button
                      onClick={() => onRefineMessage(index, 'regenerate')}
                      className="flex items-center gap-1 px-2 py-1 text-xs bg-slate-200 dark:bg-slate-600 hover:bg-slate-300 dark:hover:bg-slate-500 text-slate-700 dark:text-slate-200 rounded transition-colors"
                      title="Regenerate response"
                    >
                      <RotateCw className="w-3 h-3" />
                      Regenerate
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
        {/* Scroll anchor */}
        <div ref={chatMessagesEndRef} />
        {isChatLoading && (
          <div className="flex justify-start">
            <div className="max-w-[80%] rounded-lg px-4 py-2 bg-slate-100 dark:bg-slate-700">
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                <span className="text-sm">Thinking...</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Chat Input */}
      <div className="flex gap-2">
        <input
          type="text"
          value={chatInput}
          onChange={(e) => setChatInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask me anything..."
          className="flex-1 px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400"
        />
        <button
          onClick={handleSendMessage}
          disabled={!chatInput.trim() || isChatLoading}
          className={`px-4 py-3 rounded-lg transition-colors ${
            chatInput.trim() && !isChatLoading
              ? 'bg-blue-600 hover:bg-blue-700 text-white'
              : 'bg-slate-300 dark:bg-slate-600 text-slate-500 dark:text-slate-400 cursor-not-allowed'
          }`}
          aria-label="Send message"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

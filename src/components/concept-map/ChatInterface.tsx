"use client";

import React, { useRef, useEffect, useState } from 'react';
import { Send, MessageSquare, Trash2, Copy, Check, FileText, ArrowDown, ArrowUp, RotateCw, Plus } from 'lucide-react';
import { ChatMessage } from '@/types/concept-map-types';
import { TypingIndicator } from './TypingIndicator';

interface ChatInterfaceProps {
  chatMessages: ChatMessage[];
  chatInput: string;
  setChatInput: (value: string) => void;
  onSendMessage: (message: string) => void;
  isChatLoading: boolean;
  onClearChat: () => void;
  onToggleChatMode: () => void;
  onRefineMessage: (messageIndex: number, refinementType: 'simplify' | 'detail' | 'regenerate') => void;
  autoGenerateMap: boolean;
  setAutoGenerateMap: (value: boolean) => void;
  onSearchBetterImages: (messageIndex: number, searchTerms: string[]) => void;
  loadingBetterImages: number | null;
  isLoadingMapUpdate: boolean;
  onCreateNewTopic?: (topicName: string) => void;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  chatMessages,
  chatInput,
  setChatInput,
  onSendMessage,
  isChatLoading,
  onClearChat,
  onToggleChatMode,
  onRefineMessage,
  autoGenerateMap,
  setAutoGenerateMap,
  onSearchBetterImages,
  loadingBetterImages,
  isLoadingMapUpdate,
  onCreateNewTopic
}) => {
  const chatMessagesEndRef = useRef<HTMLDivElement>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  useEffect(() => {
    // Auto-scroll to bottom when new messages arrive
    if (chatMessagesEndRef.current) {
      chatMessagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages]);

  useEffect(() => {
    // Auto-scroll to bottom when loading map update starts
    if (isLoadingMapUpdate && chatMessagesEndRef.current) {
      console.log('🔄 isLoadingMapUpdate is true - showing loading indicator');
      setTimeout(() => {
        chatMessagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, [isLoadingMapUpdate]);

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
      setChatInput('');
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
            className="px-3 py-1.5 text-sm bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 hover-scale-sm transition-colors flex items-center gap-2"
            title="Clear all data (chat history and concept map)"
            aria-label="Clear all data"
          >
            <Trash2 className="w-4 h-4" />
            Clear All
          </button>
          <button
            data-tour="notes-mode-toggle"
            onClick={onToggleChatMode}
            className="px-3 py-1.5 text-sm bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-900/50 hover-scale-sm transition-colors flex items-center gap-2 shrink-0 mr-12"
            title="Switch to Notes Mode"
            aria-label="Switch to Notes Mode"
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
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in-up`}
              style={{
                animationDelay: `${index * 0.05}s`,
              }}
            >
              <div className="max-w-[80%] flex flex-col gap-2">
                <div
                  className={`rounded-lg px-4 py-2 relative group ${
                    message.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white'
                  }`}
                >
                  {/* Show loading state if this message is being generated/regenerated */}
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
                      <span className="text-sm">Map generating...</span>
                    </div>
                  ) : (
                    <>  {/* Code for visual resources/images in AI chat */}
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      {message.isSuggestion && message.suggestedTopicName && onCreateNewTopic && (
                        <div className="flex gap-2 mt-3">
                          <button
                            onClick={() => {
                              onCreateNewTopic(message.suggestedTopicName!);
                            }}
                            className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg hover-lift transition-colors flex items-center gap-2"
                            aria-label={`Create ${message.suggestedTopicName} topic`}
                          >
                            <Plus className="w-4 h-4" />
                            Create &quot;{message.suggestedTopicName}&quot; Topic
                          </button>
                          <button
                            onClick={() => {
                              // Send override message
                              onSendMessage("No, add it here anyway");
                            }}
                            className="flex-1 px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg hover-scale transition-colors"
                            aria-label="Continue in this topic"
                          >
                            Continue in This Topic
                          </button>
                        </div>
                      )}
                      {message.images && message.images.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-600">
                          <div className="flex items-center gap-1 mb-2">
                            <svg className="w-4 h-4 text-slate-600 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                              Visual Resources
                              {message.imageSource === 'google' && (
                                <span className="ml-1 px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded text-xs">
                                  Enhanced
                                </span>
                              )}
                            </span>
                          </div>
                          <div className="grid grid-cols-3 gap-2">
                            {message.images.map((image, idx) => (
                              <a
                                key={idx}
                                href={image.pageUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group relative aspect-square rounded-lg overflow-hidden border border-slate-200 dark:border-slate-600 hover:border-blue-500 dark:hover:border-blue-400 transition-colors"
                                title={image.title}
                              >
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src={image.thumbnailUrl}
                                  alt={image.title}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                                  loading="lazy"
                                />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                              </a>
                            ))}
                          </div>
                          
                          <div className="flex items-center justify-between mt-2">
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                              Images from{' '}
                              {message.imageSource === 'google' ? (
                                <span className="font-medium">Google Search</span>
                              ) : (
                                <a href="https://commons.wikimedia.org" target="_blank" rel="noopener noreferrer" className="underline hover:text-slate-700 dark:hover:text-slate-300">
                                  Wikimedia Commons
                                </a>
                              )}
                            </p>
                            
                            {/* Better Images button - only show for Wikimedia images */}
                            {message.imageSource !== 'google' && message.searchTerms && message.searchTerms.length > 0 && (
                              <button
                                onClick={() => {
                                  console.log('🔴 Button clicked!', { index, searchTerms: message.searchTerms });
                                  onSearchBetterImages(index, message.searchTerms!);
                                }}
                                disabled={loadingBetterImages === index}
                                className="flex items-center gap-1 px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900/30 hover:bg-blue-200 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded hover-scale-sm transition-colors disabled:opacity-50"
                                aria-label="Find better images"
                              >
                                {loadingBetterImages === index ? (
                                  <>
                                    <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24">
                                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                    Searching...
                                  </>
                                ) : (
                                  <>
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                    Find Better Images
                                  </>
                                )}
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                    </>
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
                      className="flex items-center gap-1 px-2 py-1 text-xs bg-slate-200 dark:bg-slate-600 hover:bg-slate-300 dark:hover:bg-slate-500 text-slate-700 dark:text-slate-200 rounded hover-scale-sm transition-colors"
                      title="Explain in simpler terms"
                      aria-label="Simplify explanation"
                    >
                      <ArrowDown className="w-3 h-3" />
                      Simplify
                    </button>
                    <button
                      onClick={() => onRefineMessage(index, 'detail')}
                      className="flex items-center gap-1 px-2 py-1 text-xs bg-slate-200 dark:bg-slate-600 hover:bg-slate-300 dark:hover:bg-slate-500 text-slate-700 dark:text-slate-200 rounded hover-scale-sm transition-colors"
                      title="Add more detail"
                      aria-label="Add more detail"
                    >
                      <ArrowUp className="w-3 h-3" />
                      More Detail
                    </button>
                    <button
                      onClick={() => onRefineMessage(index, 'regenerate')}
                      className="flex items-center gap-1 px-2 py-1 text-xs bg-slate-200 dark:bg-slate-600 hover:bg-slate-300 dark:hover:bg-slate-500 text-slate-700 dark:text-slate-200 rounded hover-scale-sm transition-colors"
                      title="Regenerate response"
                      aria-label="Regenerate response"
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
        {isLoadingMapUpdate && (
          <div className="flex justify-start animate-fade-in">
            <div className="max-w-[80%] rounded-lg px-4 py-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
              <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
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
                <span className="text-sm">Preparing map update...</span>
              </div>
            </div>
          </div>
        )}
        {/* Show typing indicator while loading */}
        {isChatLoading && (chatMessages.length === 0 || chatMessages[chatMessages.length - 1]?.role !== 'assistant') && (
          <div className="flex justify-start mb-4 animate-fade-in">
            <TypingIndicator />
          </div>
        )}
      </div>

      {/* Chat Input */}
      <div className="space-y-2">
        {/* Auto-generate toggle */}
        {chatMessages.length > 0 && (
          <div className="flex items-center gap-2">
            <input
              data-tour="auto-generate-toggle"
              type="checkbox"
              id="auto-generate-map"
              checked={autoGenerateMap}
              onChange={(e) => setAutoGenerateMap(e.target.checked)}
              className="w-4 h-4 text-blue-600 bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 rounded focus:ring-blue-500"
            />
            <label 
              htmlFor="auto-generate-map" 
              className="text-xs text-slate-600 dark:text-slate-400 cursor-pointer select-none"
            >
              Auto-generate concept maps for new topics
            </label>
          </div>
        )}
        
        <div className="flex gap-2">
          <input
            data-tour="chat-input"
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
                ? 'bg-blue-600 hover:bg-blue-700 text-white hover-lift'
                : 'bg-slate-300 dark:bg-slate-600 text-slate-500 dark:text-slate-400 cursor-not-allowed'
            }`}
            aria-label="Send message"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

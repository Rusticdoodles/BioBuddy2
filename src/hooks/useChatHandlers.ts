import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { ChatMessage, LoadingState, TopicChat } from '@/types/concept-map-types';
import { shouldGenerateConceptMap, wantsToUpdateMap } from '@/utils/intent-detection';
import { GoogleImage } from '@/utils/google-images';

interface UseChatHandlersProps {
  activeTopicId: string | null;
  activeTopic: TopicChat | undefined;
  setTopicChats: React.Dispatch<React.SetStateAction<TopicChat[]>>;
  chatMessages: ChatMessage[];
  autoGenerateMap: boolean;
  generateConceptMapFromText: (text: string) => Promise<void>;
  setShowSuccessBanner: (show: boolean) => void;
  setPendingMapUpdate: (update: { newNodes: Array<{ id?: string; label: string; type: string }>; newEdges: Array<{ source: string; target: string; label?: string }>; newInformation: string } | null) => void;
  setShowAddToMapPrompt: (show: boolean) => void;
  setIsLoadingMapUpdate: (loading: boolean) => void;
}

export const useChatHandlers = ({
  activeTopicId,
  activeTopic,
  setTopicChats,
  chatMessages,
  autoGenerateMap,
  generateConceptMapFromText,
  setShowSuccessBanner,
  setPendingMapUpdate,
  setShowAddToMapPrompt,
  setIsLoadingMapUpdate,
}: UseChatHandlersProps) => {
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [loadingBetterImages, setLoadingBetterImages] = useState<number | null>(null);

  const handleSendChatMessage = useCallback(async (userMessage: string) => {
    if (!userMessage.trim()) return;

    const userMessage_trimmed = userMessage.trim();

    if (!activeTopicId || !activeTopic) {
      console.error('❌ No active topic - cannot send message');
      toast.error('Please select or create a topic first');
      return;
    }

    // Detect and handle map update requests
    if (wantsToUpdateMap(userMessage_trimmed)) {
      if (!activeTopic) {
        toast.error('Please create or select a topic first');
        return;
      }
      
      if (!activeTopic.nodes || activeTopic.nodes.length === 0) {
        toast.error('No existing map to update. Please ask a question first to generate a concept map.');
        return;
      }
      
      console.log('🎯 DETECTED: User wants to update map');
      
      const lastAssistantMessage = activeTopic.messages
        .slice()
        .reverse()
        .find(m => m.role === 'assistant');
      
      if (!lastAssistantMessage) {
        toast.error('No recent information to add to map');
        return;
      }
      
      const userMsg = { role: 'user' as const, content: userMessage_trimmed };
      setTopicChats(prev => prev.map(topic =>
        topic.id === activeTopicId
          ? { ...topic, messages: [...topic.messages, userMsg], updatedAt: new Date().toISOString() }
          : topic
      ));
      
      setIsLoadingMapUpdate(true);
      
      try {
        console.log('🔄 Calling update-map API...');
        
        const response = await fetch('/api/update-map', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            currentMap: {
              nodes: activeTopic.nodes,
              edges: activeTopic.edges
            },
            newInformation: lastAssistantMessage.content,
            userMessage: userMessage_trimmed
          })
        });
        
        if (!response.ok) {
          let errorMessage = `Request failed with status ${response.status}`;
          try {
            const errorData = await response.json();
            errorMessage = errorData.error || errorData.details || errorMessage;
          } catch {
            try {
              const errorText = await response.text();
              errorMessage = errorText.substring(0, 200) || errorMessage;
            } catch {
              // Give up
            }
          }
          throw new Error(errorMessage);
        }
        
        const data = await response.json();
        
        if (data.newNodes && data.newNodes.length > 0) {
          console.log('✅ Received map update:', data.newNodes.length, 'new nodes');
          
          setPendingMapUpdate({
            newNodes: data.newNodes,
            newEdges: data.newEdges || [],
            newInformation: lastAssistantMessage.content
          });
          setShowAddToMapPrompt(true);
        } else {
          console.log('⚠️ No new nodes to add');
          toast.info('No new concepts to add to the map');
        }
        
      } catch (error) {
        console.error('❌ Error getting map update:', error);
        toast.error('Failed to generate map update', {
          description: error instanceof Error ? error.message : 'Unknown error',
        });
      } finally {
        setIsLoadingMapUpdate(false);
      }
      
      return;
    }

    // Prepare user message
    const userMsg = { role: 'user' as const, content: userMessage_trimmed };
    const updatedChatMessages = [...chatMessages, userMsg];
    
    // Check if this is an override message (user continuing in current topic after suggestion)
    const overrideSignals = [
      'no, i am correct',
      'no i am correct',
      'tell me anyway',
      'add it here',
      'add it to this',
      'keep it here',
      'stay in this topic',
      'add to this map',
      'merge it here',
      'just add it',
      'ignore that',
      'override',
      'continue here',
      'add anyway',
      'add it here anyway',
      'tell me anyway',
      'just tell me',
      'continue in this topic'
    ];
    const messageLower = userMessage_trimmed.toLowerCase();
    const isOverride = overrideSignals.some(signal => messageLower.includes(signal));
    
    // Check if there's no existing map yet (first map for this topic)
    const hasNoMapYet = !activeTopic?.conceptMapData?.nodes || activeTopic.conceptMapData.nodes.length === 0;
    
    const currentMessages = activeTopic?.messages || [];
    let shouldGenerate = autoGenerateMap && shouldGenerateConceptMap(userMessage_trimmed, currentMessages);
    
    // If this is an override message and there's no map yet, force map generation
    if (isOverride && hasNoMapYet) {
      console.log('🔄 Override message detected with no existing map - forcing map generation');
      shouldGenerate = true;
    }

    setTopicChats(prev => prev.map(topic =>
      topic.id === activeTopicId
        ? { ...topic, messages: [...topic.messages, userMsg], updatedAt: new Date().toISOString() }
        : topic
    ));
    setIsChatLoading(true);

    try {
      console.log("🤖 Sending chat message to AI:", userMessage_trimmed);

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage_trimmed,
          conversationHistory: updatedChatMessages,
          currentTopic: activeTopic?.name || null
        })
      });

      console.log("📊 Chat API Response status:", response.status);

      if (!response.ok) {
        let errorMessage = `Request failed with status ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.details || errorMessage;
        } catch {
          try {
            const errorText = await response.text();
            errorMessage = errorText.substring(0, 200) || errorMessage;
          } catch {
            // Give up
          }
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log("✅ Chat API Response data:", data);

      if (!data.message) {
        throw new Error('Invalid response format from chat API');
      }

      // Handle topic drift suggestion
      if (data.isSuggestion && data.suggestedTopicName) {
        console.log('💡 AI suggested creating new topic:', data.suggestedTopicName);
        
        // Show the suggestion message in chat
        setTopicChats(prev => prev.map(topic =>
          topic.id === activeTopicId
            ? { 
                ...topic, 
                messages: [...topic.messages, { 
                  role: 'assistant', 
                  content: data.message,
                  isSuggestion: true,
                  suggestedTopicName: data.suggestedTopicName
                }], 
                updatedAt: new Date().toISOString()
              }
            : topic
        ));
        
        return; // Don't generate concept map for suggestions
      }

      let sanitizedMessage = data.message;

      if (sanitizedMessage.includes('IMAGE_SEARCH_TERMS:') || sanitizedMessage.includes('CONCEPT_MAP:')) {
        console.warn('⚠️ Client-side sanitization needed');
        sanitizedMessage = sanitizedMessage
          .split('IMAGE_SEARCH_TERMS:')[0]
          .split('CONCEPT_MAP:')[0]
          .trim();
      }

      // If override message and API returned a concept map but shouldGenerate is false, still use it
      const shouldUseMap = shouldGenerate || (isOverride && hasNoMapYet && data.conceptMap);
      
      setTopicChats(prev => prev.map(topic =>
        topic.id === activeTopicId
          ? { 
              ...topic, 
              messages: [...topic.messages, { 
                role: 'assistant', 
                content: sanitizedMessage,
                images: data.images || [],
                imageSource: 'wikimedia',
                searchTerms: data.searchTerms,
              }], 
              conceptMapData: shouldUseMap ? (data.conceptMap || topic.conceptMapData) : topic.conceptMapData,
              loadingState: 'success' as LoadingState,
              updatedAt: new Date().toISOString()
            }
          : topic
      ));

      console.log("✅ Chat message processed successfully!");

      if (shouldGenerate || (isOverride && hasNoMapYet && data.conceptMap)) {
        const effectiveShouldGenerate = shouldGenerate || (isOverride && hasNoMapYet);
        console.log(`✅ ${effectiveShouldGenerate ? 'shouldGenerate' : 'override'} is TRUE - proceeding with map generation`);
        if (data.conceptMap && data.conceptMap.nodes && data.conceptMap.edges) {
          console.log('📊 Using concept map from Claude');
          setShowSuccessBanner(true);
          setTimeout(() => setShowSuccessBanner(false), 5000);
        } else {
          console.log('⚠️ No concept map in response, generating from explanation');
          await generateConceptMapFromText(data.message);
        }
      } else {
        console.log('⏭️ shouldGenerate is FALSE - Skipping concept map generation');
      }

    } catch (error) {
      console.error("❌ Error sending chat message:", error);
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      toast.error('AI chat failed', {
        description: `Sorry, I encountered an error: ${errorMessage}`,
        action: {
          label: 'Retry',
          onClick: () => {
            setTopicChats(prev => prev.map(topic =>
              topic.id === activeTopicId
                ? { ...topic, messages: topic.messages.slice(0, -1), updatedAt: new Date().toISOString() }
                : topic
            ));
            handleSendChatMessage(userMessage);
          }
        },
        duration: 5000,
      });
      
      setTopicChats(prev => prev.map(topic =>
        topic.id === activeTopicId
          ? { ...topic, messages: topic.messages.slice(0, -1), updatedAt: new Date().toISOString() }
          : topic
      ));
    } finally {
      setIsChatLoading(false);
    }
  }, [
    activeTopicId,
    activeTopic,
    setTopicChats,
    chatMessages,
    autoGenerateMap,
    generateConceptMapFromText,
    setShowSuccessBanner,
    setPendingMapUpdate,
    setShowAddToMapPrompt,
    setIsLoadingMapUpdate,
  ]);

  const handleRefineMessage = useCallback(async (messageIndex: number, refinementType: 'simplify' | 'detail' | 'regenerate') => {
    const originalQuestion = chatMessages[messageIndex - 1]?.content;
    
    if (!originalQuestion) {
      console.error('Could not find original question for refinement');
      return;
    }
    
    if (refinementType === 'regenerate') {
      console.log('🔄 Regenerating response');
      setIsChatLoading(true);
      
      try {
        const conversationHistory = chatMessages.slice(0, messageIndex - 1);
        
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: originalQuestion,
            conversationHistory,
            currentTopic: activeTopic?.name || null
          }),
        });

        if (!response.ok) {
          let errorMessage = `Request failed with status ${response.status}`;
          try {
            const errorData = await response.json();
            errorMessage = errorData.error || errorData.details || errorMessage;
          } catch {
            try {
              const errorText = await response.text();
              errorMessage = errorText.substring(0, 200) || errorMessage;
            } catch {
              // Give up
            }
          }
          throw new Error(errorMessage);
        }

        const data = await response.json();

        setTopicChats(prev => prev.map(topic => {
          if (topic.id === activeTopicId) {
            const updated = [...topic.messages];
            updated[messageIndex] = { 
              role: 'assistant', 
              content: data.message, 
              images: data.images || [],
              imageSource: 'wikimedia',
              searchTerms: data.searchTerms
            } as ChatMessage;
            return {
              ...topic,
              messages: updated,
              conceptMapData: data.conceptMap || topic.conceptMapData,
              loadingState: (data.conceptMap && data.conceptMap.nodes && data.conceptMap.edges) ? 'success' as LoadingState : topic.loadingState,
              updatedAt: new Date().toISOString()
            };
          }
          return topic;
        }));

        const shouldGenerate = autoGenerateMap && shouldGenerateConceptMap(originalQuestion, conversationHistory);

        if (shouldGenerate) {
          if (data.conceptMap && data.conceptMap.nodes && data.conceptMap.edges) {
            console.log('📊 Using regenerated concept map from Claude');
            setShowSuccessBanner(true);
            setTimeout(() => setShowSuccessBanner(false), 5000);
          } else {
            await generateConceptMapFromText(data.message);
          }
        } else {
          console.log('⏭️ Skipping concept map generation for regenerated response');
        }

      } catch (error) {
        console.error("❌ Error regenerating response:", error);
        
        toast.error('Failed to regenerate response', {
          description: error instanceof Error ? error.message : 'Unknown error',
          action: {
            label: 'Retry',
            onClick: () => handleRefineMessage(messageIndex, 'regenerate')
          },
          duration: 5000,
        });
      } finally {
        setIsChatLoading(false);
      }
      
      return;
    }
    
    let refinedPrompt = '';
    if (refinementType === 'simplify') {
      refinedPrompt = `${originalQuestion}\n\nPlease explain this in simpler terms, as if explaining to someone with basic knowledge. Use everyday language and analogies.`;
    } else if (refinementType === 'detail') {
      refinedPrompt = `${originalQuestion}\n\nPlease provide a more detailed explanation with additional examples, mechanisms, and technical information.`;
    }
    
    console.log('🔄 Refining message with type:', refinementType);
    await handleSendChatMessage(refinedPrompt);
  }, [chatMessages, activeTopicId, activeTopic, setTopicChats, autoGenerateMap, generateConceptMapFromText, handleSendChatMessage, setShowSuccessBanner]);

  const handleSearchBetterImages = useCallback(async (messageIndex: number, searchTerms: string[]) => {
    console.log('🔵 Find Better Images clicked!', { messageIndex, searchTerms });
    setLoadingBetterImages(messageIndex);
    
    try {
      let images: GoogleImage[] = [];
      
      for (const term of searchTerms) {
        console.log('🔵 Fetching Google images for term:', term);
        const response = await fetch('/api/google-images', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ searchTerm: term, limit: 3 }),
        });

        if (!response.ok) {
          console.error('Failed to fetch Google images:', response.statusText);
          continue;
        }

        const data = await response.json();
        if (data.images && data.images.length > 0) {
          images = data.images;
          console.log(`📸 Found ${data.images.length} Google images for "${term}"`);
          break;
        }
      }
      
      if (images.length === 0) {
        toast.error('No additional images found', {
          description: 'Try refining your question or topic',
        });
        return;
      }
      
      setTopicChats(prev => prev.map(topic => {
        if (topic.id === activeTopicId) {
          const updated = [...topic.messages];
          if (updated[messageIndex]) {
            updated[messageIndex] = {
              ...updated[messageIndex],
              images: images,
              imageSource: 'google',
            };
          }
          return {
            ...topic,
            messages: updated,
            updatedAt: new Date().toISOString()
          };
        }
        return topic;
      }));
      
      toast.success('Updated with Google images!');
      
    } catch (error) {
      console.error('Error searching better images:', error);
      toast.error('Failed to search additional sources');
    } finally {
      setLoadingBetterImages(null);
    }
  }, [activeTopicId, setTopicChats]);

  return {
    isChatLoading,
    loadingBetterImages,
    handleSendChatMessage,
    handleRefineMessage,
    handleSearchBetterImages,
  };
};


import { useState, useCallback, useEffect, useMemo } from 'react';
import { toast } from 'sonner';
import { TopicChat } from '@/types/concept-map-types';

const TOPIC_CHATS_KEY = 'biobuddy-topic-chats';
const ACTIVE_TOPIC_KEY = 'biobuddy-active-topic';

export const useTopicManagement = () => {
  const [topicChats, setTopicChats] = useState<TopicChat[]>([]);
  const [activeTopicId, setActiveTopicId] = useState<string | null>(null);

  // Derived state for active topic
  const activeTopic = useMemo(() => 
    topicChats.find(t => t.id === activeTopicId), 
    [topicChats, activeTopicId]
  );

  const isValidTopicChat = useCallback((topic: unknown): topic is TopicChat => {
    if (!topic || typeof topic !== 'object') return false;

    const candidate = topic as Partial<TopicChat>;

    if (typeof candidate.id !== 'string') return false;
    if (typeof candidate.name !== 'string') return false;
    if (!Array.isArray(candidate.messages)) return false;

    return true;
  }, []);

  // Load topics from localStorage with validation
  useEffect(() => {
    try {
      const stored = localStorage.getItem(TOPIC_CHATS_KEY);
      const savedActiveId = localStorage.getItem(ACTIVE_TOPIC_KEY);

      if (!stored) return;

      const parsed = JSON.parse(stored) as unknown;

      if (!Array.isArray(parsed)) {
        console.warn('⚠️ Stored topics were not an array, clearing data');
        localStorage.removeItem(TOPIC_CHATS_KEY);
        return;
      }

      console.log('📥 Loading from localStorage:', {
        topicCount: parsed.length,
        topics: parsed.map((topic) => {
          if (!isValidTopicChat(topic)) {
            return {
              name: 'Invalid topic',
              nodes: 0,
              edges: 0,
            };
          }

          return {
            name: topic.name,
            nodes: topic.nodes?.length || 0,
            edges: topic.edges?.length || 0,
          };
        }),
      });

      const validTopics = parsed.filter((topic): topic is TopicChat => {
        const isValid = isValidTopicChat(topic);
        if (!isValid) {
          console.warn('⚠️ Invalid topic found, skipping:', topic);
        }
        return isValid;
      });

      if (validTopics.length !== parsed.length) {
          console.warn('⚠️ Some topics were invalid and removed');
      }

      if (validTopics.length === 0) {
        setTopicChats([]);
        setActiveTopicId(null);
        return;
      }

      setTopicChats(validTopics);

      if (savedActiveId) {
        const savedTopic = validTopics.find(topic => topic.id === savedActiveId);
        if (savedTopic) {
          setActiveTopicId(savedActiveId);
          console.log('✅ Topics loaded successfully');
          return;
        }
      }

      setActiveTopicId(validTopics[0].id);
      console.log('✅ Topics loaded successfully');
    } catch (error) {
      console.error('❌ Failed to load from localStorage:', error);
      // Clear corrupted data
      localStorage.removeItem(TOPIC_CHATS_KEY);
    }
  }, [isValidTopicChat]);

  // Auto-save topic chats to localStorage
  useEffect(() => {
    if (topicChats.length > 0) {
      try {
        localStorage.setItem(TOPIC_CHATS_KEY, JSON.stringify(topicChats));
        if (activeTopicId) {
          localStorage.setItem(ACTIVE_TOPIC_KEY, activeTopicId);
        }
        console.log('💾 Auto-saved to localStorage:', {
          topicsCount: topicChats.length,
          activeTopicNodes: topicChats.find(t => t.id === activeTopicId)?.nodes.length || 0,
          activeTopicEdges: topicChats.find(t => t.id === activeTopicId)?.edges.length || 0,
        });
      } catch (error) {
        console.error('Error saving topic chats:', error);
      }
    }
  }, [topicChats, activeTopicId]);

  // Force save on page unload as safety net
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (topicChats.length > 0) {
        try {
          localStorage.setItem(TOPIC_CHATS_KEY, JSON.stringify(topicChats));
          console.log('💾 Saved on page unload');
        } catch (error) {
          console.error('Failed to save on unload:', error);
        }
      }
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [topicChats]);

  const handleCreateTopic = useCallback((name: string) => {
    const newTopic: TopicChat = {
      id: `topic-${Date.now()}`,
      name: name.trim() || 'New Topic',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages: [],
      nodes: [],
      edges: [],
      conceptMapData: null,
      loadingState: 'idle',
    };
    
    setTopicChats(prev => [...prev, newTopic]);
    setActiveTopicId(newTopic.id);
    
    toast.success('New topic created!', {
      description: `Created "${newTopic.name}"`,
    });
    
    console.log('📝 Created new topic:', newTopic.name);
  }, []);

  const handleSwitchTopic = useCallback((topicId: string) => {
    console.log('🔄 handleSwitchTopic called:', {
      newTopicId: topicId,
      oldTopicId: activeTopicId
    });
    
    setActiveTopicId(topicId);
    
    const topic = topicChats.find(t => t.id === topicId);
    if (topic) {
      console.log('✅ Switched to topic:', {
        name: topic.name,
        nodes: topic.nodes.length,
        edges: topic.edges.length,
        messages: topic.messages.length
      });
    } else {
      console.error('❌ Topic not found:', topicId);
    }
  }, [topicChats, activeTopicId]);

  const handleDeleteTopic = useCallback((topicId: string) => {
    const topic = topicChats.find(t => t.id === topicId);
    if (!topic) return;
    
    setTopicChats(prev => prev.filter(t => t.id !== topicId));
    
    // If deleting active topic, switch to another
    if (activeTopicId === topicId) {
      const remaining = topicChats.filter(t => t.id !== topicId);
      setActiveTopicId(remaining.length > 0 ? remaining[0].id : null);
    }
    
    toast.success('Topic deleted', {
      description: `Deleted "${topic.name}"`,
    });
    
    console.log('🗑️ Deleted topic:', topic.name);
  }, [topicChats, activeTopicId]);

  const handleRenameTopic = useCallback((topicId: string, newName: string) => {
    setTopicChats(prev => prev.map(topic =>
      topic.id === topicId
        ? { ...topic, name: newName.trim(), updatedAt: new Date().toISOString() }
        : topic
    ));
    
    toast.success('Topic renamed');
  }, []);

  const handleClearChat = useCallback(() => {
    if (!activeTopicId) return;
    
    const topic = topicChats.find(t => t.id === activeTopicId);
    if (!topic) return;
    
    if (window.confirm(`Clear all messages and map for "${topic.name}"?`)) {
      console.log('🗑️ Clearing all data for topic:', topic.name);
      
      // Create updated topics with cleared data
      const updatedTopics = topicChats.map(t =>
        t.id === activeTopicId
          ? {
              ...t,
              messages: [],
              nodes: [],
              edges: [],
              conceptMapData: null,
              loadingState: 'idle' as const,
              updatedAt: new Date().toISOString()
            }
          : t
      );
      
      // Update state
      setTopicChats(updatedTopics);
      
      // CRITICAL: Force immediate save to localStorage
      try {
        localStorage.setItem(TOPIC_CHATS_KEY, JSON.stringify(updatedTopics));
        console.log('✅ Cleared topic data saved to localStorage');
        
        // Verify the save
        const verification = localStorage.getItem(TOPIC_CHATS_KEY);
        const verified = JSON.parse(verification || '[]');
        const verifiedTopic = verified.find((t: TopicChat) => t.id === activeTopicId);
        
        console.log('🔍 Verification:', {
          topicName: verifiedTopic?.name,
          nodes: verifiedTopic?.nodes.length,
          edges: verifiedTopic?.edges.length,
          messages: verifiedTopic?.messages.length,
          conceptMapData: verifiedTopic?.conceptMapData ? 'exists' : 'null'
        });
        
        if (verifiedTopic?.nodes.length === 0 && verifiedTopic?.edges.length === 0) {
          toast.success('Topic cleared successfully', {
            description: 'All chat history and map data removed'
          });
        } else {
          throw new Error('Verification failed - data still present');
        }
        
      } catch (error) {
        console.error('❌ Failed to save cleared data:', error);
        toast.error('Failed to clear topic properly', {
          description: 'Please try again or refresh the page'
        });
      }
    }
  }, [activeTopicId, topicChats]);

  return {
    topicChats,
    setTopicChats,
    activeTopicId,
    setActiveTopicId,
    activeTopic,
    handleCreateTopic,
    handleSwitchTopic,
    handleDeleteTopic,
    handleRenameTopic,
    handleClearChat,
  };
};


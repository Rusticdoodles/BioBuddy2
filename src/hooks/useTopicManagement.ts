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

  // Load topic chats from localStorage on mount
  useEffect(() => {
    try {
      const savedTopics = localStorage.getItem(TOPIC_CHATS_KEY);
      const savedActiveId = localStorage.getItem(ACTIVE_TOPIC_KEY);
      
      if (savedTopics) {
        const topics: TopicChat[] = JSON.parse(savedTopics);
        setTopicChats(topics);
        
        // Set active topic (either saved one, or first one, or null)
        if (savedActiveId && topics.find(t => t.id === savedActiveId)) {
          setActiveTopicId(savedActiveId);
        } else if (topics.length > 0) {
          setActiveTopicId(topics[0].id);
        }
        
        console.log('📚 Loaded', topics.length, 'topic chats from localStorage');
      }
    } catch (error) {
      console.error('Error loading topic chats:', error);
    }
  }, []);

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
    setActiveTopicId(topicId);
    const topic = topicChats.find(t => t.id === topicId);
    if (topic) {
      console.log('🔄 Switched to topic:', topic.name);
    }
  }, [topicChats]);

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


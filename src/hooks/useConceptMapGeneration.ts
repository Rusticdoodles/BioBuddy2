import { useCallback } from 'react';
import { feedback } from '@/lib/feedback';
import { LoadingState } from '@/types/concept-map-types';
import { TopicChat } from '@/types/concept-map-types';

interface UseConceptMapGenerationProps {
  activeTopicId: string | null;
  setTopicChats: React.Dispatch<React.SetStateAction<TopicChat[]>>;
  inputText: string;
}

export const useConceptMapGeneration = ({
  activeTopicId,
  setTopicChats,
  inputText,
}: UseConceptMapGenerationProps) => {
  const generateConceptMapFromText = useCallback(async (text: string) => {
    console.log("🚀 Generating concept map from text");
    console.log("📝 Text length:", text.length);

    if (!activeTopicId) return;
    
    setTopicChats(prev => prev.map(topic =>
      topic.id === activeTopicId
        ? { ...topic, loadingState: 'loading' as LoadingState, updatedAt: new Date().toISOString() }
        : topic
    ));

    try {
      console.log("🌐 Making fetch request to /api/generate-concept-map");
      
      const response = await fetch('/api/generate-concept-map', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          notes: text.trim()
        })
      });

      console.log("📊 API Response status:", response.status);

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
            // Give up and use default message
          }
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log("📋 API Response data:", data);

      if (!data.nodes || !data.edges || !Array.isArray(data.nodes) || !Array.isArray(data.edges)) {
        throw new Error('Invalid response format from API');
      }

      console.log("✅ Concept map generated successfully!");
      console.log(`📊 Generated ${data.nodes.length} nodes and ${data.edges.length} edges`);
      
      if (activeTopicId) {
        setTopicChats(prev => prev.map(topic =>
          topic.id === activeTopicId
            ? { ...topic, conceptMapData: data, loadingState: 'success' as LoadingState, updatedAt: new Date().toISOString() }
            : topic
        ));
      }

    } catch (error) {
      console.error("❌ Error generating concept map:", error);
      
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'An unexpected error occurred while generating the concept map.';
      
      if (activeTopicId) {
        setTopicChats(prev => prev.map(topic =>
          topic.id === activeTopicId
            ? { ...topic, loadingState: 'error' as LoadingState, updatedAt: new Date().toISOString() }
            : topic
        ));
      }
      
      feedback.failedToGenerate(errorMessage);
    }
  }, [inputText, activeTopicId, setTopicChats]);

  const handleGenerateMap = useCallback(async (inputText: string) => {
    console.log("🚀 Generate concept map clicked");
    console.log("📝 Input text length:", inputText.length);
    
    if (inputText.trim().length === 0) {
      console.log("❌ Empty input text");
      return;
    }

    if (inputText.length < 50) {
      feedback.notesTooShort();
      return;
    }

    if (inputText.length > 10000) {
      feedback.notesTooLong();
      return;
    }

    await generateConceptMapFromText(inputText);
  }, [generateConceptMapFromText]);

  return {
    generateConceptMapFromText,
    handleGenerateMap,
  };
};


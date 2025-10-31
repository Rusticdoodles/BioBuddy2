import { ChatMessage } from '@/types/concept-map-types';

export function shouldGenerateConceptMap(message: string, chatHistory: ChatMessage[]): boolean {
  const lowerMessage = message.toLowerCase().trim();
  const wordCount = message.split(/\s+/).length;
  
  // Clarification patterns (DON'T generate map)
  const clarificationPatterns = [
    /^what (does|is|are|was|were|do)/,
    /^can you (clarify|define|give|tell)/,
    /^give me (an|some|more)/,
    /^tell me more/,
    /^why (is|does|do|did)/,
    /^how (is|does|do) (that|this|it)/,
    /what (does|do) .* mean/,
    /^define/,
    /^clarify/,
    /^example/,
    /^(more|another) example/,
    /^and what about/,
    /^what if/,
    /^but what/,
  ];
  
  // Check for clarification patterns
  for (const pattern of clarificationPatterns) {
    if (pattern.test(lowerMessage)) {
      console.log('🔍 Detected clarification question, skipping map generation');
      return false;
    }
  }
  
  // Very short questions are usually clarifications
  if (wordCount < 6 && chatHistory.length > 2) {
    console.log('🔍 Short follow-up question, skipping map generation');
    return false;
  }
  
  // New topic patterns (DO generate map)
  const newTopicPatterns = [
    /^can you explain (the |how )?(?!more|that|this|it)/,
    /^explain (the |how )?(?!more|that|this|it)/,
    /^(tell me about|describe) (?!more|that|this|it)/,
    /^how does .* work/,
    /^what is the (process|mechanism|cycle|system|structure)/,
    /^compare/,
    /^contrast/,
    /^(analyze|discuss)/,
  ];
  
  for (const pattern of newTopicPatterns) {
    if (pattern.test(lowerMessage)) {
      console.log('✅ Detected new topic, will generate map');
      return true;
    }
  }
  
  // If conversation is empty or just started, generate map
  if (chatHistory.length <= 2) {
    console.log('✅ New conversation, will generate map');
    return true;
  }
  
  // Default: if unclear, DON'T generate map (safer)
  console.log('⏭️ Unclear intent, defaulting to no map generation');
  return false;
}






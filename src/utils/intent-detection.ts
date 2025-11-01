import { ChatMessage } from '@/types/concept-map-types';

/**
 * Determines if a concept map should be generated for a message.
 * 
 * SIMPLIFIED LOGIC (with topic-based chats):
 * - First message in a topic → Generate map
 * - All other messages → Don't generate (user will explicitly request updates)
 * 
 * Note: We removed "new topic" detection because each topic chat has its own scope.
 * Within a topic about "photosynthesis", all messages are assumed to be about photosynthesis.
 */
export function shouldGenerateConceptMap(message: string, chatHistory: ChatMessage[]): boolean {
  // SIMPLIFIED: In topic-based chats, we only need to detect:
  // 1. First message → always generate map
  // 2. All other messages → skip map generation (clarification)
  
  // If this is the first message in the topic, always generate
  if (chatHistory.length === 0) {
    console.log('✅ First message in topic - will generate map');
    return true;
  }
  
  // All subsequent messages are clarifications (don't generate new map)
  console.log('⏭️ Follow-up message in topic - skipping map generation');
  return false;
}

/**
 * Detects if the user wants to update/add to the existing concept map.
 * 
 * This looks for explicit phrases where the user asks to add information
 * to their current map, such as:
 * - "Add this to the map"
 * - "Can you update the map?"
 * - "Include chlorophyll in the concept map"
 */
export function wantsToUpdateMap(message: string): boolean {
  const lowerMessage = message.toLowerCase().trim();
  
  // Explicit "add to map" patterns
  const updateMapPatterns = [
    // Direct requests
    /add (this|that|it|these|those) to (the |my )?map/,
    /add (this|that|it|these|those) to (the |my )?concept map/,
    /put (this|that|it|these|those) (in|on) (the |my )?map/,
    /include (this|that|it|these|those) (in|on) (the |my )?map/,
    
    // Update requests
    /update (the |my )?map/,
    /update (the |my )?concept map/,
    
    // Add with subject
    /add .* to (the |my )?map/,
    /add .* to (the |my )?concept map/,
    
    // Can you add...
    /^can you add/,
    /^could you add/,
    /^please add/,
    
    // Include/show on map
    /show (this|that|it) (in|on) (the |my )?map/,
    /^include .* (in|on) (the |my )?map/,
  ];
  
  // Check each pattern
  for (const pattern of updateMapPatterns) {
    if (pattern.test(lowerMessage)) {
      console.log('🔄 Detected map update request:', message);
      return true;
    }
  }
  
  console.log('➡️ Not a map update request');
  return false;
}
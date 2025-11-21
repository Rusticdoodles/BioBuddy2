/**
 * Fuzzy topic matching utility for handling typos in topic names
 * Uses Levenshtein distance to find similar existing topics
 */

import levenshtein from 'fast-levenshtein';

export interface TopicMatch {
  topicSlug: string;
  similarity: number; // 0-1, where 1 is identical
  isMatch: boolean;
  distance: number;
}

/**
 * Calculates similarity between two strings using Levenshtein distance
 * @param str1 - First string
 * @param str2 - Second string
 * @returns Similarity score (0-1) where 1 is identical
 */
export function calculateSimilarity(str1: string, str2: string): number {
  const distance = levenshtein.get(str1, str2);
  const maxLength = Math.max(str1.length, str2.length);
  
  if (maxLength === 0) return 1.0; // Both empty = identical
  
  return 1 - (distance / maxLength);
}

/**
 * Finds the best matching topic from existing topics using fuzzy matching
 * @param inputTopic - The topic name entered by the user (may have typos)
 * @param existingTopics - Array of existing topic slugs to match against
 * @param autoMatchThreshold - Similarity threshold for automatic matching (0-1). Default 0.9 means 90% similar
 * @param suggestThreshold - Similarity threshold for suggesting a match (0-1). Default 0.85 means 85% similar
 * @returns Match result with best matching topic if above suggestThreshold, null otherwise
 */
export function findSimilarTopic(
  inputTopic: string,
  existingTopics: string[],
  autoMatchThreshold: number = 0.9,
  suggestThreshold: number = 0.85
): TopicMatch | null {
  const inputSlug = inputTopic.toLowerCase().trim();
  
  // Handle empty input
  if (!inputSlug) {
    return null;
  }
  
  // First check exact match
  if (existingTopics.includes(inputSlug)) {
    return {
      topicSlug: inputSlug,
      similarity: 1.0,
      isMatch: true,
      distance: 0,
    };
  }
  
  // Calculate similarity for each existing topic
  let bestMatch: TopicMatch | null = null;
  
  for (const existingSlug of existingTopics) {
    const distance = levenshtein.get(inputSlug, existingSlug);
    const similarity = calculateSimilarity(inputSlug, existingSlug);
    
    // Only consider matches above the suggestion threshold
    if (similarity >= suggestThreshold) {
      // If no match yet, or this one is better, use it
      if (!bestMatch || similarity > bestMatch.similarity) {
        bestMatch = {
          topicSlug: existingSlug,
          similarity,
          isMatch: similarity >= autoMatchThreshold, // Auto-match if very high similarity
          distance,
        };
      }
    }
  }
  
  return bestMatch;
}

/**
 * Finds all similar topics above a threshold (useful for suggestions)
 * @param inputTopic - The topic name entered by the user
 * @param existingTopics - Array of existing topic slugs to match against
 * @param threshold - Similarity threshold (0-1). Default 0.85
 * @param maxResults - Maximum number of results to return. Default 3
 * @returns Array of similar topics sorted by similarity (highest first)
 */
export function findSimilarTopics(
  inputTopic: string,
  existingTopics: string[],
  threshold: number = 0.85,
  maxResults: number = 3
): TopicMatch[] {
  const inputSlug = inputTopic.toLowerCase().trim();
  
  if (!inputSlug || existingTopics.length === 0) {
    return [];
  }
  
  const matches: TopicMatch[] = [];
  
  for (const existingSlug of existingTopics) {
    // Skip exact matches (already handled)
    if (existingSlug === inputSlug) {
      continue;
    }
    
    const distance = levenshtein.get(inputSlug, existingSlug);
    const similarity = calculateSimilarity(inputSlug, existingSlug);
    
    if (similarity >= threshold) {
      matches.push({
        topicSlug: existingSlug,
        similarity,
        isMatch: false, // Only suggest, don't auto-match multiple
        distance,
      });
    }
  }
  
  // Sort by similarity (highest first), then by distance (lowest first)
  matches.sort((a, b) => {
    if (Math.abs(a.similarity - b.similarity) < 0.001) {
      return a.distance - b.distance;
    }
    return b.similarity - a.similarity;
  });
  
  return matches.slice(0, maxResults);
}


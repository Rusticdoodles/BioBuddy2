/**
 * Detects if a new user message is about a significantly different topic
 * than the current topic chat name
 */

interface TopicAnalysis {
  isDifferentTopic: boolean;
  suggestedTopicName: string | null;
  confidence: 'high' | 'medium' | 'low';
  reason: string;
}

// Common biology topics and their related keywords
const BIOLOGY_TOPICS = {
  photosynthesis: ['photosynthesis', 'light reactions', 'calvin cycle', 'chloroplast', 'light-dependent', 'light-independent', 'stroma', 'thylakoid'],
  'cellular respiration': ['cellular respiration', 'glycolysis', 'krebs cycle', 'citric acid cycle', 'electron transport chain', 'mitochondria', 'atp production'],
  mitosis: ['mitosis', 'cell division', 'prophase', 'metaphase', 'anaphase', 'telophase', 'cytokinesis', 'chromosomes'],
  meiosis: ['meiosis', 'gametes', 'crossing over', 'independent assortment', 'haploid', 'diploid'],
  'dna replication': ['dna replication', 'helicase', 'polymerase', 'leading strand', 'lagging strand', 'okazaki fragments', 'primase'],
  'protein synthesis': ['protein synthesis', 'transcription', 'translation', 'mrna', 'trna', 'ribosomes', 'codons', 'anticodons'],
  evolution: ['evolution', 'natural selection', 'adaptation', 'mutation', 'speciation', 'darwin', 'fitness'],
  ecology: ['ecology', 'ecosystem', 'food chain', 'food web', 'biome', 'population', 'community', 'niche'],
  genetics: ['genetics', 'alleles', 'genotype', 'phenotype', 'punnett square', 'mendel', 'dominant', 'recessive'],
  'cell structure': ['cell structure', 'organelles', 'nucleus', 'membrane', 'cytoplasm', 'endoplasmic reticulum', 'golgi'],
  homeostasis: ['homeostasis', 'feedback', 'regulation', 'balance', 'thermoregulation', 'osmoregulation'],
  'immune system': ['immune system', 'antibodies', 'lymphocytes', 'antigens', 'white blood cells', 'immunity'],
};

// Keywords that indicate follow-up questions (NOT different topics)
const FOLLOW_UP_INDICATORS = [
  'what about',
  'how does that',
  'why does',
  'can you explain more',
  'tell me more',
  'what are the',
  'elaborate',
  'details',
  'specifically',
  'also',
  'additionally',
  'furthermore',
  'what happens when',
  'what if',
  'in that process',
  'in this',
  'for this',
  'during this',
];

/**
 * Analyzes if the user's message is about a different topic
 */
export function analyzeTopicDrift(
  userMessage: string,
  currentTopicName: string,
  conversationHistory: { role: string; content: string }[]
): TopicAnalysis {
  const messageLower = userMessage.toLowerCase();
  const topicNameLower = currentTopicName.toLowerCase();
  
  // Skip analysis for very short messages
  if (userMessage.trim().length < 10) {
    return {
      isDifferentTopic: false,
      suggestedTopicName: null,
      confidence: 'low',
      reason: 'Message too short to analyze'
    };
  }
  
  // Check if it's clearly a follow-up question
  const isFollowUp = FOLLOW_UP_INDICATORS.some(indicator => 
    messageLower.includes(indicator)
  );
  
  if (isFollowUp) {
    return {
      isDifferentTopic: false,
      suggestedTopicName: null,
      confidence: 'high',
      reason: 'Follow-up question detected'
    };
  }
  
  // Check if current topic is mentioned in the message
  if (messageLower.includes(topicNameLower)) {
    return {
      isDifferentTopic: false,
      suggestedTopicName: null,
      confidence: 'high',
      reason: 'Current topic mentioned in message'
    };
  }
  
  // Find which biology topic the message is about
  let detectedTopic: string | null = null;
  let matchCount = 0;
  
  for (const [topicName, keywords] of Object.entries(BIOLOGY_TOPICS)) {
    const matches = keywords.filter(keyword => messageLower.includes(keyword));
    if (matches.length > matchCount) {
      matchCount = matches.length;
      detectedTopic = topicName;
    }
  }
  
  // If no clear topic detected, it's ambiguous
  if (!detectedTopic || matchCount === 0) {
    return {
      isDifferentTopic: false,
      suggestedTopicName: null,
      confidence: 'low',
      reason: 'Could not identify specific topic'
    };
  }
  
  // Check if detected topic matches current topic
  const currentTopicKeywords = BIOLOGY_TOPICS[topicNameLower as keyof typeof BIOLOGY_TOPICS] || [];
  const currentTopicMatches = currentTopicKeywords.filter(keyword => 
    messageLower.includes(keyword)
  ).length;
  
  // If current topic has more matches, stay in current topic
  if (currentTopicMatches >= matchCount) {
    return {
      isDifferentTopic: false,
      suggestedTopicName: null,
      confidence: 'medium',
      reason: 'Message relates to current topic'
    };
  }
  
  // If it's the first message, don't suggest new topic
  if (conversationHistory.length === 0) {
    return {
      isDifferentTopic: false,
      suggestedTopicName: null,
      confidence: 'low',
      reason: 'First message in topic'
    };
  }
  
  // Different topic detected with high confidence
  return {
    isDifferentTopic: true,
    suggestedTopicName: detectedTopic.charAt(0).toUpperCase() + detectedTopic.slice(1),
    confidence: matchCount >= 2 ? 'high' : 'medium',
    reason: `Detected ${matchCount} keyword(s) for "${detectedTopic}"`
  };
}


import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';
import { searchWikimediaImages, extractKeywords } from '@/utils/wikimedia';
import { shouldGenerateConceptMap } from '@/utils/intent-detection';
import { analyzeTopicDrift } from '@/utils/topic-detection';
import { ChatMessage } from '@/types/concept-map-types';

// Function to get Anthropic client (lazy initialization)
const getAnthropicClient = () => {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  console.log('🔑 API Key check:', apiKey ? `Found (${apiKey.substring(0, 10)}...)` : 'MISSING');
  if (!apiKey || apiKey.includes('your_') || apiKey.includes('API_KEY')) {
    throw new Error('Anthropic API key not configured. Please add ANTHROPIC_API_KEY to your .env.local file.');
  }
  return new Anthropic({ apiKey });
};

// Sanitize response to remove any remaining structured output markers
function sanitizeExplanation(text: string): string {
  return text
    // Remove section headers
    .replace(/^EXPLANATION:\s*/i, '')
    .replace(/IMAGE_SEARCH_TERMS:\s*\[.*?\]/gi, '')
    .replace(/CONCEPT_MAP:\s*\{[\s\S]*$/i, '')
    // Remove stray brackets that might be JSON fragments
    .replace(/\n\s*[\[\{][\s\S]*$/g, '')
    // Clean up extra whitespace
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export async function POST(request: NextRequest) {
  try {
    console.log('🔑 Checking API key...', process.env.ANTHROPIC_API_KEY ? 'Found' : 'MISSING');
    
    // Initialize Anthropic client (only when API is called)
    const anthropic = getAnthropicClient();
    
    const { message, conversationHistory, currentTopic } = await request.json();

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required and must be a string' },
        { status: 400 }
      );
    }

    console.log('🤖 Received chat request:', { message, historyLength: conversationHistory?.length || 0, currentTopic });

    // Check if user is asking about a different topic
    if (currentTopic && conversationHistory && conversationHistory.length > 0) {
      const topicAnalysis = analyzeTopicDrift(
        message,
        currentTopic,
        conversationHistory
      );
      
      if (topicAnalysis.isDifferentTopic && topicAnalysis.confidence !== 'low') {
        console.log('🔔 Different topic detected:', topicAnalysis);
        
        // Return a suggestion to create new topic instead of normal response
        return NextResponse.json({
          message: `I notice you're asking about **${topicAnalysis.suggestedTopicName}**, which seems different from your current topic "${currentTopic}". 

For better organization, I recommend creating a new topic chat specifically for ${topicAnalysis.suggestedTopicName}! This will help you:

- Keep your study sessions organized
- Build focused concept maps for each subject
- Easily review specific topics later`,
          isSuggestion: true,
          suggestedTopicName: topicAnalysis.suggestedTopicName,
          success: true
        });
      }
    }

    // Build conversation history for Claude
    interface HistoryMessage {
      role: 'user' | 'assistant';
      content: string;
    }
    
    const messages = [
      ...(conversationHistory || []).map((msg: HistoryMessage) => ({
        role: msg.role,
        content: msg.content
      })),
      {
        role: 'user',
        content: message
      }
    ];

    // Determine if we should generate a concept map based on intent detection
    const chatHistoryForIntent: ChatMessage[] = (conversationHistory || []).map((msg: HistoryMessage) => ({
      role: msg.role,
      content: msg.content
    }));
    const shouldGenerateMap = shouldGenerateConceptMap(message, chatHistoryForIntent);
    
    console.log(`🧠 Intent detection: ${shouldGenerateMap ? '✅ Will generate concept map' : '⏭️ Skipping concept map (follow-up/clarification)'}`);

    // Create system prompt conditionally based on intent detection
    const systemPrompt = shouldGenerateMap
      ? `CRITICAL FORMATTING RULE:
You MUST separate each section with EXACTLY one blank line, and the JSON must be properly formatted.
The user should NEVER see the section headers (EXPLANATION, IMAGE_SEARCH_TERMS, CONCEPT_MAP) - they are only for parsing.

You are an educational AI assistant that helps students learn by providing clear explanations AND structured concept maps.

When a student asks a question, you MUST respond with THREE sections:
1. A clear, educational explanation
2. Specific search terms for finding relevant educational images
3. A JSON concept map showing key concepts and relationships

RESPONSE FORMAT (you must follow this exactly):

EXPLANATION:
[Your clear explanation here - 2-4 paragraphs explaining the concept]

IMAGE_SEARCH_TERMS:
["term1", "term2", "term3"]

CONCEPT_MAP:
{
  "nodes": [
    {"id": "1", "label": "Main Concept", "type": "process"},
    {"id": "2", "label": "Related Concept", "type": "molecule"}
  ],
  "edges": [
    {"source": "1", "target": "2", "label": "produces"}
  ]
}

CRITICAL: Do NOT include any text after the CONCEPT_MAP JSON. End your response immediately after the closing brace.

RULES FOR EXPLANATION:
- Clear and concise (2-4 paragraphs)
- Break down complex ideas
- Adjust complexity to the question
- No markdown formatting
- Focus on relationships between concepts
- Give citations for the information you provide in a separate paragraph at the end

RULES FOR IMAGE_SEARCH_TERMS:
- Provide 2-4 specific scientific/educational terms
- Use complete phrases, not single generic words
- Example: "Krebs cycle diagram" NOT "cycle"
- Example: "mitochondria structure" NOT "structure"
- Include scientific synonyms when applicable
- Example: ["krebs cycle", "citric acid cycle", "TCA cycle"]
- Avoid ambiguous terms that could match non-educational content
- Focus on visual, diagram-friendly terms

RULES FOR CONCEPT MAP:
- Include 6-12 key concepts (not too few, not too many)
- Use clear, concise labels (2-4 words max)
- Choose appropriate types: process, molecule, organelle, system, structure, function, enzyme, pathway, organ, tissue, cell, protein, concept
- Use descriptive relationship labels: "produces", "requires", "contains", "regulates", "part of", "leads to", "inhibits", "activates", "transforms into"
- Create a logical hierarchy (main concept at top, details below)
- Ensure all edge IDs match node IDs
- Focus on the MOST important relationships only

CRITICAL - CONNECTION LIMITS:
- Each node should have 2-4 connections MAXIMUM (incoming + outgoing combined)
- NO node should have more than 4 edges total
- Prioritize DIRECT relationships only (A→B, not A→C if A→B→C exists)
- Avoid hub nodes that connect to everything
- Skip redundant connections (if A→B→C, don't add A→C)
- Create clear parent→child flow, avoid cross-layer connections when possible
- If a concept is central, split it into sub-concepts rather than connecting everything to it

BAD EXAMPLE (too connected):
{
  "nodes": [
    {"id": "1", "label": "Krebs Cycle", "type": "pathway"},
    {"id": "2", "label": "Acetyl-CoA", "type": "molecule"},
    {"id": "3", "label": "Citric Acid", "type": "molecule"},
    {"id": "4", "label": "ATP", "type": "molecule"},
    {"id": "5", "label": "NADH", "type": "molecule"},
    {"id": "6", "label": "FADH2", "type": "molecule"},
    {"id": "7", "label": "CO2", "type": "molecule"},
    {"id": "8", "label": "Cellular Respiration", "type": "process"}
  ],
  "edges": [
    {"source": "1", "target": "2", "label": "uses"},
    {"source": "1", "target": "3", "label": "produces"},
    {"source": "1", "target": "4", "label": "produces"},
    {"source": "1", "target": "5", "label": "produces"},
    {"source": "1", "target": "6", "label": "produces"},
    {"source": "1", "target": "7", "label": "produces"},
    {"source": "1", "target": "8", "label": "part of"},
    {"source": "2", "target": "3", "label": "converted to"},
    {"source": "4", "target": "8", "label": "powers"},
    {"source": "5", "target": "8", "label": "powers"}
  ]
}
// PROBLEM: Node "1" (Krebs Cycle) has 7 edges! Too many connections.

GOOD EXAMPLE (focused, clean):
{
  "nodes": [
    {"id": "1", "label": "Cellular Respiration", "type": "process"},
    {"id": "2", "label": "Krebs Cycle", "type": "pathway"},
    {"id": "3", "label": "Acetyl-CoA", "type": "molecule"},
    {"id": "4", "label": "Energy Products", "type": "concept"},
    {"id": "5", "label": "ATP", "type": "molecule"},
    {"id": "6", "label": "Electron Carriers", "type": "concept"},
    {"id": "7", "label": "NADH", "type": "molecule"},
    {"id": "8", "label": "FADH2", "type": "molecule"}
  ],
  "edges": [
    {"source": "1", "target": "2", "label": "includes"},
    {"source": "2", "target": "3", "label": "uses"},
    {"source": "2", "target": "4", "label": "produces"},
    {"source": "4", "target": "5", "label": "includes"},
    {"source": "2", "target": "6", "label": "produces"},
    {"source": "6", "target": "7", "label": "includes"},
    {"source": "6", "target": "8", "label": "includes"}
  ]
}
// BETTER: Max 3 edges per node. Clear hierarchy. Grouped related concepts.

KEY PRINCIPLES:
1. Group similar outputs (ATP, NADH, FADH2 → "Energy Products" → specific molecules)
2. Avoid connecting every detail to main concept
3. Create intermediate grouping nodes when needed
4. Linear flow preferred over hub-and-spoke
5. Maximum 3-4 edges per node, aim for 2-3

ABSOLUTE REQUIREMENT - WILL REJECT IF VIOLATED:
- NO node may have more than 3 edges (incoming + outgoing combined)
- Maps with hub nodes (4+ connections) will be rejected
- Prioritize quality over quantity
- Better to have 8 nodes with clean connections than 15 nodes with messy connections

EXAMPLE for "What is photosynthesis?":

EXPLANATION:
Photosynthesis is the process by which plants convert light energy into chemical energy. It occurs in chloroplasts and involves two main stages: the light-dependent reactions and the Calvin cycle. During the light reactions, chlorophyll absorbs sunlight and splits water molecules, producing oxygen and ATP. The Calvin cycle then uses this ATP to convert carbon dioxide into glucose.

IMAGE_SEARCH_TERMS:
["photosynthesis diagram", "chloroplast structure", "light reactions"]

CONCEPT_MAP:
{
  "nodes": [
    {"id": "1", "label": "Photosynthesis", "type": "process"},
    {"id": "2", "label": "Chloroplast", "type": "organelle"},
    {"id": "3", "label": "Light Reactions", "type": "process"},
    {"id": "4", "label": "Calvin Cycle", "type": "process"},
    {"id": "5", "label": "Glucose", "type": "molecule"},
    {"id": "6", "label": "Oxygen", "type": "molecule"},
    {"id": "7", "label": "ATP", "type": "molecule"}
  ],
  "edges": [
    {"source": "1", "target": "2", "label": "occurs in"},
    {"source": "1", "target": "3", "label": "includes"},
    {"source": "1", "target": "4", "label": "includes"},
    {"source": "3", "target": "6", "label": "produces"},
    {"source": "3", "target": "7", "label": "produces"},
    {"source": "4", "target": "5", "label": "produces"},
    {"source": "7", "target": "4", "label": "powers"}
  ]
}

NOTE: Only 7 edges for 7 nodes. No node has more than 3 connections. Clear hierarchy.

CRITICAL EXAMPLES:

Question: "Explain the Krebs cycle"
❌ BAD IMAGE_SEARCH_TERMS: ["cycle", "process"]
✅ GOOD IMAGE_SEARCH_TERMS: ["krebs cycle", "citric acid cycle diagram", "TCA cycle"]

Question: "What is a mitochondria?"
❌ BAD IMAGE_SEARCH_TERMS: ["cell", "organelle"]  
✅ GOOD IMAGE_SEARCH_TERMS: ["mitochondria structure", "mitochondria diagram", "cellular respiration"]

Question: "How does DNA replication work?"
❌ BAD IMAGE_SEARCH_TERMS: ["DNA", "replication"]
✅ GOOD IMAGE_SEARCH_TERMS: ["DNA replication fork", "DNA polymerase", "semiconservative replication"]

Always use specific, complete scientific terms that would appear in textbooks!`
      : `CRITICAL FORMATTING RULE:
You MUST separate each section with EXACTLY one blank line, and the JSON must be properly formatted.
The user should NEVER see the section headers (EXPLANATION, IMAGE_SEARCH_TERMS) - they are only for parsing.

You are an educational AI assistant that helps students learn by providing clear explanations.

When a student asks a question (especially follow-up or clarification questions), you should respond with TWO sections:
1. A clear, educational explanation
2. Specific search terms for finding relevant educational images

RESPONSE FORMAT (you must follow this exactly):

EXPLANATION:
[Your clear explanation here - 2-4 paragraphs explaining the concept or answering the question]

IMAGE_SEARCH_TERMS:
["term1", "term2", "term3"]

CRITICAL: Do NOT include any text after the IMAGE_SEARCH_TERMS JSON. End your response immediately after the closing bracket.

RULES FOR EXPLANATION:
- Clear and concise (2-4 paragraphs)
- Break down complex ideas
- Adjust complexity to the question
- No markdown formatting
- Focus on answering the specific question asked
- Give citations for the information you provide in a separate paragraph at the end

RULES FOR IMAGE_SEARCH_TERMS:
- Provide 2-4 specific scientific/educational terms
- Use complete phrases, not single generic words
- Example: "Krebs cycle diagram" NOT "cycle"
- Example: "mitochondria structure" NOT "structure"
- Include scientific synonyms when applicable
- Example: ["krebs cycle", "citric acid cycle", "TCA cycle"]
- Avoid ambiguous terms that could match non-educational content
- Focus on visual, diagram-friendly terms

CRITICAL: Always include both sections (EXPLANATION and IMAGE_SEARCH_TERMS) in your response. Do NOT include a CONCEPT_MAP section.`;

    // Call Claude API
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2048,
      system: systemPrompt,
      messages
    });

    const assistantMessage = response.content[0].type === 'text' ? response.content[0].text : '';

    console.log('✅ Claude API response received');

    // Parse the structured response with robust error handling
    let explanation = '';
    let conceptMapData = null;
    let searchTerms: string[] = [];

    try {
      // Extract EXPLANATION section (everything before IMAGE_SEARCH_TERMS or CONCEPT_MAP)
      const explanationMatch = assistantMessage.match(/EXPLANATION:\s*([\s\S]*?)(?=IMAGE_SEARCH_TERMS:|CONCEPT_MAP:|$)/i);
      if (explanationMatch) {
        explanation = explanationMatch[1].trim();
      } else {
        // Fallback: try to get text before first section header
        const firstSectionMatch = assistantMessage.match(/([\s\S]*?)(?=IMAGE_SEARCH_TERMS:|CONCEPT_MAP:|$)/);
        explanation = firstSectionMatch ? firstSectionMatch[1].trim() : assistantMessage;
      }

      // Extract IMAGE_SEARCH_TERMS section
      const searchTermsMatch = assistantMessage.match(/IMAGE_SEARCH_TERMS:\s*(\[[\s\S]*?\])/i);
      if (searchTermsMatch) {
        try {
          searchTerms = JSON.parse(searchTermsMatch[1]);
          console.log('🔍 Claude provided search terms:', searchTerms);
        } catch (error) {
          console.error('Error parsing search terms JSON:', error);
        }
      }

      // Extract CONCEPT_MAP section (only if we should generate a map)
      if (shouldGenerateMap) {
        const conceptMapMatch = assistantMessage.match(/CONCEPT_MAP:\s*(\{[\s\S]*?\})\s*$/i);
        if (conceptMapMatch) {
          try {
            conceptMapData = JSON.parse(conceptMapMatch[1]);
            console.log('📊 Claude provided concept map');
            
            // Validate connection limits
            if (conceptMapData?.edges && conceptMapData?.nodes) {
              const edgeCounts = new Map<string, number>();
              
              conceptMapData.edges.forEach((edge: { source: string; target: string }) => {
                edgeCounts.set(edge.source, (edgeCounts.get(edge.source) || 0) + 1);
                edgeCounts.set(edge.target, (edgeCounts.get(edge.target) || 0) + 1);
              });
              
              const maxConnections = Math.max(...Array.from(edgeCounts.values()), 0);
              const avgConnectionsPerNode = conceptMapData.nodes.length > 0
                ? (conceptMapData.edges.length * 2) / conceptMapData.nodes.length
                : 0;
              
              console.log('📊 Connection analysis:', {
                totalNodes: conceptMapData.nodes.length,
                totalEdges: conceptMapData.edges.length,
                maxConnectionsPerNode: maxConnections,
                avgConnectionsPerNode: avgConnectionsPerNode.toFixed(2)
              });
              
              if (maxConnections > 4) {
                console.warn('⚠️ AI exceeded connection limit! Node has', maxConnections, 'edges');
              } else if (maxConnections <= 3) {
                console.log('✅ All nodes within connection limits');
              }
            }
          } catch (error) {
            console.error('Error parsing concept map JSON:', error);
          }
        } else {
          console.log('⚠️ Expected concept map but not found in Claude response');
        }
      }

      // Clean up explanation: remove any remaining section headers that slipped through
      explanation = explanation
        .replace(/^EXPLANATION:\s*/i, '')
        .replace(/IMAGE_SEARCH_TERMS:[\s\S]*$/i, '')
        .replace(/CONCEPT_MAP:[\s\S]*$/i, '')
        .trim();

      // Final safety check: if explanation is empty or looks like JSON, use original message
      if (!explanation || explanation.startsWith('{') || explanation.startsWith('[')) {
        console.warn('⚠️ Parsing may have failed, using original message');
        explanation = assistantMessage
          .replace(/IMAGE_SEARCH_TERMS:[\s\S]*/i, '')
          .replace(/CONCEPT_MAP:[\s\S]*/i, '')
          .trim();
      }

      console.log('✅ Parsed explanation length:', explanation.length);

    } catch (error) {
      console.error('Error parsing Claude response:', error);
      // Fallback: strip out obvious section headers and use what's left
      explanation = assistantMessage
        .replace(/EXPLANATION:/gi, '')
        .replace(/IMAGE_SEARCH_TERMS:[\s\S]*/gi, '')
        .replace(/CONCEPT_MAP:[\s\S]*/gi, '')
        .trim();
    }

    // Fetch relevant images from Wikimedia Commons using Claude's search terms
    let images = [] as Awaited<ReturnType<typeof searchWikimediaImages>>;
    try {
      if (searchTerms.length > 0) {
        console.log('🔍 Searching Wikimedia with terms:', searchTerms);
        
        // Try each search term until we get good results
        for (const term of searchTerms) {
          const results = await searchWikimediaImages(term, 6);
          if (results.length > 0) {
            images = results;
            console.log(`📸 Found ${results.length} images for "${term}"`);
            break;
          }
        }
        
        if (images.length === 0) {
          console.log('⚠️ No images found for any search term');
        }
      } else {
        // Fallback: extract keywords locally if Claude didn't provide search terms
        console.log('⚠️ No search terms from Claude, falling back to keyword extraction');
        const keywords = extractKeywords(explanation);
        if (keywords.length > 0) {
          images = await searchWikimediaImages(keywords[0], 3);
        }
      }
    } catch (error) {
      console.error('Error fetching images:', error);
    }

    // Sanitize the explanation one more time before returning
    explanation = sanitizeExplanation(explanation);

    // Final validation: explanation should be at least 50 characters
    if (explanation.length < 50) {
      console.error('⚠️ Explanation too short after parsing, using fallback');
      explanation = assistantMessage.split(/IMAGE_SEARCH_TERMS:|CONCEPT_MAP:/i)[0].trim();
      explanation = sanitizeExplanation(explanation);
    }

    // Debug logging
    console.log('📝 Response breakdown:');
    console.log('- Explanation length:', explanation.length);
    console.log('- Search terms count:', searchTerms.length);
    console.log('- Has concept map:', !!conceptMapData);
    console.log('- First 100 chars:', explanation.substring(0, 100));

    // Check if explanation contains any section headers (shouldn't happen)
    if (/IMAGE_SEARCH_TERMS:|CONCEPT_MAP:/i.test(explanation)) {
      console.error('❌ ERROR: Explanation still contains section headers!');
      console.error('Explanation:', explanation);
      // Last resort: strip headers again
      explanation = explanation
        .replace(/IMAGE_SEARCH_TERMS:[\s\S]*/i, '')
        .replace(/CONCEPT_MAP:[\s\S]*/i, '')
        .trim();
    }

    return NextResponse.json({ 
      message: explanation,
      conceptMap: conceptMapData,
      images,
      searchTerms: searchTerms,
      success: true
    });

  } catch (error) {
    console.error('❌ Error in chat API:', error);
    
    // Provide a more user-friendly error message
    let errorMessage = 'An unexpected error occurred';
    if (error instanceof Error) {
      errorMessage = error.message;
      // Check if it's an API key error
      if (error.message.includes('API key')) {
        errorMessage = 'Anthropic API key is not configured. Please check your .env.local file and add ANTHROPIC_API_KEY.';
      }
    }
    
    return NextResponse.json(
      { 
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' && error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}

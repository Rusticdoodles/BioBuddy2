import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';
import { searchWikimediaImages, extractKeywords } from '@/utils/wikimedia';
import { shouldGenerateConceptMap } from '@/utils/intent-detection';
import { analyzeTopicDrift } from '@/utils/topic-detection';
import { ChatMessage, ConceptMapResponse } from '@/types/concept-map-types';

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

RULES FOR CONCEPT MAP - PEDAGOGICAL STRUCTURE:

LEARNING PHILOSOPHY:
Your concept map should TEACH, not just organize information. Students should be able to:
- Identify the main concept immediately (at the top)
- Follow a clear learning path from top to bottom
- Understand how concepts relate in a hierarchy
- See the "story" of the topic unfold

HIERARCHICAL STRUCTURE (CRITICAL):
Create exactly 3-5 LEVELS in your map, flowing TOP to BOTTOM:

LEVEL 1 (Top): Main Concept
- Exactly 1 node
- The overarching topic being explained
- Example: "Photosynthesis" or "Cell Division"

LEVEL 2: Context/Location
- 1-2 nodes
- Where does this happen? What's the setting?
- Example: "Chloroplast" or "Mitochondria"

LEVEL 3: Major Stages/Components
- 2-4 nodes
- The key processes or main parts (in sequence if process-oriented)
- Example: "Light Reactions" → "Calvin Cycle"

LEVEL 4: Key Mechanisms/Details
- 4-6 nodes
- Important supporting concepts under each major stage
- Example: "Chlorophyll", "ATP", "Electron Transport"

LEVEL 5 (Bottom): Outcomes/Products
- 2-3 nodes
- What results from this process? What's produced?
- Example: "Glucose", "Oxygen"

NODE COUNT TARGET: 10-15 nodes total (not more, not less)

CONNECTION RULES FOR HIERARCHY:
- Nodes should primarily connect to adjacent levels (Level 1→2, 2→3, 3→4, 4→5)
- Avoid "skip connections" across multiple levels
- Maximum 3 edges per node
- Create DOWNWARD flow (parent → child relationships)
- Avoid horizontal connections between same-level nodes unless showing sequence

SEQUENCE vs STRUCTURE:
- For PROCESSES (photosynthesis, respiration, replication):
  Show clear sequential flow with arrows indicating "then" or "next"
  Example: Step 1 → Step 2 → Step 3

- For STRUCTURES (cell anatomy, organ systems):
  Show hierarchical composition with "contains" or "part of"
  Example: Whole → Major Parts → Sub-components

CLARITY OVER COMPLETENESS:
- Include only the MOST IMPORTANT concepts (10-15 max)
- Skip minor details that don't aid understanding
- Group related items when possible
- Better to be clear with fewer nodes than comprehensive but confusing

NODE LABELING FOR CONTEXT:
- Make labels self-explanatory
- Add brief context when helpful
- BAD: "ATP"
- GOOD: "ATP (Energy)"
- BAD: "Calvin Cycle"  
- GOOD: "Calvin Cycle (Sugar Production)"

EDGE LABELS FOR NARRATIVE:
Use descriptive relationship labels that tell the story:
- "occurs in"
- "begins with"
- "produces"
- "requires"
- "converts to"
- "powers"
- "results in"

Avoid vague labels like "related to" or "connects to"

BAD EXAMPLE (Flat Web - No Hierarchy):
{
  "nodes": [
    {"id": "1", "label": "Photosynthesis", "type": "process"},
    {"id": "2", "label": "Chlorophyll", "type": "molecule"},
    {"id": "3", "label": "Light", "type": "concept"},
    {"id": "4", "label": "Water", "type": "molecule"},
    {"id": "5", "label": "ATP", "type": "molecule"},
    {"id": "6", "label": "Glucose", "type": "molecule"},
    {"id": "7", "label": "Oxygen", "type": "molecule"},
    {"id": "8", "label": "CO2", "type": "molecule"},
    {"id": "9", "label": "Calvin Cycle", "type": "process"},
    {"id": "10", "label": "Thylakoid", "type": "structure"}
  ],
  "edges": [
    {"source": "1", "target": "2", "label": "uses"},
    {"source": "1", "target": "3", "label": "uses"},
    {"source": "1", "target": "4", "label": "uses"},
    {"source": "2", "target": "5", "label": "produces"},
    {"source": "1", "target": "6", "label": "produces"},
    {"source": "1", "target": "7", "label": "produces"},
    {"source": "9", "target": "6", "label": "produces"},
    {"source": "3", "target": "10", "label": "hits"}
  ]
}
// PROBLEM: Flat structure, no clear levels, confusing flow, everything connects to everything

GOOD EXAMPLE (Clear Hierarchy - Easy to Learn):
{
  "nodes": [
    // LEVEL 1: Main Concept
    {"id": "1", "label": "Photosynthesis", "type": "process"},
    
    // LEVEL 2: Location
    {"id": "2", "label": "Chloroplast", "type": "organelle"},
    
    // LEVEL 3: Major Stages (Sequential)
    {"id": "3", "label": "Light Reactions", "type": "process"},
    {"id": "4", "label": "Calvin Cycle", "type": "process"},
    
    // LEVEL 4: Key Components
    {"id": "5", "label": "Chlorophyll (Light Absorber)", "type": "molecule"},
    {"id": "6", "label": "Water (H2O)", "type": "molecule"},
    {"id": "7", "label": "ATP (Energy Carrier)", "type": "molecule"},
    {"id": "8", "label": "CO2 (Carbon Source)", "type": "molecule"},
    
    // LEVEL 5: Products/Outcomes
    {"id": "9", "label": "Glucose (Sugar)", "type": "molecule"},
    {"id": "10", "label": "Oxygen (O2)", "type": "molecule"}
  ],
  "edges": [
    // Level 1 → 2
    {"source": "1", "target": "2", "label": "occurs in"},
    
    // Level 2 → 3 (sequence)
    {"source": "2", "target": "3", "label": "begins with"},
    {"source": "3", "target": "4", "label": "followed by"},
    
    // Level 3 → 4 (components under each stage)
    {"source": "3", "target": "5", "label": "uses"},
    {"source": "3", "target": "6", "label": "splits"},
    {"source": "3", "target": "7", "label": "produces"},
    {"source": "4", "target": "8", "label": "uses"},
    {"source": "4", "target": "7", "label": "powered by"},
    
    // Level 4 → 5 (outcomes)
    {"source": "3", "target": "10", "label": "releases"},
    {"source": "4", "target": "9", "label": "produces"}
  ]
}
// BETTER: Clear 5-level hierarchy, obvious flow, 10 nodes, easy to follow top→bottom

VALIDATION CHECKLIST (verify before returning):
✓ Does the map have 3-5 clear levels?
✓ Is there exactly 1 main concept at the top?
✓ Do edges flow primarily downward (parent → child)?
✓ Are there 10-15 nodes total?
✓ Can a student follow a clear learning path?
✓ Is each node in the right hierarchical level?
✓ Are node labels self-explanatory with context?
✓ Does the map tell a coherent story?

If NO to any of these, restructure the map before returning.

TOPIC-SPECIFIC GUIDANCE:

For BIOLOGICAL PROCESSES (metabolism, respiration, photosynthesis, replication):
Level 1: Process name
Level 2: Where it occurs
Level 3: Major stages (in order: Stage 1 → Stage 2 → Stage 3)
Level 4: Key molecules/enzymes for each stage
Level 5: Products/outcomes

For BIOLOGICAL STRUCTURES (cell, organ, tissue):
Level 1: Main structure
Level 2: Location in organism
Level 3: Major components/parts
Level 4: Sub-structures within each part
Level 5: Functions/purposes

For SYSTEMS (nervous, circulatory, digestive):
Level 1: System name
Level 2: Main organs involved
Level 3: Key processes that occur
Level 4: Important molecules/signals
Level 5: Outcomes/functions

REMEMBER: You're teaching a student who knows nothing about this topic. Make it crystal clear.

TECHNICAL NOTE - LAYOUT COMPATIBILITY:
Your hierarchical structure will be automatically laid out using Dagre algorithm with:
- direction: TB (top-to-bottom)
- ranksep: 120 (vertical spacing between levels)
- nodesep: 100 (horizontal spacing)

To ensure clean layouts:
- Keep same-level nodes to 2-4 maximum
- Avoid excessive cross-connections
- Maintain clear parent→child relationships
- This will result in beautiful, readable maps automatically

ABSOLUTE REQUIREMENT - MAPS WILL BE REJECTED IF:
- More than 1 node at the top level (no clear main concept)
- Same-level nodes connect to each other (breaks hierarchy)
- Skip connections across multiple levels (confusing flow)
- More than 16 nodes or fewer than 9 nodes
- No clear top-to-bottom progression

Your map MUST be hierarchical or it will fail validation.

EXAMPLE for "What is photosynthesis?":

EXPLANATION:
Photosynthesis is the process by which plants convert light energy into chemical energy in the form of glucose. It occurs in chloroplasts and consists of two main stages that work sequentially. First, the light-dependent reactions use chlorophyll to absorb sunlight and split water molecules, producing ATP and releasing oxygen. Then, the Calvin cycle uses that ATP to convert carbon dioxide into glucose through carbon fixation.

IMAGE_SEARCH_TERMS:
["photosynthesis diagram", "chloroplast structure", "light reactions calvin cycle"]

CONCEPT_MAP:
{
  "nodes": [
    {"id": "1", "label": "Photosynthesis", "type": "process"},
    {"id": "2", "label": "Chloroplast", "type": "organelle"},
    {"id": "3", "label": "Light Reactions", "type": "process"},
    {"id": "4", "label": "Calvin Cycle", "type": "process"},
    {"id": "5", "label": "Chlorophyll (Pigment)", "type": "molecule"},
    {"id": "6", "label": "Water (H2O)", "type": "molecule"},
    {"id": "7", "label": "ATP (Energy)", "type": "molecule"},
    {"id": "8", "label": "CO2 (Carbon)", "type": "molecule"},
    {"id": "9", "label": "Glucose (Sugar)", "type": "molecule"},
    {"id": "10", "label": "Oxygen (O2)", "type": "molecule"}
  ],
  "edges": [
    {"source": "1", "target": "2", "label": "occurs in"},
    {"source": "2", "target": "3", "label": "begins with"},
    {"source": "3", "target": "4", "label": "followed by"},
    {"source": "3", "target": "5", "label": "uses"},
    {"source": "3", "target": "6", "label": "splits"},
    {"source": "3", "target": "7", "label": "produces"},
    {"source": "3", "target": "10", "label": "releases"},
    {"source": "4", "target": "8", "label": "uses"},
    {"source": "7", "target": "4", "label": "powers"},
    {"source": "4", "target": "9", "label": "produces"}
  ]
}

NOTE: Clear 5-level hierarchy, 10 nodes, sequential flow, obvious learning path.

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
    let conceptMapData: ConceptMapResponse | null = null;
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
            
            // Validate hierarchical structure and connection limits
            if (conceptMapData?.edges && conceptMapData?.nodes) {
              const map = conceptMapData; // Type narrowing helper
              const edgeCounts = new Map<string, number>();
              
              map.edges.forEach((edge: { source: string; target: string }) => {
                edgeCounts.set(edge.source, (edgeCounts.get(edge.source) || 0) + 1);
                edgeCounts.set(edge.target, (edgeCounts.get(edge.target) || 0) + 1);
              });
              
              const maxConnections = Math.max(...Array.from(edgeCounts.values()), 0);
              const avgConnectionsPerNode = map.nodes.length > 0
                ? (map.edges.length * 2) / map.nodes.length
                : 0;
              
              // Count nodes per level (rough heuristic based on edges)
              const nodesWithoutIncoming = map.nodes.filter(
                (n) => !map.edges.some((e) => e.target === n.id)
              );
              
              const nodesWithoutOutgoing = map.nodes.filter(
                (n) => !map.edges.some((e) => e.source === n.id)
              );
              
              console.log('📊 Map Structure Analysis:', {
                totalNodes: map.nodes.length,
                totalEdges: map.edges.length,
                topLevelNodes: nodesWithoutIncoming.length,
                leafNodes: nodesWithoutOutgoing.length,
                maxConnectionsPerNode: maxConnections,
                avgConnectionsPerNode: avgConnectionsPerNode.toFixed(1)
              });
              
              // Validation
              if (nodesWithoutIncoming.length !== 1) {
                console.warn('⚠️ Map should have exactly 1 top-level node, found:', nodesWithoutIncoming.length);
              } else {
                console.log('✅ Clean hierarchical structure detected (1 top-level node)');
              }
              
              if (map.nodes.length < 8 || map.nodes.length > 17) {
                console.warn('⚠️ Node count outside ideal range (10-15):', map.nodes.length);
              } else {
                console.log('✅ Node count within ideal range');
              }
              
              if (maxConnections > 3) {
                console.warn('⚠️ AI exceeded connection limit! Node has', maxConnections, 'edges');
              } else if (maxConnections <= 3) {
                console.log('✅ All nodes within connection limits (max 3 edges)');
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

import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

// Function to get OpenAI client (lazy initialization)
const getOpenAIClient = () => {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OpenAI API key not configured');
  }
  return new OpenAI({ apiKey });
};

// Input validation schema
interface ConceptMapRequest {
  notes: string;
}

// Expected response format
interface ConceptNode {
  id: string;
  label: string;
  type: string;
}

interface ConceptEdge {
  source: string;
  target: string;
  label: string;
}

interface ConceptMapResponse {
  nodes: ConceptNode[];
  edges: ConceptEdge[];
}

// Validation function
const validateInput = (notes: string): { isValid: boolean; error?: string } => {
  if (!notes || typeof notes !== 'string') {
    return { isValid: false, error: 'Notes field is required and must be a string' };
  }

  if (notes.trim().length === 0) {
    return { isValid: false, error: 'Notes cannot be empty' };
  }

  if (notes.length > 10000) {
    return { isValid: false, error: 'Notes must be less than 10,000 characters' };
  }

  if (notes.length < 50) {
    return { isValid: false, error: 'Notes must be at least 50 characters to generate meaningful concept maps' };
  }

  return { isValid: true };
};

// OpenAI prompt for concept extraction
const createConceptExtractionPrompt = (notes: string): string => {
  return `CRITICAL FORMATTING RULE:
You MUST respond with a single, valid JSON object containing "nodes" and "edges". Do NOT include any other text before or after the JSON.

You are an educational AI assistant that creates hierarchical concept maps from student notes.

STUDENT NOTES:
${notes}

TASK:
Create a concept map that follows EXACTLY the same pedagogy and structure as specified below.

RESPONSE FORMAT (follow this precisely):
{
  "nodes": [
    {"id": "1", "label": "Main Concept", "type": "process"},
    {"id": "2", "label": "Related Concept", "type": "molecule"}
  ],
  "edges": [
    {"source": "1", "target": "2", "label": "occurs in"}
  ]
}

CRITICAL RULES FOR CONCEPT MAP - PEDAGOGICAL STRUCTURE:

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

LEVEL 2: Context/Location
- 1-2 nodes
- Where does this happen? What's the setting?

LEVEL 3: Major Stages/Components
- 2-4 nodes
- The key processes or main parts (in sequence if process-oriented)

LEVEL 4: Key Mechanisms/Details
- 4-6 nodes
- Important supporting concepts under each major stage

LEVEL 5 (Bottom): Outcomes/Products
- 2-3 nodes
- What results from this process? What's produced?

NODE COUNT TARGET: 10-15 nodes total (not more, not less)

CONNECTION RULES FOR HIERARCHY:
- Nodes should primarily connect to adjacent levels (Level 1→2, 2→3, 3→4, 4→5)
- Avoid skip connections across multiple levels
- Maximum 3 edges per node
- Create DOWNWARD flow (parent → child relationships)
- Avoid horizontal connections between same-level nodes unless showing sequence

SEQUENCE vs STRUCTURE:
- For processes (photosynthesis, respiration, replication):
  Show clear sequential flow with arrows indicating "then" or "next"
- For structures (cell anatomy, organ systems):
  Show hierarchical composition with "contains" or "part of"

CLARITY OVER COMPLETENESS:
- Include only the MOST IMPORTANT concepts (10-15 max)
- Skip minor details that don't aid understanding
- Group related items when possible
- Better to be clear with fewer nodes than comprehensive but confusing

NODE LABELING FOR CONTEXT:
- Make labels self-explanatory
- Add brief context when helpful (e.g., "ATP (Energy Carrier)")

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

VALIDATION CHECKLIST (verify before returning):
✓ Does the map have 3-5 clear levels?
✓ Is there exactly 1 main concept at the top?
✓ Do edges flow primarily downward (parent → child)?
✓ Are there 10-15 nodes total?
✓ Can a student follow a clear learning path?
✓ Is each node in the right hierarchical level?
✓ Are node labels self-explanatory with context?
✓ Does the map tell a coherent story?

TOPIC-SPECIFIC GUIDANCE:

For biological processes (metabolism, respiration, photosynthesis, replication):
Level 1: Process name
Level 2: Where it occurs
Level 3: Major stages (in order: Stage 1 → Stage 2 → Stage 3)
Level 4: Key molecules/enzymes for each stage
Level 5: Products/outcomes

For biological structures (cell, organ, tissue):
Level 1: Main structure
Level 2: Location in organism
Level 3: Major components/parts
Level 4: Sub-structures within each part
Level 5: Functions/purposes

For systems (nervous, circulatory, digestive):
Level 1: System name
Level 2: Main organs involved
Level 3: Key processes that occur
Level 4: Important molecules/signals
Level 5: Outcomes/functions

REMEMBER: You're teaching a student who knows nothing about this topic. Make it crystal clear.

ABSOLUTE REQUIREMENT - MAPS WILL BE REJECTED IF:
- More than 1 node at the top level (no clear main concept)
- Same-level nodes connect to each other (breaks hierarchy)
- Skip connections across multiple levels (confusing flow)
- More than 16 nodes or fewer than 9 nodes
- No clear top-to-bottom progression

TECHNICAL NOTE - LAYOUT COMPATIBILITY:
Your hierarchical structure will be automatically laid out using the Dagre algorithm with direction TB, ranksep 120, nodesep 100. To ensure clean layouts:
- Keep same-level nodes to 2-4 maximum
- Avoid excessive cross-connections
- Maintain clear parent→child relationships

OUTPUT ONLY THE JSON OBJECT DESCRIBED ABOVE. End your response immediately after the closing brace.`;
};

export async function POST(request: NextRequest) {
  console.log('🚀 Concept map generation API called');
  
  try {
    // Initialize OpenAI client (only when API is called)
    const openai = getOpenAIClient();

    // Parse request body
    let body: ConceptMapRequest;
    try {
      body = await request.json();
      console.log('📝 Request body parsed successfully');
    } catch (error) {
      console.error('❌ Invalid JSON in request body:', error);
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    // Validate input
    const validation = validateInput(body.notes);
    if (!validation.isValid) {
      console.error('❌ Input validation failed:', validation.error);
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    console.log(`📊 Processing notes (${body.notes.length} characters)`);

    // Create the prompt
    const prompt = createConceptExtractionPrompt(body.notes);
    console.log('🤖 Sending request to OpenAI...');

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini', // Using GPT-4o-mini for cost efficiency while maintaining quality
      messages: [
        {
          role: 'system',
          content: 'You are an expert biology and medical sciences tutor specializing in creating educational concept maps. Always respond with valid JSON only.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3, // Lower temperature for more consistent, structured output
      max_tokens: 2000, // Sufficient for concept map JSON
    });

    console.log('✅ OpenAI response received');

    // Extract and parse the response
    const responseContent = completion.choices[0]?.message?.content;
    if (!responseContent) {
      console.error('❌ Empty response from OpenAI');
      return NextResponse.json(
        { error: 'Empty response from OpenAI' },
        { status: 500 }
      );
    }

    console.log('📋 Raw OpenAI response:', responseContent);

    // Parse JSON response
    let conceptMapData: ConceptMapResponse;
    try {
      // Clean the response in case there's extra text
      const cleanedResponse = responseContent.trim();
      const jsonMatch = cleanedResponse.match(/\{[\s\S]*\}/);
      const jsonString = jsonMatch ? jsonMatch[0] : cleanedResponse;
      
      console.log('🔧 Parsing JSON string:', jsonString);
      conceptMapData = JSON.parse(jsonString);
      console.log('✅ JSON parsed successfully:', conceptMapData);
    } catch (parseError) {
      console.error('❌ Failed to parse OpenAI response as JSON:', parseError);
      console.error('Raw response:', responseContent);
      return NextResponse.json(
        { error: 'Failed to parse concept map data from AI response' },
        { status: 500 }
      );
    }

    // Validate the structure of the response
    console.log('🔍 Validating concept map structure...');
    console.log('🔍 conceptMapData.nodes:', conceptMapData.nodes);
    console.log('🔍 conceptMapData.edges:', conceptMapData.edges);
    console.log('🔍 nodes is array:', Array.isArray(conceptMapData.nodes));
    console.log('🔍 edges is array:', Array.isArray(conceptMapData.edges));
    
    if (!conceptMapData.nodes || !conceptMapData.edges || 
        !Array.isArray(conceptMapData.nodes) || !Array.isArray(conceptMapData.edges)) {
      console.error('❌ Invalid concept map structure');
      return NextResponse.json(
        { error: 'Invalid concept map structure received from AI' },
        { status: 500 }
      );
    }
    
    console.log('✅ Concept map structure validation passed');

    // Validate nodes structure
    for (const node of conceptMapData.nodes) {
      if (!node.id || !node.label || !node.type) {
        console.error('❌ Invalid node structure:', node);
        return NextResponse.json(
          { error: 'Invalid node structure in concept map' },
          { status: 500 }
        );
      }
    }

    // Validate edges structure
    for (const edge of conceptMapData.edges) {
      if (!edge.source || !edge.target || !edge.label) {
        console.error('❌ Invalid edge structure:', edge);
        return NextResponse.json(
          { error: 'Invalid edge structure in concept map' },
          { status: 500 }
        );
      }
    }

    console.log(`✅ Concept map generated successfully: ${conceptMapData.nodes.length} nodes, ${conceptMapData.edges.length} edges`);

    // Return successful response
    return NextResponse.json(conceptMapData, { status: 200 });

  } catch (error) {
    console.error('❌ Unexpected error in concept map generation:', error);
    
    // Handle specific OpenAI errors
    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        return NextResponse.json(
          { error: 'Invalid OpenAI API key. Please check your configuration.' },
          { status: 401 }
        );
      }
      
      if (error.message.includes('quota') || error.message.includes('billing')) {
        return NextResponse.json(
          { error: 'OpenAI API quota exceeded. Please check your billing.' },
          { status: 402 }
        );
      }
      
      if (error.message.includes('rate limit')) {
        return NextResponse.json(
          { error: 'OpenAI API rate limit exceeded. Please try again later.' },
          { status: 429 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Internal server error while generating concept map' },
      { status: 500 }
    );
  }
}

// Handle unsupported methods
export async function GET() {
  console.log('❌ GET method not supported for concept map generation');
  return NextResponse.json(
    { error: 'Method not allowed. Use POST to generate concept maps.' },
    { status: 405 }
  );
}


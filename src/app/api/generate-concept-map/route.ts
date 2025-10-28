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
  return `You are an expert in biology and medical sciences. Analyze the following lecture notes and extract key concepts and their relationships to create a concept map.

NOTES:
${notes}

INSTRUCTIONS:
1. Identify the most important biological/medical concepts, terms, processes, and structures
2. Determine the relationships between these concepts
3. Categorize each concept by type (e.g., organelle, molecule, process, system, structure, function, etc.)
4. Return ONLY valid JSON in the exact format specified below

REQUIRED JSON FORMAT:
{
  "nodes": [
    {"id": "1", "label": "Concept Name", "type": "concept_type"},
    {"id": "2", "label": "Another Concept", "type": "another_type"}
  ],
  "edges": [
    {"source": "1", "target": "2", "label": "relationship_type"}
  ]
}

GUIDELINES:
- Use clear, concise labels for concepts (2-4 words max)
- Use descriptive relationship labels (e.g., "produces", "contains", "regulates", "transports", "converts")
- Include 5-15 key concepts for optimal visualization
- Focus on the most important relationships
- Ensure all source and target IDs in edges correspond to actual node IDs
- Do not include any text outside the JSON response

RESPOND WITH ONLY THE JSON OBJECT:`;
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


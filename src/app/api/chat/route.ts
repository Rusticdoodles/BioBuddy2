import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';
import { searchWikimediaImages, extractKeywords } from '@/utils/wikimedia';

// Function to get Anthropic client (lazy initialization)
const getAnthropicClient = () => {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  console.log('🔑 API Key check:', apiKey ? `Found (${apiKey.substring(0, 10)}...)` : 'MISSING');
  if (!apiKey || apiKey.includes('your_') || apiKey.includes('API_KEY')) {
    throw new Error('Anthropic API key not configured. Please add ANTHROPIC_API_KEY to your .env.local file.');
  }
  return new Anthropic({ apiKey });
};

export async function POST(request: NextRequest) {
  try {
    console.log('🔑 Checking API key...', process.env.ANTHROPIC_API_KEY ? 'Found' : 'MISSING');
    
    // Initialize Anthropic client (only when API is called)
    const anthropic = getAnthropicClient();
    
    const { message, conversationHistory } = await request.json();

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required and must be a string' },
        { status: 400 }
      );
    }

    console.log('🤖 Received chat request:', { message, historyLength: conversationHistory?.length || 0 });

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

    // Call Claude API
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2048,
      system: `You are an educational AI assistant that helps students learn by providing clear explanations AND structured concept maps.

When a student asks a question, you MUST respond with BOTH:
1. A clear, educational explanation
2. A JSON concept map showing key concepts and relationships

RESPONSE FORMAT (you must follow this exactly):
EXPLANATION:
[Your clear explanation here - 2-4 paragraphs explaining the concept]

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

RULES FOR EXPLANATION:
- Clear and concise (2-4 paragraphs)
- Break down complex ideas
- Adjust complexity to the question
- No markdown formatting
- Focus on relationships between concepts
- Give citations for the information you provide in a separate paragraph at the end

RULES FOR CONCEPT MAP:
- Include 6-12 key concepts (not too few, not too many)
- Use clear, concise labels (2-4 words max)
- Choose appropriate types: process, molecule, organelle, system, structure, function, enzyme, pathway, organ, tissue, cell, protein, concept
- Use descriptive relationship labels: "produces", "requires", "contains", "regulates", "part of", "leads to", "inhibits", "activates", "transforms into"
- Create a logical hierarchy (main concept at top, details below)
- Ensure all edge IDs match node IDs
- Focus on the MOST important relationships only

EXAMPLE for "What is photosynthesis?":

EXPLANATION:
Photosynthesis is the process by which plants convert light energy into chemical energy. It occurs in chloroplasts and involves two main stages: the light-dependent reactions and the Calvin cycle. During the light reactions, chlorophyll absorbs sunlight and splits water molecules, producing oxygen and ATP. The Calvin cycle then uses this ATP to convert carbon dioxide into glucose.

CONCEPT_MAP:
{
  "nodes": [
    {"id": "1", "label": "Photosynthesis", "type": "process"},
    {"id": "2", "label": "Light Reactions", "type": "process"},
    {"id": "3", "label": "Calvin Cycle", "type": "process"},
    {"id": "4", "label": "Chloroplast", "type": "organelle"},
    {"id": "5", "label": "Glucose", "type": "molecule"},
    {"id": "6", "label": "Oxygen", "type": "molecule"},
    {"id": "7", "label": "Carbon Dioxide", "type": "molecule"},
    {"id": "8", "label": "ATP", "type": "molecule"}
  ],
  "edges": [
    {"source": "1", "target": "4", "label": "occurs in"},
    {"source": "1", "target": "2", "label": "includes"},
    {"source": "1", "target": "3", "label": "includes"},
    {"source": "2", "target": "6", "label": "produces"},
    {"source": "2", "target": "8", "label": "produces"},
    {"source": "3", "target": "7", "label": "uses"},
    {"source": "3", "target": "5", "label": "produces"},
    {"source": "8", "target": "3", "label": "powers"}
  ]
}

CRITICAL: Always include both EXPLANATION and CONCEPT_MAP sections in your response. The concept map must be valid JSON.`,
      messages
    });

    const assistantMessage = response.content[0].type === 'text' ? response.content[0].text : '';

    console.log('✅ Claude API response received');

    // Parse the structured response
    let explanation = assistantMessage;
    let conceptMapData = null;

    // Check if response contains CONCEPT_MAP section
    if (assistantMessage.includes('CONCEPT_MAP:')) {
      const parts = assistantMessage.split('CONCEPT_MAP:');
      explanation = parts[0].replace('EXPLANATION:', '').trim();
      
      try {
        // Extract JSON from the concept map section
        const jsonMatch = parts[1].match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          conceptMapData = JSON.parse(jsonMatch[0]);
          console.log('✅ Successfully parsed concept map from Claude response');
        }
      } catch (error) {
        console.error('❌ Error parsing concept map JSON:', error);
      }
    }

    // Fetch relevant images from Wikimedia Commons
    let images = [] as Awaited<ReturnType<typeof searchWikimediaImages>>;
    try {
      const keywords = extractKeywords(explanation);
      console.log('🔍 Searching images for keywords:', keywords);
      if (keywords.length > 0) {
        images = await searchWikimediaImages(keywords[0], 6);
        console.log('📸 Found images:', images.length);
      }
    } catch (error) {
      console.error('Error fetching images:', error);
    }

    return NextResponse.json({ 
      message: explanation,
      conceptMap: conceptMapData,
      images,
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

import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
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
      max_tokens: 2000,
      system: `You are a helpful educational AI assistant. Your role is to explain concepts clearly and comprehensively to students. When a student asks you a question:

1. Provide a clear and concise explanation of the topic
2. Break down complex concepts into understandable parts
3. Do not use any markdown formatting in your response.
4. Adjust complexity based on the question (if they ask for basics, keep it simple; if they ask for advanced details, go deeper)
5. Focus on how each concept is related to the other concepts.
6. Focus on accuracy and educational value

Your response will be used to automatically generate a visual concept/mind map, so make sure to clearly identify key concepts and their relationships.`,
      messages
    });

    const aiResponse = response.content[0].type === 'text' ? response.content[0].text : '';

    console.log('✅ Claude API response received');

    return NextResponse.json({
      response: aiResponse
    });

  } catch (error) {
    console.error('❌ Error in chat API:', error);
    
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'An unexpected error occurred',
        details: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}

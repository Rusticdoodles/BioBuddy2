import { NextRequest, NextResponse } from 'next/server';
import { searchGoogleImages } from '@/utils/google-images';

export async function POST(request: NextRequest) {
  try {
    const { searchTerm, limit } = await request.json();

    if (!searchTerm || typeof searchTerm !== 'string') {
      return NextResponse.json(
        { error: 'Search term is required and must be a string' },
        { status: 400 }
      );
    }

    console.log('🔍 Searching Google Images for:', searchTerm);

    const images = await searchGoogleImages(searchTerm, limit || 3);

    console.log(`✅ Found ${images.length} Google images`);

    if (images.length === 0) {
      console.warn('⚠️ No images returned from Google search');
    }

    return NextResponse.json({ images, success: true });
  } catch (error) {
    console.error('❌ Error in Google Images API:', error);
    
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'An unexpected error occurred',
        details: process.env.NODE_ENV === 'development' && error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}


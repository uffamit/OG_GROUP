import { NextResponse } from 'next/server';
import { parseIntent } from '@/ai/flows/intent-parser';

export async function POST(request: Request) {
  try {
    const { voiceCommand } = await request.json();

    if (!voiceCommand || typeof voiceCommand !== 'string') {
      return NextResponse.json(
        { error: 'voiceCommand is required and must be a string' },
        { status: 400 }
      );
    }

    const result = await parseIntent({ voiceCommand });
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error parsing intent:', error);
    return NextResponse.json(
      { 
        error: 'Failed to parse intent',
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

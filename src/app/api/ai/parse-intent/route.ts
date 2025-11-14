import { NextResponse } from 'next/server';
import { parseIntent } from '@/ai/flows/intent-parser';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { transcript } = body;

    if (!transcript || typeof transcript !== 'string') {
      return NextResponse.json(
        { error: 'transcript is required and must be a string' },
        { status: 400 }
      );
    }

    const result = await parseIntent({ transcript });
    return NextResponse.json(result);
  } catch (error) {
    console.error('Intent parsing error:', error);
    return NextResponse.json(
      {
        error: 'Failed to parse intent',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

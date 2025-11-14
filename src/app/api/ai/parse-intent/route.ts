import { NextResponse } from 'next/server';
import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const ParseIntentInputSchema = z.object({
  transcript: z.string().describe('The voice transcript to parse'),
});

const ParseIntentOutputSchema = z.object({
  intent: z.enum(['bookAppointment', 'emergency', 'unknown']).describe('The detected intent'),
  dateTime: z.string().optional().describe('The date/time for appointment booking'),
  symptoms: z.string().optional().describe('Symptoms mentioned in emergency'),
  confidence: z.number().describe('Confidence level of the intent detection (0-1)'),
});

const parseIntentPrompt = ai.definePrompt({
  name: 'parseIntentPrompt',
  input: { schema: ParseIntentInputSchema },
  output: { schema: ParseIntentOutputSchema },
  prompt: `You are an AI assistant that parses voice commands in a healthcare context.

Analyze the following transcript and determine the user's intent:
- If they want to book an appointment, set intent to "bookAppointment" and extract the date/time
- If they mention severe symptoms or emergency words (chest pain, can't breathe, severe, help, emergency), set intent to "emergency" and extract symptoms
- Otherwise, set intent to "unknown"

Transcript: {{{transcript}}}

Provide a confidence score between 0 and 1.`,
});

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

    const { output } = await parseIntentPrompt({ transcript });

    if (!output) {
      return NextResponse.json(
        { error: 'Failed to parse intent' },
        { status: 500 }
      );
    }

    return NextResponse.json(output);
  } catch (error) {
    console.error('Error parsing intent:', error);
    return NextResponse.json(
      { error: 'Failed to parse intent', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

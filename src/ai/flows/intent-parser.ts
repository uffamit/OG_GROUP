'use server';
/**
 * @fileOverview AI flow for parsing voice commands into structured intents.
 * Classifies user intent and extracts relevant data for booking appointments,
 * reporting symptoms, handling emergencies, etc.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const IntentInputSchema = z.object({
  transcript: z.string().describe('The user\'s voice command transcript'),
});
export type IntentInput = z.infer<typeof IntentInputSchema>;

const IntentOutputSchema = z.object({
  intent: z
    .enum(['bookAppointment', 'reportSymptom', 'emergency', 'showSchedule', 'unknown'])
    .describe('The classified intent from the user\'s command'),
  dateTime: z
    .string()
    .optional()
    .describe('ISO 8601 datetime string for the appointment'),
  reason: z
    .string()
    .optional()
    .describe('Reason for visit or appointment'),
  symptom: z
    .string()
    .optional()
    .describe('The symptom reported by the user'),
  severity: z
    .enum(['low', 'medium', 'high'])
    .optional()
    .describe('Severity level of the symptom'),
});
export type IntentOutput = z.infer<typeof IntentOutputSchema>;

export async function parseIntent(input: IntentInput): Promise<IntentOutput> {
  return parseIntentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'parseIntentPrompt',
  input: { schema: IntentInputSchema },
  output: { schema: IntentOutputSchema },
  prompt: `You are a healthcare assistant AI that parses user voice commands. Current time is ${new Date().toISOString()}.

User said: "{{{transcript}}}"

Your job is to classify the intent and extract relevant information:

**Intent Types:**
1. 'bookAppointment': User wants to schedule an appointment
   - Extract: dateTime (must be ISO 8601 format), reason
   - Examples: "Book an appointment for tomorrow at 3 PM for my cough"
   
2. 'reportSymptom': User is reporting a symptom
   - Extract: symptom, severity (low/medium/high)
   - Examples: "I have a bad headache", "My chest hurts a lot"
   
3. 'emergency': User is in distress or emergency
   - Examples: "Help me, I fell!", "I need help now!", "Emergency"
   
4. 'showSchedule': User wants to see their schedule
   - Examples: "What do I have today?", "Show my appointments"
   
5. 'unknown': Unable to determine intent

**Important:**
- For 'bookAppointment', ALWAYS provide a dateTime in ISO 8601 format
- Parse relative times like "tomorrow at 3 PM" relative to current time
- For symptoms, infer severity based on description (e.g., "bad headache" = medium/high)
- Respond ONLY with the structured JSON output, no additional text`,
});

const parseIntentFlow = ai.defineFlow(
  {
    name: 'parseIntentFlow',
    inputSchema: IntentInputSchema,
    outputSchema: IntentOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);

'use server';
/**
 * @fileOverview An AI agent that parses voice commands from patients and extracts intent and parameters.
 *
 * - parseIntent - A function that handles the intent parsing process.
 * - ParseIntentInput - The input type for the parseIntent function.
 * - ParseIntentOutput - The return type for the parseIntent function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ParseIntentInputSchema = z.object({
  voiceCommand: z
    .string()
    .describe('The voice command from the user that needs to be parsed.'),
});
export type ParseIntentInput = z.infer<typeof ParseIntentInputSchema>;

const ParseIntentOutputSchema = z.object({
  intent: z
    .enum(['book_appointment', 'emergency', 'check_medications', 'symptom_check', 'unknown'])
    .describe('The identified intent from the voice command.'),
  parameters: z
    .object({
      date: z.string().optional().describe('Date for appointment (if booking appointment).'),
      time: z.string().optional().describe('Time for appointment (if booking appointment).'),
      reason: z.string().optional().describe('Reason for appointment or emergency description.'),
      specialty: z.string().optional().describe('Medical specialty requested (if any).'),
    })
    .describe('Extracted parameters from the voice command.'),
  confidence: z
    .number()
    .describe('Confidence score of the intent parsing (0-1).'),
});
export type ParseIntentOutput = z.infer<typeof ParseIntentOutputSchema>;

export async function parseIntent(
  input: ParseIntentInput
): Promise<ParseIntentOutput> {
  return parseIntentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'parseIntentPrompt',
  input: {schema: ParseIntentInputSchema},
  output: {schema: ParseIntentOutputSchema},
  prompt: `You are an AI assistant that parses voice commands from patients in a medical application.

  Analyze the following voice command and extract:
  1. The main intent (book_appointment, emergency, check_medications, symptom_check, or unknown)
  2. Any relevant parameters like date, time, reason, or specialty
  3. A confidence score (0-1) indicating how certain you are about the parsing

  Examples:
  - "Book an appointment for tomorrow at 4 PM for my cough" -> intent: book_appointment, parameters: {date: "tomorrow", time: "4 PM", reason: "cough"}
  - "Help, I've fallen!" -> intent: emergency, parameters: {reason: "fallen"}
  - "Schedule a cardiology appointment next Tuesday morning" -> intent: book_appointment, parameters: {date: "next Tuesday", time: "morning", specialty: "cardiology"}

  Voice Command: {{{voiceCommand}}}
  `,
});

const parseIntentFlow = ai.defineFlow(
  {
    name: 'parseIntentFlow',
    inputSchema: ParseIntentInputSchema,
    outputSchema: ParseIntentOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

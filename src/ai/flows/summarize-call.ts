'use server';
/**
 * @fileOverview AI flow for summarizing call transcripts from Agora conversations
 *
 * - summarizeCall - A function that summarizes call transcripts
 * - SummarizeCallInput - The input type for the summarizeCall function
 * - SummarizeCallOutput - The return type for the summarizeCall function
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const SummarizeCallInputSchema = z.object({
  transcript: z
    .string()
    .describe('The transcript of the patient-doctor call conversation.'),
});
export type SummarizeCallInput = z.infer<typeof SummarizeCallInputSchema>;

const SummarizeCallOutputSchema = z.object({
  keyPoints: z
    .array(z.string())
    .describe('Key points discussed during the call'),
  symptomsDiscussed: z
    .array(z.string())
    .describe('Symptoms that were discussed during the call'),
  actionItems: z
    .array(z.string())
    .describe('Action items or next steps from the call'),
  overallSummary: z
    .string()
    .describe('A brief overall summary of the call'),
});
export type SummarizeCallOutput = z.infer<typeof SummarizeCallOutputSchema>;

export async function summarizeCall(
  input: SummarizeCallInput
): Promise<SummarizeCallOutput> {
  return summarizeCallFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeCallPrompt',
  input: { schema: SummarizeCallInputSchema },
  output: { schema: SummarizeCallOutputSchema },
  prompt: `You are a medical assistant AI that summarizes patient-doctor call transcripts.

Your task is to analyze the transcript and extract:
1. Key points discussed during the call
2. Symptoms that were mentioned or discussed
3. Action items or next steps (appointments, tests, prescriptions, etc.)
4. A brief overall summary

Be concise and focus on medical relevance. Use bullet points for clarity.

Call Transcript:
{{{transcript}}}
`,
});

const summarizeCallFlow = ai.defineFlow(
  {
    name: 'summarizeCallFlow',
    inputSchema: SummarizeCallInputSchema,
    outputSchema: SummarizeCallOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);

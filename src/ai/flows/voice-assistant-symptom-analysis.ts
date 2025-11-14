'use server';
/**
 * @fileOverview An AI agent that analyzes patient symptoms and provides a preliminary diagnosis and urgency level.
 *
 * - analyzeSymptoms - A function that handles the symptom analysis process.
 * - AnalyzeSymptomsInput - The input type for the analyzeSymptoms function.
 * - AnalyzeSymptomsOutput - The return type for the analyzeSymptoms function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeSymptomsInputSchema = z.object({
  symptomsDescription: z
    .string()
    .describe('A detailed description of the patient\'s symptoms.'),
});
export type AnalyzeSymptomsInput = z.infer<typeof AnalyzeSymptomsInputSchema>;

const AnalyzeSymptomsOutputSchema = z.object({
  diagnosisSuggestions: z
    .array(z.string())
    .describe('A list of potential diagnoses based on the symptoms.'),
  urgencyLevel: z
    .enum(['low', 'medium', 'high'])
    .describe(
      'The urgency level for seeking medical care, based on the symptoms.'
    ),
  recommendations: z
    .string()
    .describe(
      'Recommendations for the patient based on the symptom analysis.'
    ),
});
export type AnalyzeSymptomsOutput = z.infer<typeof AnalyzeSymptomsOutputSchema>;

export async function analyzeSymptoms(
  input: AnalyzeSymptomsInput
): Promise<AnalyzeSymptomsOutput> {
  return analyzeSymptomsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeSymptomsPrompt',
  input: {schema: AnalyzeSymptomsInputSchema},
  output: {schema: AnalyzeSymptomsOutputSchema},
  prompt: `You are an AI-powered healthcare assistant that analyzes patient symptoms and provides a preliminary diagnosis, urgency level, and recommendations.

  Analyze the following symptoms description and provide potential diagnoses, an urgency level (low, medium, high), and recommendations for the patient.

  Symptoms Description: {{{symptomsDescription}}}
  `,
});

const analyzeSymptomsFlow = ai.defineFlow(
  {
    name: 'analyzeSymptomsFlow',
    inputSchema: AnalyzeSymptomsInputSchema,
    outputSchema: AnalyzeSymptomsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

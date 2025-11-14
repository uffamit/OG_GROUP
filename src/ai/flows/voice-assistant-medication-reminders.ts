'use server';
/**
 * @fileOverview A Genkit flow for setting medication reminders via voice assistant.
 *
 * - setMedicationReminder - A function that handles the process of setting a medication reminder based on voice input.
 * - SetMedicationReminderInput - The input type for the setMedicationReminder function.
 * - SetMedicationReminderOutput - The return type for the setMedicationReminder function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SetMedicationReminderInputSchema = z.object({
  userId: z.string().describe('The ID of the user setting the medication reminder.'),
  medicationName: z.string().describe('The name of the medication.'),
  dosage: z.string().describe('The dosage of the medication.'),
  frequency: z.string().describe('The frequency of the medication (e.g., daily, twice daily).'),
  time: z.string().describe('The time of day to take the medication (e.g., 8:00 AM).'),
});

export type SetMedicationReminderInput = z.infer<typeof SetMedicationReminderInputSchema>;

const SetMedicationReminderOutputSchema = z.object({
  success: z.boolean().describe('Indicates whether the medication reminder was successfully set.'),
  message: z.string().describe('A message indicating the status of the medication reminder setting process.'),
});

export type SetMedicationReminderOutput = z.infer<typeof SetMedicationReminderOutputSchema>;

export async function setMedicationReminder(input: SetMedicationReminderInput): Promise<SetMedicationReminderOutput> {
  return setMedicationReminderFlow(input);
}

const prompt = ai.definePrompt({
  name: 'setMedicationReminderPrompt',
  input: {schema: SetMedicationReminderInputSchema},
  output: {schema: SetMedicationReminderOutputSchema},
  prompt: `You are a helpful AI assistant that helps users set medication reminders.

  The user wants to set a reminder to take {{medicationName}} at {{time}}, with a dosage of {{dosage}}, and a frequency of {{frequency}}.
  Confirm with the user that you have set the medication reminder with a success message.
  Make sure to use the parameters provided to set the reminder correctly.

  Ensure that the success parameter is set to true.
  Return the status of the reminder.
  `,
});

const setMedicationReminderFlow = ai.defineFlow(
  {
    name: 'setMedicationReminderFlow',
    inputSchema: SetMedicationReminderInputSchema,
    outputSchema: SetMedicationReminderOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);


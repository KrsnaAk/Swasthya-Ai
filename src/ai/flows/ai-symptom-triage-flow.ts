'use server';
/**
 * @fileOverview This file implements a Genkit flow for AI-powered symptom triage.
 *
 * - aiSymptomTriage - A function that analyzes user-reported symptoms and suggests non-diagnostic next steps.
 * - AiSymptomTriageInput - The input type for the aiSymptomTriage function.
 * - AiSymptomTriageOutput - The return type for the aiSymptomTriage function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const AiSymptomTriageInputSchema = z.object({
  symptoms: z.string().describe('A detailed description of the user\'s symptoms, potentially from text or voice input.'),
});
export type AiSymptomTriageInput = z.infer<typeof AiSymptomTriageInputSchema>;

const AiSymptomTriageOutputSchema = z.object({
  severity: z.enum(['home care', 'clinic visit', 'emergency', 'hospital', 'unknown']).describe('The perceived severity of the symptoms, guiding the suggested next steps.'),
  nextSteps: z.string().describe('Suggested non-diagnostic actions the user should consider based on their symptoms.'),
  disclaimer: z.string().describe('A mandatory disclaimer stating that this is not a medical diagnosis and to seek professional help in emergencies.'),
});
export type AiSymptomTriageOutput = z.infer<typeof AiSymptomTriageOutputSchema>;

export async function aiSymptomTriage(input: AiSymptomTriageInput): Promise<AiSymptomTriageOutput> {
  return aiSymptomTriageFlow(input);
}

const triagePrompt = ai.definePrompt({
  name: 'aiSymptomTriagePrompt',
  input: { schema: AiSymptomTriageInputSchema },
  output: { schema: AiSymptomTriageOutputSchema },
  prompt: `You are a helpful AI assistant designed to provide non-diagnostic guidance based on reported symptoms. Your purpose is to analyze the user's symptoms and suggest appropriate next steps, which could include home care, visiting a clinic, or seeking emergency services. It is crucial to emphasize that you are NOT a medical professional, and your suggestions are NOT a medical diagnosis. Always include a clear disclaimer.

Analyze the following symptoms and determine a severity level (home care, clinic visit, emergency, hospital, or unknown). Then, provide clear, actionable, non-diagnostic next steps.

In case of any doubt about severity, or if symptoms suggest a serious condition, always err on the side of caution and recommend seeking professional medical help or emergency services immediately.

Symptoms: {{{symptoms}}}

Example Output:
{
  "severity": "clinic visit",
  "nextSteps": "Consider visiting a primary care clinic for a thorough check-up. Monitor your symptoms closely and seek emergency care if they worsen.",
  "disclaimer": "This information is for informational purposes only and is not a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition. In case of a medical emergency, call your doctor or emergency services immediately."
}
`,
  config: {
    safetySettings: [
      {
        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
        threshold: 'BLOCK_NONE',
      },
      {
        category: 'HARM_CATEGORY_MEDICAL',
        threshold: 'BLOCK_NONE', // Allow medical content but ensure the prompt emphasizes non-diagnostic nature.
      },
    ],
  },
});

const aiSymptomTriageFlow = ai.defineFlow(
  {
    name: 'aiSymptomTriageFlow',
    inputSchema: AiSymptomTriageInputSchema,
    outputSchema: AiSymptomTriageOutputSchema,
  },
  async (input) => {
    const { output } = await triagePrompt(input);
    return output!;
  }
);

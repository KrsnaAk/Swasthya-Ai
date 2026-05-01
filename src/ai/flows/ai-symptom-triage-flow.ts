'use server';
/**
 * @fileOverview This file implements a Genkit flow for AI-enhanced symptom triage.
 *
 * - aiSymptomTriage - A function that provides human-friendly explanations for triage results.
 * - AiSymptomTriageInput - Detailed input for the AI, including rule-based engine output.
 * - AiSymptomTriageOutput - Structured JSON output for triage guidance.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const AiSymptomTriageInputSchema = z.object({
  symptoms: z.string().describe('The user\'s raw symptom description.'),
  ruleBasedSeverity: z.enum(['RED', 'YELLOW', 'GREEN']).describe('The severity classified by the rule-based engine.'),
  age: z.number().describe('Patient age.'),
  duration: z.number().describe('Duration of symptoms in days.'),
  redFlags: z.array(z.string()).describe('Specific red flags detected by the rule-based engine (e.g., Chest Pain).'),
});
export type AiSymptomTriageInput = z.infer<typeof AiSymptomTriageInputSchema>;

const AiSymptomTriageOutputSchema = z.object({
  summary: z.string().describe('A human-friendly summary of the situation.'),
  possible_concerns: z.array(z.string()).describe('Non-diagnostic list of things to watch out for.'),
  recommended_next_steps: z.array(z.string()).describe('Clear, actionable next steps.'),
  questions_to_ask_doctor: z.array(z.string()).describe('Specific questions for the patient to ask a professional.'),
  home_care_if_safe: z.array(z.string()).describe('Supportive care tips if the severity is not RED.'),
  disclaimer: z.string().describe('Mandatory medical disclaimer.'),
});
export type AiSymptomTriageOutput = z.infer<typeof AiSymptomTriageOutputSchema>;

export async function aiSymptomTriage(input: AiSymptomTriageInput): Promise<AiSymptomTriageOutput> {
  return aiSymptomTriageFlow(input);
}

const triagePrompt = ai.definePrompt({
  name: 'aiSymptomTriagePrompt',
  input: { schema: AiSymptomTriageInputSchema },
  output: { schema: AiSymptomTriageOutputSchema },
  prompt: `You are a medical triage assistant. You are provided with user symptoms, a rule-based severity rating, age, duration, and specific red flags detected. 
Your goal is to provide a human-friendly explanation of the situation and helpful guidance.

### INPUT DATA:
- Symptoms: {{{symptoms}}}
- Rule-based Severity: {{{ruleBasedSeverity}}}
- Red Flags Detected: {{#each redFlags}} - {{{this}}}{{/each}}
- Age: {{{age}}}
- Duration: {{{duration}}} days

### STRICT INSTRUCTIONS:
1. NEVER provide a specific medical diagnosis (e.g., "You have pneumonia").
2. NEVER prescribe or suggest specific medications (e.g., "Take Ibuprofen").
3. NEVER override a RED severity. If the rule-based severity is RED, your summary MUST emphasize immediate emergency care.
4. Do NOT reduce the severity rating.
5. Use simple, empathetic, but clear language.
6. Provide specific questions the user should ask their healthcare provider.
7. Provide safe home care tips (like rest or hydration) ONLY if the severity is GREEN or YELLOW.

### OUTPUT FORMAT:
You must return a JSON object with the following fields:
- summary: A clear summary of what the symptoms and red flags might indicate in terms of urgency.
- possible_concerns: A list of general symptoms or signs the user should monitor closely.
- recommended_next_steps: Clear instructions on where to go or what to do next.
- questions_to_ask_doctor: 3-5 specific questions for a consultation.
- home_care_if_safe: Basic comfort measures if appropriate.
- disclaimer: A strong disclaimer that this is not medical advice.`,
  config: {
    safetySettings: [
      {
        category: 'HARM_CATEGORY_MEDICAL',
        threshold: 'BLOCK_NONE',
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
    if (!output) {
      return {
        summary: "Unable to process AI insights at this time.",
        possible_concerns: [],
        recommended_next_steps: ["Follow the rule-based engine recommendations."],
        questions_to_ask_doctor: [],
        home_care_if_safe: [],
        disclaimer: "AI analysis unavailable."
      };
    }
    return output;
  }
);

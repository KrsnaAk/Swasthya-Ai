'use server';
/**
 * @fileOverview This flow enhances chatbot explanations and summaries with bilingual support.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const ChatbotEnhancementInputSchema = z.object({
  symptoms: z.string(),
  severity: z.string(),
  duration: z.string(),
  painScore: z.number(),
  redFlags: z.array(z.string()),
  language: z.enum(['en', 'hi']).default('en'),
  userContext: z.object({
    name: z.string().optional(),
    age: z.number().optional(),
    conditions: z.string().optional(),
  }).optional(),
});
export type ChatbotEnhancementInput = z.infer<typeof ChatbotEnhancementInputSchema>;

const ChatbotEnhancementOutputSchema = z.object({
  friendlyExplanation: z.string().describe('Empathetic, plain-language explanation of why this severity was assigned.'),
  doctorQuestions: z.array(z.string()).describe('3-5 specific questions for the user to ask their doctor.'),
  safeNextSteps: z.array(z.string()).describe('Immediate non-medical actions like rest or calling emergency.'),
  disclaimer: z.string().describe('Mandatory medical safety disclaimer.'),
});
export type ChatbotEnhancementOutput = z.infer<typeof ChatbotEnhancementOutputSchema>;

export async function enhanceChatbotResult(input: ChatbotEnhancementInput): Promise<ChatbotEnhancementOutput> {
  return chatbotEnhancementFlow(input);
}

const prompt = ai.definePrompt({
  name: 'chatbotEnhancementPrompt',
  input: { schema: ChatbotEnhancementInputSchema },
  output: { schema: ChatbotEnhancementOutputSchema },
  prompt: `You are a healthcare traffic controller assistant. A user has completed a rule-based triage. 
Your goal is to explain the result with empathy and provide next steps.

IMPORTANT: You MUST respond in the following language: {{{language}}}.

### CONTEXT:
- Severity: {{{severity}}}
- Symptoms: {{{symptoms}}}
- Duration: {{{duration}}}
- Pain Score: {{{painScore}}}/10
- Red Flags: {{#each redFlags}} - {{{this}}} {{/each}}
{{#if userContext}}
- User Age: {{{userContext.age}}}
- Known Conditions: {{{userContext.conditions}}}
{{/if}}

### STRICT RULES:
1. NEVER diagnose a disease.
2. NEVER prescribe medicine.
3. NEVER override a RED severity.
4. If RED, your explanation must be urgent and direct.
5. If YELLOW or GREEN, be calm and informative.

### OUTPUT:
Explain why the system flagged these symptoms based on clinical urgency, not disease. 
Ensure the tone is supportive but professional. 
All output fields must be in {{{language}}}.`,
});

const chatbotEnhancementFlow = ai.defineFlow(
  {
    name: 'chatbotEnhancementFlow',
    inputSchema: ChatbotEnhancementInputSchema,
    outputSchema: ChatbotEnhancementOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) throw new Error('AI enhancement failed');
    return output;
  }
);
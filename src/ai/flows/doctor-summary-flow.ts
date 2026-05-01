
'use server';
/**
 * @fileOverview This file implements a Genkit flow for generating a professional doctor summary.
 *
 * - generateDoctorSummary - A function that creates a structured clinical summary.
 * - DoctorSummaryInput - Input including patient profile, triage data, and history.
 * - DoctorSummaryOutput - Professional formatted text.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const DoctorSummaryInputSchema = z.object({
  profile: z.object({
    name: z.string(),
    age: z.number(),
    gender: z.string(),
    abhaId: z.string().optional(),
    bloodGroup: z.string().optional(),
  }),
  medicalContext: z.object({
    allergies: z.string().optional(),
    existingDiseases: z.string().optional(),
    medications: z.string().optional(),
    pastSurgeries: z.string().optional(),
  }),
  currentTriage: z.object({
    symptoms: z.string().optional(),
    severity: z.string().optional(),
    duration: z.number().optional(),
    redFlags: z.array(z.string()).optional(),
  }).optional(),
});
export type DoctorSummaryInput = z.infer<typeof DoctorSummaryInputSchema>;

const DoctorSummaryOutputSchema = z.object({
  formattedSummary: z.string().describe('The professional structured text for the doctor.'),
});
export type DoctorSummaryOutput = z.infer<typeof DoctorSummaryOutputSchema>;

export async function generateDoctorSummary(input: DoctorSummaryInput): Promise<DoctorSummaryOutput> {
  return generateDoctorSummaryFlow(input);
}

const summaryPrompt = ai.definePrompt({
  name: 'generateDoctorSummaryPrompt',
  input: { schema: DoctorSummaryInputSchema },
  output: { schema: DoctorSummaryOutputSchema },
  prompt: `You are a professional medical scribe. Your goal is to generate a concise, structured clinical summary for a doctor's consultation based on provided patient data.

### PATIENT INFO:
- Name: {{{profile.name}}}
- Age: {{{profile.age}}}
- Gender: {{{profile.gender}}}
- ABHA ID: {{{profile.abhaId}}}
- Blood Group: {{{profile.bloodGroup}}}

### MEDICAL CONTEXT:
- Known Allergies: {{{medicalContext.allergies}}}
- Chronic Conditions: {{{medicalContext.existingDiseases}}}
- Medications: {{{medicalContext.medications}}}
- Surgical History: {{{medicalContext.pastSurgeries}}}

{{#if currentTriage}}
### CURRENT PRESENTATION:
- Chief Complaint: {{{currentTriage.symptoms}}}
- Duration: {{{currentTriage.duration}}} days
- Triage Severity: {{{currentTriage.severity}}}
- Warning Signs: {{#each currentTriage.redFlags}} - {{{this}}} {{/each}}
{{/if}}

### STRICT INSTRUCTIONS:
1. Use professional clinical terminology.
2. DO NOT provide a diagnosis.
3. Organize using standard sections: [Demographics], [Chief Complaint], [Past Medical History], [Allergies/Medications].
4. Be concise. A doctor should be able to read this in 30 seconds.
5. Format as Markdown for better readability.`,
});

const generateDoctorSummaryFlow = ai.defineFlow(
  {
    name: 'generateDoctorSummaryFlow',
    inputSchema: DoctorSummaryInputSchema,
    outputSchema: DoctorSummaryOutputSchema,
  },
  async (input) => {
    const { output } = await summaryPrompt(input);
    if (!output) {
      throw new Error("Failed to generate clinical summary.");
    }
    return output;
  }
);

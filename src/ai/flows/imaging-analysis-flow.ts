'use server';
/**
 * @fileOverview Agentic AI Medical Imaging Analysis Flow.
 * Uses Gemini Flash Multimodal capabilities to analyze medical images.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const ImagingAnalysisInputSchema = z.object({
  imageDataUri: z.string().describe("Base64 data URI of the medical image (PNG/JPG)."),
  age: z.number(),
  gender: z.string(),
  symptoms: z.string(),
  imageTypeHint: z.string().optional(),
});

const ImagingAnalysisOutputSchema = z.object({
  image_type: z.string().describe("Identified type: X-ray, MRI, CT, etc."),
  image_quality: z.string().describe("Technical assessment of image quality."),
  summary: z.string().describe("Structured clinical summary of findings."),
  severity: z.enum(['LOW', 'MODERATE', 'HIGH', 'CRITICAL']),
  confidence_score: z.number().describe("AI confidence score from 0-100."),
  key_findings: z.array(z.string()).describe("Direct clinical observations from the image."),
  possible_concerns: z.array(z.string()).describe("Anomalies or variations requiring attention."),
  recommendations: z.array(z.string()).describe("Actionable clinical or diagnostic follow-ups."),
  urgent_flags: z.array(z.string()).describe("List of immediate red flags detected."),
  patient_explanation: z.string().describe("Empathetic, simple explanation for the patient."),
  research_context: z.array(z.object({
    title: z.string(),
    link: z.string(),
    snippet: z.string(),
  })).describe("Simulated research references based on findings."),
  uncertainty: z.string().describe("Specific limitations or areas of AI uncertainty."),
  disclaimer: z.string().describe("Mandatory medical disclaimer."),
});

export type ImagingAnalysisOutput = z.infer<typeof ImagingAnalysisOutputSchema>;

const prompt = ai.definePrompt({
  name: 'imagingAnalysisPrompt',
  input: { schema: ImagingAnalysisInputSchema },
  output: { schema: ImagingAnalysisOutputSchema },
  prompt: `You are an Agentic AI Medical Imaging Assistant. Your goal is to provide a structured, high-fidelity analysis of medical imagery for clinical reference.

### PATIENT CONTEXT:
- Age: {{{age}}}
- Gender: {{{gender}}}
- Clinical Symptoms: {{{symptoms}}}
- User-provided Hint: {{{imageTypeHint}}}

### INPUT IMAGE:
{{media url=imageDataUri}}

### OPERATIONAL PROTOCOL:
1. IDENTIFY: Determine exactly what part of the body and what modality (X-ray, CT, MRI) is shown.
2. QUALITY CHECK: Assess if the image is clear enough for reliable analysis.
3. OBSERVE: Detail specific visual findings (opacities, fractures, masses, alignment, etc.).
4. SYNTHESIZE: Formulate a professional clinical impression.
5. SIMPLIFY: Provide an empathetic explanation that a patient without medical training can understand.
6. RESEARCH: Suggest relevant clinical context or standards (simulated as research_context).
7. SAFETY: Explicitly state what you ARE NOT seeing or where you are uncertain.

### RESTRICTIONS:
- DO NOT provide a final diagnosis. 
- ALWAYS state that this is a "Draft Clinical Report" for physician review.
- NEVER suggest specific medication dosages.
- If the image is not a medical image, clearly state that and refuse analysis.
- You MUST return every field in the JSON schema. All list fields MUST be arrays, even if empty.

### OUTPUT:
Return a JSON object following the specified schema strictly.`,
});

export async function analyzeMedicalImage(input: z.infer<typeof ImagingAnalysisInputSchema>): Promise<ImagingAnalysisOutput> {
  const { output } = await prompt(input);
  if (!output) {
    throw new Error("AI Imaging analysis failed to produce a valid report.");
  }
  return output;
}

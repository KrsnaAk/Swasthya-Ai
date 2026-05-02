/**
 * @fileOverview Type definitions for the AI Medical Imaging Analyzer.
 */

export interface ImagingAnalysisReport {
  id?: string;
  userId: string;
  patientMetadata: {
    age: number;
    gender: string;
    symptoms: string;
    imageTypeHint?: string;
  };
  imageUrl: string;
  aiOutput: {
    image_type: string;
    image_quality: string;
    summary: string;
    severity: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
    confidence_score: number;
    key_findings: string[];
    possible_concerns: string[];
    recommendations: string[];
    urgent_flags: string[];
    patient_explanation: string;
    research_context: { title: string; link: string; snippet: string }[];
    uncertainty: string;
    disclaimer: string;
  };
  reviewStatus: 'pending' | 'reviewed' | 'needs_recheck';
  doctorNotes?: string;
  reviewedAt?: any;
  createdAt: any;
}

export interface ImagingAgentInput {
  imageDataUri: string;
  age: number;
  gender: string;
  symptoms: string;
  imageTypeHint?: string;
}

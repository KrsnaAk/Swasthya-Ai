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
    imageType: string;
    imageQuality: string;
    findings: string[];
    possibleConcerns: string[];
    impression: string;
    patientFriendlyExplanation: string;
    recommendedNextSteps: string[];
    researchContext: { title: string; link: string; snippet: string }[];
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

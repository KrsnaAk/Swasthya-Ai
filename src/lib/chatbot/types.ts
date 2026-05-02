
import { Severity } from '@/lib/triage-engine';

export interface ChatTriageSession {
  symptoms: string;
  duration: string;
  painScore: number;
  hasChestPain: boolean;
  hasBreathingDifficulty: boolean;
  hasFainting: boolean;
  hasHighFever: boolean;
  hasChronicCondition: boolean;
  ageGroup: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'bot';
  content: string;
  timestamp: Date;
  type?: 'text' | 'triage_result' | 'quick_reply';
  data?: any;
}

export interface ChatTriageResult {
  severity: Severity;
  title: string;
  explanation: string;
  recommendation: string;
  nextSteps: string[];
  disclaimer: string;
  aiInsights?: {
    friendlyExplanation: string;
    doctorQuestions: string[];
    safeNextSteps: string[];
  };
}

/**
 * @fileOverview Triage Engine for SwasthyaAI.
 * Implements local rule-based logic to classify symptom severity.
 */

export type Severity = 'RED' | 'YELLOW' | 'GREEN';

export interface TriageInput {
  symptoms: string;
  duration: number; // in days
  age: number;
  existingConditions: string;
  painSeverity: number; // 1-10
  hasFever: boolean;
  hasBreathingDifficulty: boolean;
  hasChestPain: boolean;
  hasUnconscious: boolean;
  hasSevereBleeding: boolean;
  spo2?: number;
}

export interface TriageResult {
  severity: Severity;
  label: string;
  reason: string;
  nextSteps: string;
  disclaimer: string;
}

export function assessSymptoms(input: TriageInput): TriageResult {
  const disclaimer = "DISCLAIMER: This is a preliminary assessment based on provided rules and NOT a medical diagnosis. If you feel your condition is life-threatening, seek emergency medical care immediately regardless of this result.";

  // RED FLAGS (Emergency)
  if (
    (input.hasChestPain && input.hasBreathingDifficulty) ||
    input.hasUnconscious ||
    input.hasSevereBleeding ||
    (input.spo2 && input.spo2 < 92) ||
    input.painSeverity >= 8
  ) {
    return {
      severity: 'RED',
      label: 'Emergency (RED)',
      reason: 'Critical symptoms detected (e.g., severe pain, breathing difficulty with chest pain, or low oxygen levels).',
      nextSteps: 'Call emergency services (108/102) immediately or go to the nearest hospital emergency department.',
      disclaimer,
    };
  }

  // YELLOW FLAGS (Urgent Consultation)
  if (
    (input.hasFever && input.duration > 3) ||
    (input.painSeverity >= 4 && input.painSeverity < 8) ||
    (input.age > 60 && (input.symptoms.length > 0 || input.hasFever)) ||
    input.existingConditions.toLowerCase().includes('diabetes') || 
    input.existingConditions.toLowerCase().includes('heart')
  ) {
    return {
      severity: 'YELLOW',
      label: 'Doctor Consultation Needed (YELLOW)',
      reason: 'Persistent symptoms or risk factors detected that require professional medical evaluation.',
      nextSteps: 'Schedule an appointment with a doctor or visit a clinic within the next 24 hours. Monitor symptoms closely.',
      disclaimer,
    };
  }

  // GREEN (Home Care)
  return {
    severity: 'GREEN',
    label: 'Home Care / Monitor (GREEN)',
    reason: 'Mild symptoms with no immediate red flags detected.',
    nextSteps: 'Rest, stay hydrated, and monitor your symptoms. If symptoms persist or worsen, consult a healthcare provider.',
    disclaimer,
  };
}

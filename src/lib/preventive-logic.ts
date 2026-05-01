
/**
 * @fileOverview Scoring logic for Preventive Health Analytics.
 * Provides transparent rule-based risk calculations.
 */

export interface PreventiveInput {
  age: number;
  weight: number; // in kg
  height: number; // in cm
  isSmoking: boolean;
  isAlcohol: boolean;
  exerciseFreq: 'daily' | 'weekly' | 'rarely';
  sleepHours: number;
  familyDiabetes: boolean;
  familyCardiac: boolean;
  bpStatus: 'normal' | 'high' | 'unknown';
}

export type RiskLevel = 'Low' | 'Moderate' | 'High';

export interface AssessmentResult {
  bmi: number;
  bmiCategory: string;
  diabetesRisk: RiskLevel;
  cardiacRisk: RiskLevel;
  wellnessScore: number;
  recommendations: string[];
}

export function calculateBmi(weight: number, heightCm: number): number {
  const heightM = heightCm / 100;
  return Number((weight / (heightM * heightM)).toFixed(1));
}

export function getBmiCategory(bmi: number): string {
  if (bmi < 18.5) return 'Underweight';
  if (bmi < 25) return 'Normal weight';
  if (bmi < 30) return 'Overweight';
  return 'Obese';
}

export function assessPreventiveRisk(input: PreventiveInput): AssessmentResult {
  const bmi = calculateBmi(input.weight, input.height);
  const bmiCat = getBmiCategory(bmi);
  const recommendations: string[] = [];

  // Diabetes Risk Calculation
  let diabetesScore = 0;
  if (input.familyDiabetes) diabetesScore += 30;
  if (bmi >= 25) diabetesScore += 20;
  if (bmi >= 30) diabetesScore += 20;
  if (input.age > 45) diabetesScore += 15;
  if (input.exerciseFreq === 'rarely') diabetesScore += 15;

  const diabetesRisk: RiskLevel = diabetesScore >= 60 ? 'High' : diabetesScore >= 30 ? 'Moderate' : 'Low';

  // Cardiac Risk Calculation
  let cardiacScore = 0;
  if (input.isSmoking) cardiacScore += 30;
  if (input.familyCardiac) cardiacScore += 20;
  if (input.bpStatus === 'high') cardiacScore += 25;
  if (bmi >= 30) cardiacScore += 15;
  if (input.age > 55) cardiacScore += 10;
  if (input.exerciseFreq === 'rarely') cardiacScore += 10;

  const cardiacRisk: RiskLevel = cardiacScore >= 60 ? 'High' : cardiacScore >= 30 ? 'Moderate' : 'Low';

  // Wellness Score (1-100)
  let wellnessScore = 100;
  if (input.isSmoking) wellnessScore -= 20;
  if (input.isAlcohol) wellnessScore -= 10;
  if (input.sleepHours < 6) wellnessScore -= 15;
  if (input.sleepHours > 9) wellnessScore -= 5;
  if (input.exerciseFreq === 'rarely') wellnessScore -= 20;
  if (input.exerciseFreq === 'weekly') wellnessScore -= 5;
  if (bmi >= 30) wellnessScore -= 10;

  wellnessScore = Math.max(0, wellnessScore);

  // Recommendations
  if (diabetesRisk !== 'Low') recommendations.push('Consult a doctor for a Fasting Blood Glucose test.');
  if (cardiacRisk !== 'Low') recommendations.push('Monitor your Blood Pressure regularly.');
  if (input.isSmoking) recommendations.push('Consider smoking cessation programs.');
  if (input.exerciseFreq !== 'daily') recommendations.push('Aim for 30 minutes of moderate physical activity daily.');
  if (input.sleepHours < 7) recommendations.push('Try to maintain 7-8 hours of consistent sleep.');
  if (bmi >= 25) recommendations.push('Consult a nutritionist for weight management advice.');

  return {
    bmi,
    bmiCategory: bmiCat,
    diabetesRisk,
    cardiacRisk,
    wellnessScore,
    recommendations
  };
}


'use client';

import React, { useState, useEffect } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Activity, 
  Heart, 
  Dna, 
  Flame, 
  Moon, 
  Info, 
  RefreshCcw, 
  CheckCircle2, 
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  Loader2
} from "lucide-react";
import { useUser, useFirestore, useMemoFirebase, useDoc } from "@/firebase";
import { doc, collection, serverTimestamp } from "firebase/firestore";
import { addDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { useToast } from "@/hooks/use-toast";
import { assessPreventiveRisk, type PreventiveInput, type AssessmentResult } from "@/lib/preventive-logic";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

export default function PreventivePage() {
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();

  const userDocRef = useMemoFirebase(() => {
    if (!db || !user?.uid) return null;
    return doc(db, 'users', user.uid);
  }, [db, user?.uid]);

  const { data: profile } = useDoc(userDocRef);

  const [formData, setFormData] = useState<PreventiveInput>({
    age: 30,
    weight: 70,
    height: 170,
    isSmoking: false,
    isAlcohol: false,
    exerciseFreq: 'weekly',
    sleepHours: 7,
    familyDiabetes: false,
    familyCardiac: false,
    bpStatus: 'normal'
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AssessmentResult | null>(null);

  useEffect(() => {
    if (profile?.age) {
      setFormData(prev => ({ ...prev, age: profile.age }));
    }
  }, [profile]);

  const handleAssessment = async () => {
    setLoading(true);
    // Add delay for effect
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const assessment = assessPreventiveRisk(formData);
    setResult(assessment);

    if (db && user?.uid) {
      const assessmentsRef = collection(db, 'users', user.uid, 'preventiveAssessments');
      addDocumentNonBlocking(assessmentsRef, {
        userId: user.uid,
        bmi: assessment.bmi,
        wellnessScore: assessment.wellnessScore,
        diabetesRisk: assessment.diabetesRisk,
        cardiacRisk: assessment.cardiacRisk,
        assessmentDate: serverTimestamp(),
        inputData: formData
      });
    }

    setLoading(false);
    toast({ title: "Assessment Complete", description: "Your wellness profile has been updated." });
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'High': return "text-destructive";
      case 'Moderate': return "text-primary";
      case 'Low': return "text-green-500";
      default: return "";
    }
  };

  const resetAssessment = () => {
    setResult(null);
  };

  return (
    <AppShell>
      <div className="max-w-5xl mx-auto space-y-8 pb-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-headline font-bold">Preventive Health Analytics</h1>
            <p className="text-muted-foreground italic">Identify long-term health risks and optimize your lifestyle.</p>
          </div>
          <div className="flex items-center gap-2 p-3 bg-primary/10 rounded-xl border border-primary/20">
            <ShieldCheck className="h-5 w-5 text-primary" />
            <span className="text-xs font-bold uppercase tracking-tight text-primary">Anonymous Data Analysis</span>
          </div>
        </div>

        {!result ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 space-y-6">
              <Card className="border-border bg-card shadow-xl overflow-hidden">
                <CardHeader className="bg-muted/30 border-b border-border">
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-primary" />
                    Lifestyle Questionnaire
                  </CardTitle>
                  <CardDescription>Answer honestly for accurate scoring.</CardDescription>
                </CardHeader>
                <CardContent className="p-8 space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <Label>Height (cm)</Label>
                      <Input type="number" value={formData.height} onChange={(e) => setFormData({...formData, height: Number(e.target.value)})} />
                    </div>
                    <div className="space-y-3">
                      <Label>Weight (kg)</Label>
                      <Input type="number" value={formData.weight} onChange={(e) => setFormData({...formData, weight: Number(e.target.value)})} />
                    </div>
                    <div className="space-y-3">
                      <Label>Sleep (Hours/Day)</Label>
                      <Input type="number" value={formData.sleepHours} onChange={(e) => setFormData({...formData, sleepHours: Number(e.target.value)})} />
                    </div>
                    <div className="space-y-3">
                      <Label>Blood Pressure</Label>
                      <Select value={formData.bpStatus} onValueChange={(v: any) => setFormData({...formData, bpStatus: v})}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="normal">Normal</SelectItem>
                          <SelectItem value="high">High / Hypertension</SelectItem>
                          <SelectItem value="unknown">I don't know</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-4 pt-4 border-t border-border">
                    <h3 className="text-sm font-bold text-primary uppercase tracking-wider">Lifestyle Habits</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Daily Smoking</Label>
                          <p className="text-xs text-muted-foreground">Any tobacco use in last 24h</p>
                        </div>
                        <Switch checked={formData.isSmoking} onCheckedChange={(v) => setFormData({...formData, isSmoking: v})} />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Alcohol Consumption</Label>
                          <p className="text-xs text-muted-foreground">More than 2 drinks per week</p>
                        </div>
                        <Switch checked={formData.isAlcohol} onCheckedChange={(v) => setFormData({...formData, isAlcohol: v})} />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Family Diabetes</Label>
                          <p className="text-xs text-muted-foreground">Parents or siblings</p>
                        </div>
                        <Switch checked={formData.familyDiabetes} onCheckedChange={(v) => setFormData({...formData, familyDiabetes: v})} />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Family Heart Disease</Label>
                          <p className="text-xs text-muted-foreground">Premature cardiac history</p>
                        </div>
                        <Switch checked={formData.familyCardiac} onCheckedChange={(v) => setFormData({...formData, familyCardiac: v})} />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 pt-4 border-t border-border">
                    <Label>Physical Exercise Frequency</Label>
                    <Select value={formData.exerciseFreq} onValueChange={(v: any) => setFormData({...formData, exerciseFreq: v})}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily (30m+ Intense/Moderate)</SelectItem>
                        <SelectItem value="weekly">Weekly (1-3 times)</SelectItem>
                        <SelectItem value="rarely">Rarely or Sedentary</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
                <CardFooter className="p-8 bg-muted/30 border-t border-border">
                  <Button onClick={handleAssessment} disabled={loading} className="w-full h-14 text-xl font-bold bg-primary text-primary-foreground shadow-lg">
                    {loading ? <><Loader2 className="mr-3 h-6 w-6 animate-spin" /> Calculating Health Risks...</> : "Run Analytics"}
                  </Button>
                </CardFooter>
              </Card>
            </div>

            <div className="lg:col-span-4 space-y-6">
              <Card className="border-border bg-card">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Info className="h-5 w-5 text-primary" />
                    How it works
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-sm text-muted-foreground">
                  <p>Our algorithm uses weighted clinical risk factors to estimate your susceptibility to chronic conditions.</p>
                  <div className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                    <Dna className="h-5 w-5 text-primary shrink-0" />
                    <p>Genetics accounts for ~30% of risk weight.</p>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                    <Flame className="h-5 w-5 text-primary shrink-0" />
                    <p>Lifestyle habits like smoking account for ~50% of preventable risk.</p>
                  </div>
                </CardContent>
              </Card>

              <div className="p-6 border border-destructive/20 bg-destructive/5 rounded-2xl">
                <h4 className="font-bold text-destructive flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-4 w-4" /> Medical Disclaimer
                </h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  These scores are estimates based on lifestyle factors and do not substitute a professional medical exam. Always consult a healthcare provider for diagnosis.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-500">
            {/* Results Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-7 space-y-8">
                {/* Score Summary */}
                <Card className="border-border bg-card shadow-2xl overflow-hidden">
                  <CardHeader className="text-center pb-8 border-b border-border">
                    <div className="mx-auto w-40 h-40 relative mb-4">
                      <div className={cn(
                        "absolute inset-0 rounded-full border-8 border-muted",
                      )} />
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-4xl font-black">{result.wellnessScore}</span>
                        <span className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">Wellness Score</span>
                      </div>
                    </div>
                    <CardTitle className="text-2xl font-headline font-bold">Your Health Outlook</CardTitle>
                    <CardDescription>Based on your current habits and metrics.</CardDescription>
                  </CardHeader>
                  <CardContent className="p-8 space-y-10">
                    <div className="grid grid-cols-2 gap-8">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm font-bold uppercase tracking-tighter">
                          <span>Diabetes Risk</span>
                          <span className={getRiskColor(result.diabetesRisk)}>{result.diabetesRisk}</span>
                        </div>
                        <Progress value={result.diabetesRisk === 'High' ? 85 : result.diabetesRisk === 'Moderate' ? 45 : 15} className="h-2" />
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm font-bold uppercase tracking-tighter">
                          <span>Cardiac Risk</span>
                          <span className={getRiskColor(result.cardiacRisk)}>{result.cardiacRisk}</span>
                        </div>
                        <Progress value={result.cardiacRisk === 'High' ? 85 : result.cardiacRisk === 'Moderate' ? 45 : 15} className="h-2" />
                      </div>
                    </div>

                    <div className="p-6 bg-muted/50 rounded-2xl border border-border flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-background rounded-xl">
                          <Activity className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <p className="text-xs font-bold uppercase text-muted-foreground">Calculated BMI</p>
                          <p className="text-xl font-black">{result.bmi} <span className="text-sm font-medium opacity-60">({result.bmiCategory})</span></p>
                        </div>
                      </div>
                      <Button variant="link" className="text-primary font-bold">Details</Button>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-border bg-card shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-xl flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                      Personalized Action Plan
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 pt-0">
                    <ul className="space-y-4">
                      {result.recommendations.map((rec, i) => (
                        <li key={i} className="flex items-start gap-4 p-4 rounded-xl bg-muted/30 border border-border">
                          <div className="mt-1 h-5 w-5 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                             <div className="h-2 w-2 rounded-full bg-primary" />
                          </div>
                          <span className="text-sm font-medium leading-relaxed">{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>

              <div className="lg:col-span-5 space-y-6">
                <Card className="border-border bg-card border-l-4 border-l-primary">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-primary" />
                      Market Predictions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 text-sm">
                    <p className="text-muted-foreground">Your lifestyle score is trending <strong>above average</strong> for your age group.</p>
                    <div className="p-4 bg-primary/10 rounded-xl space-y-2">
                      <p className="text-xs font-bold uppercase text-primary">Wellness Insight</p>
                      <p className="font-medium">Maintaining a sleep schedule of 7+ hours could improve your Wellness Score by up to 15 points.</p>
                    </div>
                  </CardContent>
                </Card>

                <div className="bg-card border border-border p-6 rounded-2xl space-y-6">
                  <h4 className="font-bold flex items-center gap-2"><Moon className="h-4 w-4 text-primary" /> Optimization Guide</h4>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-muted-foreground">Sedentary Hours</span>
                      <span className="font-bold">High Risk</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-muted-foreground">Hydration Levels</span>
                      <span className="font-bold text-green-500">Optimal</span>
                    </div>
                  </div>
                  <Button className="w-full h-12" variant="outline" onClick={resetAssessment}>
                    <RefreshCcw className="mr-2 h-4 w-4" /> Redo Assessment
                  </Button>
                </div>

                <Button asChild className="w-full h-16 text-lg font-bold shadow-xl">
                  <a href="/triage" className="flex items-center justify-center gap-2">
                    Start Detailed Symptom Triage <ArrowRight className="h-5 w-5" />
                  </a>
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { 
  Send, 
  Info, 
  RefreshCcw, 
  AlertTriangle, 
  ShieldAlert, 
  Home, 
  Building2, 
  HelpCircle, 
  Stethoscope,
  ArrowRight,
  History,
  MapPin
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { assessSymptoms, type TriageResult, type TriageInput } from "@/lib/triage-engine";
import { useUser, useFirestore, useMemoFirebase, useDoc } from "@/firebase";
import { collection, doc, serverTimestamp } from "firebase/firestore";
import { addDocumentNonBlocking } from "@/firebase/non-blocking-updates";

export default function TriagePage() {
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();

  const userDocRef = useMemoFirebase(() => {
    if (!db || !user?.uid) return null;
    return doc(db, 'users', user.uid);
  }, [db, user?.uid]);

  const { data: profile } = useDoc(userDocRef);

  const [formData, setFormData] = useState<TriageInput>({
    symptoms: "",
    duration: 1,
    age: 30,
    existingConditions: "",
    painSeverity: 1,
    hasFever: false,
    hasBreathingDifficulty: false,
    hasChestPain: false,
    hasUnconscious: false,
    hasSevereBleeding: false,
    spo2: undefined,
  });

  useEffect(() => {
    if (profile?.age) {
      setFormData(prev => ({ ...prev, age: profile.age }));
    }
  }, [profile]);

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TriageResult | null>(null);

  const handleTriage = async () => {
    if (!formData.symptoms.trim()) {
      toast({
        title: "Information Required",
        description: "Please describe your symptoms briefly.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    // Simulate processing delay for better UX
    setTimeout(() => {
      const assessment = assessSymptoms(formData);
      setResult(assessment);
      setLoading(false);
    }, 800);
  };

  const saveToHistory = () => {
    if (!db || !user?.uid || !result) return;

    const triageColRef = collection(db, 'users', user.uid, 'triageAssessments');
    
    addDocumentNonBlocking(triageColRef, {
      userId: user.uid,
      symptomsInput: formData.symptoms,
      assessmentResult: result.severity.toLowerCase(),
      suggestedNextSteps: result.nextSteps,
      assessmentDate: serverTimestamp(),
      rawAiResponse: JSON.stringify({
        input: formData,
        engine: "rule-based-v1"
      })
    });

    toast({
      title: "Saved to History",
      description: "Your assessment has been added to your health records.",
    });
  };

  const resetTriage = () => {
    setFormData({
      symptoms: "",
      duration: 1,
      age: profile?.age || 30,
      existingConditions: "",
      painSeverity: 1,
      hasFever: false,
      hasBreathingDifficulty: false,
      hasChestPain: false,
      hasUnconscious: false,
      hasSevereBleeding: false,
      spo2: undefined,
    });
    setResult(null);
  };

  const getSeverityStyles = (severity: string) => {
    switch (severity) {
      case 'RED': return "bg-destructive/10 border-destructive text-destructive";
      case 'YELLOW': return "bg-primary/10 border-primary text-primary";
      case 'GREEN': return "bg-green-500/10 border-green-500 text-green-500";
      default: return "bg-muted border-border text-muted-foreground";
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'RED': return <ShieldAlert className="h-12 w-12" />;
      case 'YELLOW': return <Building2 className="h-12 w-12" />;
      case 'GREEN': return <Home className="h-12 w-12" />;
      default: return <HelpCircle className="h-12 w-12" />;
    }
  };

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto space-y-6 pb-12">
        {!result ? (
          <Card className="border-border bg-card shadow-2xl">
            <CardHeader className="border-b border-border bg-muted/30">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-primary rounded-xl">
                  <Stethoscope className="h-6 w-6 text-primary-foreground" />
                </div>
                <CardTitle className="text-2xl font-headline font-bold">Health Assessment</CardTitle>
              </div>
              <CardDescription>
                Provide details about your symptoms for a rule-based triage assessment.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 md:p-8 space-y-8">
              {/* Symptoms Text */}
              <div className="space-y-3">
                <Label htmlFor="symptoms" className="text-lg font-semibold">Describe your symptoms</Label>
                <Textarea 
                  id="symptoms"
                  placeholder="Describe how you are feeling (e.g., Sharp pain in lower back, persistent cough...)"
                  className="min-h-[120px] bg-background"
                  value={formData.symptoms}
                  onChange={(e) => setFormData({ ...formData, symptoms: e.target.value })}
                />
              </div>

              {/* Basic Info Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label htmlFor="duration">Duration (Days)</Label>
                  <Input 
                    id="duration" 
                    type="number" 
                    value={formData.duration} 
                    onChange={(e) => setFormData({...formData, duration: Number(e.target.value)})}
                  />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="age">Patient Age</Label>
                  <Input 
                    id="age" 
                    type="number" 
                    value={formData.age} 
                    onChange={(e) => setFormData({...formData, age: Number(e.target.value)})}
                  />
                </div>
              </div>

              {/* Pain Severity Slider */}
              <div className="space-y-4 pt-2">
                <div className="flex justify-between items-center">
                  <Label className="text-base font-semibold">Pain Severity (1-10)</Label>
                  <span className={cn(
                    "font-bold text-lg px-3 py-1 rounded-md",
                    formData.painSeverity >= 8 ? "bg-destructive text-white" :
                    formData.painSeverity >= 4 ? "bg-primary text-primary-foreground" : "bg-muted"
                  )}>
                    {formData.painSeverity}
                  </span>
                </div>
                <Slider 
                  value={[formData.painSeverity]} 
                  max={10} 
                  step={1} 
                  onValueChange={(vals) => setFormData({...formData, painSeverity: vals[0]})}
                />
                <div className="flex justify-between text-xs text-muted-foreground font-mono">
                  <span>MILD</span>
                  <span>MODERATE</span>
                  <span>SEVERE</span>
                </div>
              </div>

              {/* Red Flag Toggles */}
              <div className="space-y-4 pt-4 border-t border-border">
                <h3 className="text-sm font-bold text-primary uppercase tracking-wider">Check if applicable:</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="fever">Fever</Label>
                    <Switch id="fever" checked={formData.hasFever} onCheckedChange={(v) => setFormData({...formData, hasFever: v})} />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="breathing">Difficulty Breathing</Label>
                    <Switch id="breathing" checked={formData.hasBreathingDifficulty} onCheckedChange={(v) => setFormData({...formData, hasBreathingDifficulty: v})} />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="chest-pain">Chest Pain</Label>
                    <Switch id="chest-pain" checked={formData.hasChestPain} onCheckedChange={(v) => setFormData({...formData, hasChestPain: v})} />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="unconscious">Fainting / Unconscious</Label>
                    <Switch id="unconscious" checked={formData.hasUnconscious} onCheckedChange={(v) => setFormData({...formData, hasUnconscious: v})} />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="bleeding">Severe Bleeding</Label>
                    <Switch id="bleeding" checked={formData.hasSevereBleeding} onCheckedChange={(v) => setFormData({...formData, hasSevereBleeding: v})} />
                  </div>
                </div>
              </div>

              {/* Additional Inputs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                <div className="space-y-3">
                  <Label htmlFor="conditions">Existing Medical Conditions</Label>
                  <Input 
                    id="conditions" 
                    placeholder="e.g. Hypertension, Diabetes" 
                    value={formData.existingConditions}
                    onChange={(e) => setFormData({...formData, existingConditions: e.target.value})}
                  />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="spo2">Oxygen Saturation (SpO2 % - optional)</Label>
                  <Input 
                    id="spo2" 
                    type="number" 
                    placeholder="e.g. 98" 
                    value={formData.spo2 || ''}
                    onChange={(e) => setFormData({...formData, spo2: e.target.value ? Number(e.target.value) : undefined})}
                  />
                </div>
              </div>

              {/* Important Disclaimer */}
              <div className="flex items-start gap-3 p-4 bg-accent/5 rounded-xl text-sm text-muted-foreground border border-accent/20">
                <Info className="h-5 w-5 shrink-0 text-accent" />
                <p>
                  <strong>Urgent:</strong> If you are experiencing sudden confusion, extreme weakness, or paralysis, seek help immediately without completing this form.
                </p>
              </div>
            </CardContent>
            <CardFooter className="p-6 md:p-8 pt-0 flex justify-end">
              <Button 
                onClick={handleTriage} 
                disabled={loading} 
                size="lg"
                className="w-full py-7 text-xl font-bold shadow-xl"
              >
                {loading ? (
                  <>
                    <RefreshCcw className="mr-3 h-6 w-6 animate-spin" />
                    Running Triage Rules...
                  </>
                ) : (
                  <>
                    <Send className="mr-3 h-6 w-6" />
                    Analyze Symptoms
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        ) : (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-500">
            <Card className={cn("border-2 shadow-2xl overflow-hidden", getSeverityStyles(result.severity))}>
              <CardHeader className="flex flex-row items-center justify-between pb-8">
                <div className="space-y-2">
                  <h2 className="text-sm font-bold uppercase tracking-widest opacity-80">Triage Result</h2>
                  <CardTitle className="text-4xl font-headline font-black">{result.label}</CardTitle>
                </div>
                <div className="bg-background/20 p-4 rounded-3xl backdrop-blur-sm">
                  {getSeverityIcon(result.severity)}
                </div>
              </CardHeader>
              <CardContent className="space-y-8 bg-card text-foreground p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h3 className="text-xl font-headline font-bold flex items-center gap-2">
                      <AlertTriangle className="h-6 w-6 text-primary" />
                      Why this status?
                    </h3>
                    <p className="text-lg leading-relaxed text-muted-foreground">
                      {result.reason}
                    </p>
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-xl font-headline font-bold flex items-center gap-2">
                      <ArrowRight className="h-6 w-6 text-primary" />
                      Recommended Action
                    </h3>
                    <p className="text-xl font-medium leading-relaxed">
                      {result.nextSteps}
                    </p>
                  </div>
                </div>

                <div className="pt-8 border-t border-border">
                  <div className="p-6 bg-muted/50 rounded-2xl border border-border">
                    <h4 className="text-sm font-bold uppercase tracking-tighter text-accent mb-2 flex items-center gap-2">
                      <ShieldAlert className="h-4 w-4" /> Safety Disclaimer
                    </h4>
                    <p className="text-sm text-muted-foreground leading-relaxed italic">
                      {result.disclaimer}
                    </p>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="bg-muted/30 p-8 flex flex-col md:flex-row gap-4">
                <div className="flex flex-col sm:flex-row gap-4 w-full justify-between items-center">
                  <Button variant="outline" size="lg" onClick={resetTriage} className="w-full sm:w-auto font-bold h-14">
                    <RefreshCcw className="mr-2 h-5 w-5" /> Start New Assessment
                  </Button>
                  
                  <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                    <Button variant="secondary" size="lg" onClick={saveToHistory} className="h-14 font-bold flex-1 sm:flex-none">
                      <History className="mr-2 h-5 w-5" /> Save to History
                    </Button>
                    
                    {(result.severity === 'RED' || result.severity === 'YELLOW') && (
                      <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground h-14 font-bold flex-1 sm:flex-none">
                        <Link href="/facilities">
                          <MapPin className="mr-2 h-5 w-5" /> Find Hospitals
                        </Link>
                      </Button>
                    )}
                  </div>
                </div>
              </CardFooter>
            </Card>
            
            {result.severity === 'RED' && (
              <div className="p-6 bg-destructive text-destructive-foreground rounded-2xl flex items-center justify-between shadow-xl">
                <div className="flex items-center gap-4">
                  <AlertTriangle className="h-10 w-10 animate-pulse" />
                  <div>
                    <h3 className="text-xl font-bold">Immediate Action Required</h3>
                    <p className="opacity-90">Call emergency services if help is not nearby.</p>
                  </div>
                </div>
                <Button variant="secondary" size="lg" className="font-black text-destructive">
                  CALL 108
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </AppShell>
  );
}

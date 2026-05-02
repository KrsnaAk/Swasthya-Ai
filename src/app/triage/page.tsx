
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  MapPin,
  Sparkles,
  MessageCircle,
  Mic,
  MicOff,
  Languages,
  FileText,
  Presentation,
  ShieldCheck,
  ClipboardList
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { assessSymptoms, type TriageResult, type TriageInput } from "@/lib/triage-engine";
import { useUser, useFirestore, useMemoFirebase, useDoc } from "@/firebase";
import { collection, doc, serverTimestamp } from "firebase/firestore";
import { addDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { aiSymptomTriage, type AiSymptomTriageOutput } from "@/ai/flows/ai-symptom-triage-flow";
import { useSpeechRecognition } from "@/hooks/use-speech-recognition";
import { SUPPORTED_LANGUAGES } from "@/lib/languages";
import { t } from "@/lib/translations";
import { DoctorSummaryDialog } from "@/components/DoctorSummaryDialog";

export default function TriagePage() {
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();

  const userDocRef = useMemoFirebase(() => {
    if (!db || !user?.uid) return null;
    return doc(db, 'users', user.uid);
  }, [db, user?.uid]);

  const { data: profile } = useDoc(userDocRef);

  const [activeLang, setActiveLang] = useState('en');
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

  const bcp47 = SUPPORTED_LANGUAGES.find(l => l.code === activeLang)?.bcp47 || 'en-US';
  const { isListening, transcript, startListening, stopListening, error: speechError } = useSpeechRecognition(bcp47);

  useEffect(() => {
    if (profile?.age) {
      setFormData(prev => ({ ...prev, age: profile.age }));
    }
    if (profile?.preferredLanguage) {
      setActiveLang(profile.preferredLanguage);
    }
  }, [profile]);

  useEffect(() => {
    if (transcript) {
      setFormData(prev => ({ ...prev, symptoms: transcript }));
    }
  }, [transcript]);

  useEffect(() => {
    if (speechError) {
      toast({
        title: "Voice Input Error",
        description: speechError,
        variant: "destructive"
      });
    }
  }, [speechError, toast]);

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TriageResult | null>(null);
  const [aiResult, setAiResult] = useState<AiSymptomTriageOutput | null>(null);

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
    const assessment = assessSymptoms(formData);
    setResult(assessment);

    try {
      const aiResponse = await aiSymptomTriage({
        symptoms: formData.symptoms,
        ruleBasedSeverity: assessment.severity,
        age: formData.age,
        duration: formData.duration,
        redFlags: [
          formData.hasChestPain ? 'Chest Pain' : null,
          formData.hasBreathingDifficulty ? 'Breathing Difficulty' : null,
          formData.hasUnconscious ? 'Fainting/Unconscious' : null,
          formData.hasSevereBleeding ? 'Severe Bleeding' : null,
          (formData.spo2 && formData.spo2 < 92) ? 'Low Oxygen' : null,
        ].filter(Boolean) as string[]
      });
      setAiResult(aiResponse);
    } catch (e) {
      console.error("AI Triage failed:", e);
      toast({
        title: "AI Insight Unavailable",
        description: "The AI service is currently unavailable.",
      });
    } finally {
      setLoading(false);
    }
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
      aiSummary: aiResult?.summary || null,
      rawAiResponse: JSON.stringify({ input: formData, engine: "hybrid-v2", aiOutput: aiResult })
    });
    toast({ title: "Saved to History", description: "Assessment saved." });
  };

  const resetTriage = () => {
    setFormData({ symptoms: "", duration: 1, age: profile?.age || 30, existingConditions: "", painSeverity: 1, hasFever: false, hasBreathingDifficulty: false, hasChestPain: false, hasUnconscious: false, hasSevereBleeding: false, spo2: undefined });
    setResult(null);
    setAiResult(null);
  };

  const getSeverityStyles = (severity: string) => {
    switch (severity) {
      case 'RED': return "bg-destructive/10 border-destructive text-destructive";
      case 'YELLOW': return "bg-warning/10 border-warning text-warning";
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
      <div className="max-w-4xl mx-auto space-y-8 pb-20">
        {!result ? (
          <Card className="border-white/5 bg-card/40 backdrop-blur-xl shadow-2xl overflow-hidden rounded-3xl">
            <CardHeader className="border-b border-white/5 bg-primary/5 p-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-primary rounded-2xl shadow-lg shadow-primary/20">
                    <Stethoscope className="h-7 w-7 text-primary-foreground" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl font-headline font-bold">{t('startTriage', activeLang)}</CardTitle>
                    <p className="text-xs text-muted-foreground font-bold tracking-widest mt-1 uppercase">Clinical Assessment Engine</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="glass-panel px-3 py-1.5 rounded-xl flex items-center gap-2">
                    <Languages className="h-4 w-4 text-primary" />
                    <Select value={activeLang} onValueChange={setActiveLang}>
                      <SelectTrigger className="w-[120px] bg-transparent border-none h-6 text-xs focus:ring-0">
                        <SelectValue placeholder="Language" />
                      </SelectTrigger>
                      <SelectContent>
                        {SUPPORTED_LANGUAGES.map((lang) => (
                          <SelectItem key={lang.code} value={lang.code}>{lang.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-8 space-y-10">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="symptoms" className="text-lg font-bold flex items-center gap-2">
                    <ClipboardList className="h-5 w-5 text-primary" />
                    {t('describeSymptoms', activeLang)}
                  </Label>
                  <Button 
                    variant={isListening ? "destructive" : "secondary"} 
                    size="sm" 
                    className="h-10 px-6 gap-2 rounded-xl transition-all"
                    onClick={isListening ? stopListening : startListening}
                  >
                    {isListening ? (
                      <><MicOff className="h-4 w-4 animate-pulse" /> {t('stopSpeaking', activeLang)}</>
                    ) : (
                      <><Mic className="h-4 w-4" /> {t('speakSymptoms', activeLang)}</>
                    )}
                  </Button>
                </div>
                {isListening && <div className="text-xs text-primary animate-pulse font-bold uppercase tracking-widest text-center py-2 bg-primary/5 rounded-lg">{t('listening', activeLang)}</div>}
                <Textarea 
                  id="symptoms"
                  placeholder={t('symptomsPlaceholder', activeLang)}
                  className="min-h-[160px] bg-background/50 text-lg rounded-2xl border-white/5 focus:border-primary/50 transition-colors"
                  value={formData.symptoms}
                  onChange={(e) => setFormData({ ...formData, symptoms: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <Label htmlFor="duration" className="font-bold">Duration (Days)</Label>
                  <Input id="duration" type="number" className="rounded-xl h-12 bg-background/50" value={formData.duration} onChange={(e) => setFormData({...formData, duration: Number(e.target.value)})} />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="age" className="font-bold">Patient Age</Label>
                  <Input id="age" type="number" className="rounded-xl h-12 bg-background/50" value={formData.age} onChange={(e) => setFormData({...formData, age: Number(e.target.value)})} />
                </div>
              </div>

              <div className="space-y-6 pt-4">
                <div className="flex justify-between items-center">
                  <Label className="text-lg font-bold">Pain Severity (1-10)</Label>
                  <span className={cn(
                    "font-black text-xl w-12 h-12 flex items-center justify-center rounded-2xl shadow-inner", 
                    formData.painSeverity >= 8 ? "bg-destructive text-destructive-foreground" : 
                    formData.painSeverity >= 4 ? "bg-primary text-primary-foreground" : "bg-muted"
                  )}>
                    {formData.painSeverity}
                  </span>
                </div>
                <Slider value={[formData.painSeverity]} max={10} step={1} className="py-4" onValueChange={(vals) => setFormData({...formData, painSeverity: vals[0]})} />
              </div>

              <div className="space-y-6 pt-8 border-t border-white/5">
                <h3 className="text-xs font-black text-primary uppercase tracking-[0.2em]">Safety Screen Checklist</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                  <div className="flex items-center justify-between p-4 rounded-2xl bg-muted/30 border border-white/5">
                    <Label htmlFor="fever" className="font-bold">Fever</Label>
                    <Switch id="fever" checked={formData.hasFever} onCheckedChange={(v) => setFormData({...formData, hasFever: v})} />
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-2xl bg-muted/30 border border-white/5">
                    <Label htmlFor="breathing" className="font-bold">Difficulty Breathing</Label>
                    <Switch id="breathing" checked={formData.hasBreathingDifficulty} onCheckedChange={(v) => setFormData({...formData, hasBreathingDifficulty: v})} />
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-2xl bg-muted/30 border border-white/5">
                    <Label htmlFor="chest-pain" className="font-bold">Chest Pain</Label>
                    <Switch id="chest-pain" checked={formData.hasChestPain} onCheckedChange={(v) => setFormData({...formData, hasChestPain: v})} />
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-2xl bg-muted/30 border border-white/5">
                    <Label htmlFor="unconscious" className="font-bold">Fainting / Unconscious</Label>
                    <Switch id="unconscious" checked={formData.hasUnconscious} onCheckedChange={(v) => setFormData({...formData, hasUnconscious: v})} />
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-4 p-6 bg-primary/5 rounded-3xl text-sm text-muted-foreground border border-primary/20">
                <ShieldCheck className="h-6 w-6 shrink-0 text-primary" />
                <p className="leading-relaxed">
                  <strong className="text-foreground">Clinical Protocol:</strong> This assessment uses rule-based logic to prioritize safety. Your data is processed securely and not shared without consent.
                </p>
              </div>
            </CardContent>
            <CardFooter className="p-8 pt-0">
              <Button onClick={handleTriage} disabled={loading} size="lg" className="w-full h-16 text-xl font-bold rounded-2xl shadow-2xl shadow-primary/20 transition-all hover:scale-[1.01] active:scale-[0.99]">
                {loading ? <><RefreshCcw className="mr-3 h-6 w-6 animate-spin" /> RUNNING ASSESSMENT...</> : <><Send className="mr-3 h-6 w-6" /> {t('startTriage', activeLang)}</>}
              </Button>
            </CardFooter>
          </Card>
        ) : (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-12 duration-700">
            {/* Safety Assessment Result */}
            <Card className={cn("border-2 shadow-2xl overflow-hidden rounded-[2rem]", getSeverityStyles(result.severity))}>
              <CardHeader className="flex flex-row items-center justify-between p-10 pb-12">
                <div className="space-y-3">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-background/20 backdrop-blur-sm border border-white/10 text-xs font-black uppercase tracking-widest">
                    Clinical Priority Result
                  </div>
                  <CardTitle className="text-4xl md:text-5xl font-headline font-black leading-none">{result.label}</CardTitle>
                </div>
                <div className="bg-background/20 p-6 rounded-[2rem] backdrop-blur-md shadow-xl heartbeat">
                  {getSeverityIcon(result.severity)}
                </div>
              </CardHeader>
              <CardContent className="bg-card text-foreground p-0">
                <div className="grid grid-cols-1 md:grid-cols-2">
                  <div className="p-10 space-y-6 border-r border-white/5">
                    <h3 className="text-xs font-black uppercase tracking-widest text-primary flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4" /> Assessment Rationale
                    </h3>
                    <p className="text-xl font-medium leading-relaxed">{result.reason}</p>
                  </div>
                  <div className="p-10 space-y-6 bg-primary/5">
                    <h3 className="text-xs font-black uppercase tracking-widest text-primary flex items-center gap-2">
                      <ArrowRight className="h-4 w-4" /> Mandated Next Steps
                    </h3>
                    <p className="text-xl font-bold leading-relaxed medical-gradient-text">{result.nextSteps}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* AI Clinical Insights */}
            {aiResult && (
              <Card className="border-white/5 bg-card/60 backdrop-blur-xl shadow-xl border-l-4 border-l-primary overflow-hidden rounded-3xl">
                <CardHeader className="bg-primary/5 border-b border-white/5 p-8">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Sparkles className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-xl font-bold">AI Pathological Insights</CardTitle>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Generative Clinical Logic</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-8 space-y-10">
                  <p className="text-xl leading-relaxed font-medium text-foreground/90">{aiResult.summary}</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="space-y-4">
                      <h4 className="font-black text-xs uppercase text-primary tracking-widest flex items-center gap-2">
                        <Info className="h-4 w-4" /> Monitorable Concerns
                      </h4>
                      <ul className="space-y-3">
                        {aiResult.possible_concerns.map((item, i) => (
                          <li key={i} className="text-sm text-muted-foreground flex items-start gap-3 bg-muted/30 p-3 rounded-xl border border-white/5">
                            <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0 shadow-[0_0_5px_teal]" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="space-y-4">
                      <h4 className="font-black text-xs uppercase text-primary tracking-widest flex items-center gap-2">
                        <MessageCircle className="h-4 w-4" /> Consultation Directives
                      </h4>
                      <div className="space-y-3">
                        {aiResult.questions_to_ask_doctor.map((item, i) => (
                          <div key={i} className="text-sm italic text-muted-foreground p-4 bg-background/50 rounded-2xl border border-primary/10 relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-1 h-full bg-primary/30" />
                            "{item}"
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Actions Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
               <Button variant="outline" size="lg" onClick={resetTriage} className="h-16 rounded-2xl font-bold border-white/10 hover:bg-white/5 transition-all">
                  <RefreshCcw className="mr-2 h-5 w-5" /> New Assessment
               </Button>
               
               {profile && user && (
                 <DoctorSummaryDialog 
                   userId={user.uid}
                   input={{
                     profile: {
                       name: profile.name,
                       age: profile.age,
                       gender: profile.gender,
                       abhaId: profile.abhaId,
                       bloodGroup: profile.bloodGroup
                     },
                     medicalContext: {
                       allergies: profile.allergies,
                       existingDiseases: profile.existingDiseases,
                       medications: profile.medications,
                       pastSurgeries: profile.pastSurgeries
                     },
                     currentTriage: {
                       symptoms: formData.symptoms,
                       severity: result.severity,
                       duration: formData.duration,
                       redFlags: [
                         formData.hasChestPain ? 'Chest Pain' : null,
                         formData.hasBreathingDifficulty ? 'Breathing Difficulty' : null,
                         formData.hasUnconscious ? 'Unconscious' : null,
                         formData.hasSevereBleeding ? 'Severe Bleeding' : null,
                       ].filter(Boolean) as string[]
                     }
                   }}
                   trigger={
                     <Button variant="secondary" size="lg" className="h-16 rounded-2xl font-bold bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20">
                       <FileText className="mr-2 h-5 w-5" /> Gen Clinical Summary
                     </Button>
                   }
                 />
               )}

               <Button variant="secondary" size="lg" onClick={saveToHistory} className="h-16 rounded-2xl font-bold border border-border">
                 <History className="mr-2 h-5 w-5" /> Log to Timeline
               </Button>

               {(result.severity === 'RED' || result.severity === 'YELLOW') ? (
                 <Button asChild size="lg" className="h-16 rounded-2xl font-bold shadow-xl shadow-primary/20 bg-primary hover:bg-primary/90 text-primary-foreground">
                   <Link href={`/facilities?type=${result.severity === 'RED' ? 'emergency' : 'all'}`}>
                     <MapPin className="mr-2 h-5 w-5" /> {t('findHospital', activeLang)}
                   </Link>
                 </Button>
               ) : (
                 <Button asChild size="lg" variant="outline" className="h-16 rounded-2xl font-bold border-primary text-primary">
                    <Link href="/consultation"><Presentation className="mr-2 h-5 w-5" /> Consultation Mode</Link>
                 </Button>
               )}
            </div>
            
            {/* Red Severity Immediate Warning */}
            {result.severity === 'RED' && (
              <div className="p-8 bg-destructive text-destructive-foreground rounded-[2rem] flex items-center justify-between shadow-2xl shadow-destructive/20 transition-all hover:scale-[1.01]">
                <div className="flex items-center gap-6">
                  <div className="bg-white/20 p-4 rounded-3xl backdrop-blur-md">
                    <ShieldAlert className="h-10 w-10 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-headline font-black uppercase tracking-tight">Immediate Intervention Required</h3>
                    <p className="opacity-90 font-medium text-lg">Every second counts. Clinical protocol mandates emergency activation.</p>
                  </div>
                </div>
                <Button variant="secondary" size="lg" className="h-16 px-10 rounded-2xl font-black text-destructive text-xl shadow-xl" asChild>
                  <a href="tel:108">{t('emergency', activeLang)} 108</a>
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </AppShell>
  );
}

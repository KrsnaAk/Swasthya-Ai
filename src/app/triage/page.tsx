
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
  Presentation
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
          <Card className="border-border bg-card shadow-2xl overflow-hidden">
            <CardHeader className="border-b border-border bg-muted/30">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary rounded-xl">
                    <Stethoscope className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <CardTitle className="text-2xl font-headline font-bold">{t('startTriage', activeLang)}</CardTitle>
                </div>
                <div className="flex items-center gap-2">
                  <Languages className="h-4 w-4 text-muted-foreground" />
                  <Select value={activeLang} onValueChange={setActiveLang}>
                    <SelectTrigger className="w-[140px] bg-background h-8 text-xs">
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
            </CardHeader>
            <CardContent className="p-6 md:p-8 space-y-8">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="symptoms" className="text-lg font-semibold">{t('describeSymptoms', activeLang)}</Label>
                  <Button 
                    variant={isListening ? "destructive" : "secondary"} 
                    size="sm" 
                    className="h-9 px-4 gap-2"
                    onClick={isListening ? stopListening : startListening}
                  >
                    {isListening ? (
                      <><MicOff className="h-4 w-4 animate-pulse" /> {t('stopSpeaking', activeLang)}</>
                    ) : (
                      <><Mic className="h-4 w-4" /> {t('speakSymptoms', activeLang)}</>
                    )}
                  </Button>
                </div>
                {isListening && <div className="text-xs text-primary animate-pulse font-medium mb-2">{t('listening', activeLang)}</div>}
                <Textarea 
                  id="symptoms"
                  placeholder={t('symptomsPlaceholder', activeLang)}
                  className="min-h-[120px] bg-background text-lg"
                  value={formData.symptoms}
                  onChange={(e) => setFormData({ ...formData, symptoms: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label htmlFor="duration">Duration (Days)</Label>
                  <Input id="duration" type="number" value={formData.duration} onChange={(e) => setFormData({...formData, duration: Number(e.target.value)})} />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="age">Patient Age</Label>
                  <Input id="age" type="number" value={formData.age} onChange={(e) => setFormData({...formData, age: Number(e.target.value)})} />
                </div>
              </div>

              <div className="space-y-4 pt-2">
                <div className="flex justify-between items-center">
                  <Label className="text-base font-semibold">Pain Severity (1-10)</Label>
                  <span className={cn("font-bold text-lg px-3 py-1 rounded-md", formData.painSeverity >= 8 ? "bg-destructive text-white" : formData.painSeverity >= 4 ? "bg-primary text-primary-foreground" : "bg-muted")}>
                    {formData.painSeverity}
                  </span>
                </div>
                <Slider value={[formData.painSeverity]} max={10} step={1} onValueChange={(vals) => setFormData({...formData, painSeverity: vals[0]})} />
              </div>

              <div className="space-y-4 pt-4 border-t border-border">
                <h3 className="text-sm font-bold text-primary uppercase tracking-wider">Check if applicable:</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
                  <div className="flex items-center justify-between"><Label htmlFor="fever">Fever</Label><Switch id="fever" checked={formData.hasFever} onCheckedChange={(v) => setFormData({...formData, hasFever: v})} /></div>
                  <div className="flex items-center justify-between"><Label htmlFor="breathing">Difficulty Breathing</Label><Switch id="breathing" checked={formData.hasBreathingDifficulty} onCheckedChange={(v) => setFormData({...formData, hasBreathingDifficulty: v})} /></div>
                  <div className="flex items-center justify-between"><Label htmlFor="chest-pain">Chest Pain</Label><Switch id="chest-pain" checked={formData.hasChestPain} onCheckedChange={(v) => setFormData({...formData, hasChestPain: v})} /></div>
                  <div className="flex items-center justify-between"><Label htmlFor="unconscious">Fainting / Unconscious</Label><Switch id="unconscious" checked={formData.hasUnconscious} onCheckedChange={(v) => setFormData({...formData, hasUnconscious: v})} /></div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-accent/5 rounded-xl text-sm text-muted-foreground border border-accent/20">
                <Info className="h-5 w-5 shrink-0 text-accent" />
                <p><strong>Urgent:</strong> Seek immediate help for sudden confusion, extreme weakness, or paralysis.</p>
              </div>
            </CardContent>
            <CardFooter className="p-6 md:p-8 pt-0 flex justify-end">
              <Button onClick={handleTriage} disabled={loading} size="lg" className="w-full py-7 text-xl font-bold shadow-xl">
                {loading ? <><RefreshCcw className="mr-3 h-6 w-6 animate-spin" /> Analyzing...</> : <><Send className="mr-3 h-6 w-6" /> {t('startTriage', activeLang)}</>}
              </Button>
            </CardFooter>
          </Card>
        ) : (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-500">
            <Card className={cn("border-2 shadow-2xl overflow-hidden", getSeverityStyles(result.severity))}>
              <CardHeader className="flex flex-row items-center justify-between pb-8">
                <div className="space-y-2">
                  <h2 className="text-sm font-bold uppercase tracking-widest opacity-80">Safety Assessment</h2>
                  <CardTitle className="text-4xl font-headline font-black">{result.label}</CardTitle>
                </div>
                <div className="bg-background/20 p-4 rounded-3xl backdrop-blur-sm">
                  {getSeverityIcon(result.severity)}
                </div>
              </CardHeader>
              <CardContent className="space-y-8 bg-card text-foreground p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h3 className="text-xl font-headline font-bold flex items-center gap-2"><AlertTriangle className="h-6 w-6 text-primary" /> Reason</h3>
                    <p className="text-lg leading-relaxed text-muted-foreground">{result.reason}</p>
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-xl font-headline font-bold flex items-center gap-2"><ArrowRight className="h-6 w-6 text-primary" /> Action</h3>
                    <p className="text-xl font-medium leading-relaxed">{result.nextSteps}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {aiResult && (
              <Card className="border-border bg-card shadow-lg border-l-4 border-l-primary overflow-hidden">
                <CardHeader className="bg-muted/30 border-b border-border">
                  <div className="flex items-center gap-2"><Sparkles className="h-5 w-5 text-primary" /><CardTitle className="text-lg font-headline font-bold">AI Insights</CardTitle></div>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  <p className="text-lg leading-relaxed">{aiResult.summary}</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <h4 className="font-bold text-sm uppercase text-primary flex items-center gap-2"><Info className="h-4 w-4" /> To Monitor</h4>
                      <ul className="space-y-2">{aiResult.possible_concerns.map((item, i) => (<li key={i} className="text-sm text-muted-foreground flex items-start gap-2"><span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-border shrink-0" />{item}</li>))}</ul>
                    </div>
                    <div className="space-y-3">
                      <h4 className="font-bold text-sm uppercase text-primary flex items-center gap-2"><MessageCircle className="h-4 w-4" /> Doctor Questions</h4>
                      <ul className="space-y-2">{aiResult.questions_to_ask_doctor.map((item, i) => (<li key={i} className="text-sm text-muted-foreground flex items-start gap-2 italic">"{item}"</li>))}</ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card className="bg-card border-border shadow-xl">
              <CardFooter className="p-8 flex flex-col md:flex-row gap-4">
                <div className="flex flex-col sm:flex-row gap-4 w-full justify-between items-center">
                  <div className="flex flex-wrap gap-3 w-full sm:w-auto">
                    <Button variant="outline" size="lg" onClick={resetTriage} className="font-bold h-14"><RefreshCcw className="mr-2 h-5 w-5" /> New Assessment</Button>
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
                          <Button variant="secondary" size="lg" className="h-14 font-bold bg-primary/10 text-primary">
                            <FileText className="mr-2 h-5 w-5" /> Generate Summary
                          </Button>
                        }
                      />
                    )}
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                    <Button variant="secondary" size="lg" onClick={saveToHistory} className="h-14 font-bold flex-1 sm:flex-none"><History className="mr-2 h-5 w-5" /> Save History</Button>
                    <Button asChild size="lg" variant="outline" className="h-14 font-bold border-primary text-primary">
                      <Link href="/consultation"><Presentation className="mr-2 h-5 w-5" /> Consultation Mode</Link>
                    </Button>
                    {(result.severity === 'RED' || result.severity === 'YELLOW') && (
                      <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground h-14 font-bold flex-1 sm:flex-none">
                        <Link href={`/facilities?type=${result.severity === 'RED' ? 'emergency' : 'all'}`}><MapPin className="mr-2 h-5 w-5" /> {t('findHospital', activeLang)}</Link>
                      </Button>
                    )}
                  </div>
                </div>
              </CardFooter>
            </Card>
            
            {result.severity === 'RED' && (
              <div className="p-6 bg-destructive text-destructive-foreground rounded-2xl flex items-center justify-between shadow-xl">
                <div className="flex items-center gap-4"><AlertTriangle className="h-10 w-10 animate-pulse" /><div><h3 className="text-xl font-bold">Immediate Action</h3><p className="opacity-90">Please call 108/102 right away.</p></div></div>
                <Button variant="secondary" size="lg" className="font-black text-destructive" asChild>
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

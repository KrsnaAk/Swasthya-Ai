'use client';

import React, { useState, useRef } from 'react';
import { AppShell } from '@/components/layout/app-shell';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Upload, 
  FileImage, 
  Loader2, 
  AlertTriangle, 
  CheckCircle2, 
  Search, 
  Microscope,
  ShieldCheck,
  ChevronRight,
  Info,
  DatabaseZap
} from 'lucide-react';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc, collection, serverTimestamp, setDoc } from 'firebase/firestore';
import { analyzeMedicalImage, type ImagingAnalysisOutput } from '@/ai/flows/imaging-analysis-flow';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { ImagingReport } from '@/components/imaging/ImagingReport';
import { DoctorReviewPanel } from '@/components/imaging/DoctorReviewPanel';
import { ImagingAnalysisReport } from '@/types/imaging';

export default function ImagingPage() {
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<ImagingAnalysisReport | null>(null);
  const [saveError, setSaveError] = useState<boolean>(false);
  
  const [metadata, setMetadata] = useState({
    age: 30,
    gender: 'Male',
    symptoms: '',
    imageTypeHint: ''
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const userDocRef = useMemoFirebase(() => {
    if (!db || !user?.uid) return null;
    return doc(db, 'users', user.uid);
  }, [db, user?.uid]);
  const { data: profile } = useDoc(userDocRef);

  React.useEffect(() => {
    if (profile) {
      setMetadata(prev => ({
        ...prev,
        age: profile.age || 30,
        gender: profile.gender || 'Male'
      }));
    }
  }, [profile]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({ title: "File too large", description: "Please upload an image smaller than 5MB.", variant: "destructive" });
        return;
      }
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const handleAnalyze = async () => {
    if (!selectedFile || !user) {
      if (!user) toast({ title: "Auth Required", description: "Please sign in to analyze scans.", variant: "destructive" });
      return;
    }

    setLoading(true);
    setSaveError(false);
    
    let aiResult: ImagingAnalysisOutput;
    let base64: string;

    // STEP 1: AI Analysis (Independent of Firebase Save)
    try {
      base64 = await fileToBase64(selectedFile);
      aiResult = await analyzeMedicalImage({
        imageDataUri: base64,
        age: metadata.age,
        gender: metadata.gender,
        symptoms: metadata.symptoms,
        imageTypeHint: metadata.imageTypeHint
      });
    } catch (e: any) {
      console.error("AI Analysis failed", e);
      setLoading(false);
      toast({ 
        title: "Analysis Failed", 
        description: "The AI could not process this image. Please ensure it is a valid medical scan.", 
        variant: "destructive" 
      });
      return;
    }

    // STEP 2: Create local report object
    const reportId = `IMG-${Date.now()}`;
    const newReport: ImagingAnalysisReport = {
      id: reportId,
      userId: user.uid,
      patientMetadata: metadata,
      imageUrl: base64,
      aiOutput: aiResult,
      reviewStatus: 'pending',
      createdAt: new Date(),
    };

    // STEP 3: Show result immediately
    setReport(newReport);
    setLoading(false);
    toast({ title: "Analysis Complete", description: "The agent has generated a clinical draft report." });

    // STEP 4: Attempt Firebase Sync (Separately)
    try {
      if (db && user) {
        const reportRef = doc(db, 'medical_imaging_reports', reportId);
        await setDoc(reportRef, {
           ...newReport,
           createdAt: serverTimestamp()
        });
      }
    } catch (fireError: any) {
      console.error("Firebase save failed", fireError);
      setSaveError(true);
      toast({ 
        title: "Cloud Sync Warning", 
        description: "Analysis is visible, but could not be saved to your profile due to permissions.", 
        variant: "destructive" 
      });
    }
  };

  const reset = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setReport(null);
    setSaveError(false);
    setMetadata(prev => ({ ...prev, symptoms: '', imageTypeHint: '' }));
  };

  return (
    <AppShell>
      <div className="max-w-6xl mx-auto space-y-8 pb-20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-3xl font-headline font-bold flex items-center gap-3">
              <Microscope className="h-8 w-8 text-primary" />
              Agentic Imaging Analyzer
            </h1>
            <p className="text-muted-foreground">Multimodal AI analysis for clinical radiology assistance.</p>
          </div>
          <div className="flex items-center gap-2 p-3 bg-primary/10 rounded-xl border border-primary/20">
            <ShieldCheck className="h-5 w-5 text-primary" />
            <span className="text-xs font-bold uppercase tracking-tight text-primary">Secure Clinical Data</span>
          </div>
        </div>

        {!report ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-7 space-y-6">
              <Card className="border-white/5 bg-card/50 backdrop-blur-xl rounded-3xl overflow-hidden shadow-2xl">
                <CardHeader className="bg-primary/5 border-b border-white/5 p-8">
                  <CardTitle className="text-xl">Upload Medical Scan</CardTitle>
                  <CardDescription>Supported formats: JPG, PNG (Max 5MB)</CardDescription>
                </CardHeader>
                <CardContent className="p-8">
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className={cn(
                      "group relative border-2 border-dashed rounded-[2rem] p-12 flex flex-col items-center justify-center gap-4 transition-all cursor-pointer",
                      selectedFile ? "border-primary/50 bg-primary/5" : "border-white/10 hover:border-primary/30 hover:bg-white/5"
                    )}
                  >
                    {previewUrl ? (
                      <div className="relative w-full aspect-video rounded-2xl overflow-hidden shadow-xl border border-white/10">
                        <Image src={previewUrl} alt="Preview" fill className="object-contain" unoptimized />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                          <p className="text-white font-bold flex items-center gap-2"><Upload className="h-5 w-5" /> Change Image</p>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="p-6 bg-primary/10 rounded-3xl group-hover:scale-110 transition-transform shadow-inner">
                          <FileImage className="h-12 w-12 text-primary" />
                        </div>
                        <div className="text-center">
                          <p className="font-bold text-lg">Click or drag to upload</p>
                          <p className="text-sm text-muted-foreground">Select X-ray, CT, MRI, or Ultrasound</p>
                        </div>
                      </>
                    )}
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      className="hidden" 
                      accept="image/*" 
                      onChange={handleFileChange} 
                    />
                  </div>
                </CardContent>
              </Card>

              <div className="p-6 bg-accent/5 border border-accent/20 rounded-2xl flex items-start gap-4 shadow-lg">
                <Info className="h-6 w-6 text-accent shrink-0" />
                <div className="space-y-1">
                  <h4 className="font-bold text-accent">Clinical Protocol</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    This agent analyzes pixel-level anomalies using Gemini Flash. It is trained to detect anatomical irregularities but is not a substitute for board-certified radiologist verification.
                  </p>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 space-y-6">
              <Card className="border-border bg-card shadow-xl">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Search className="h-5 w-5 text-primary" />
                    Clinical Context
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Patient Age</Label>
                      <Input type="number" value={metadata.age} onChange={e => setMetadata({...metadata, age: Number(e.target.value)})} />
                    </div>
                    <div className="space-y-2">
                      <Label>Gender</Label>
                      <Input value={metadata.gender} onChange={e => setMetadata({...metadata, gender: e.target.value})} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Chief Complaint / Symptoms</Label>
                    <Textarea 
                      placeholder="e.g., localized pain in chest, persistent cough for 2 weeks" 
                      value={metadata.symptoms}
                      onChange={e => setMetadata({...metadata, symptoms: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Scan Type Hint (Optional)</Label>
                    <Input placeholder="e.g., Chest X-ray" value={metadata.imageTypeHint} onChange={e => setMetadata({...metadata, imageTypeHint: e.target.value})} />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    className="w-full h-14 text-lg font-bold shadow-xl shadow-primary/20 gap-3"
                    disabled={!selectedFile || loading}
                    onClick={handleAnalyze}
                  >
                    {loading ? (
                      <><Loader2 className="h-6 w-6 animate-spin" /> RUNNING MULTIMODAL ANALYSIS...</>
                    ) : (
                      <><Search className="h-6 w-6" /> ANALYZE SCAN NOW</>
                    )}
                  </Button>
                </CardFooter>
              </Card>

              <div className="p-6 bg-destructive/5 border border-destructive/20 rounded-2xl">
                 <h4 className="font-bold text-destructive flex items-center gap-2 mb-2 uppercase text-xs tracking-widest">
                   <AlertTriangle className="h-4 w-4" /> Safety Warning
                 </h4>
                 <p className="text-[10px] text-muted-foreground leading-relaxed">
                   Do not use this tool for acute life-threatening emergencies. If you are experiencing chest pain, severe bleeding, or respiratory failure, call emergency services immediately.
                 </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
             {saveError && (
               <div className="bg-destructive/10 border-2 border-destructive/20 p-6 rounded-3xl flex items-center justify-between gap-6 shadow-xl">
                 <div className="flex items-center gap-4">
                   <div className="bg-destructive/20 p-3 rounded-2xl">
                     <DatabaseZap className="h-6 w-6 text-destructive" />
                   </div>
                   <div>
                     <h3 className="font-bold text-destructive">Clinical Record Not Synced</h3>
                     <p className="text-xs text-muted-foreground">Analysis is temporary. Please contact administrator or check database permissions to save this report permanently.</p>
                   </div>
                 </div>
               </div>
             )}

             <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
               {/* Report View */}
               <div className="lg:col-span-8 space-y-8">
                  <ImagingReport report={report} />
               </div>

               {/* Workflow & Review Sidebar */}
               <div className="lg:col-span-4 space-y-8">
                  <Card className="border-primary/20 bg-primary/5 shadow-xl sticky top-24">
                     <CardHeader>
                        <CardTitle className="text-xl flex items-center gap-2">
                           <CheckCircle2 className="h-6 w-6 text-primary" />
                           Workflow Engine
                        </CardTitle>
                     </CardHeader>
                     <CardContent className="space-y-6">
                        <div className="space-y-4">
                           <DoctorReviewPanel 
                             reportId={report.id!} 
                             currentStatus={report.reviewStatus}
                             onUpdate={(updated) => setReport({ ...report, ...updated })}
                           />
                        </div>

                        <div className="pt-6 border-t border-primary/20">
                           <Button variant="outline" className="w-full h-12 gap-2" onClick={reset}>
                             Analyze Another Scan <ChevronRight className="h-4 w-4" />
                           </Button>
                        </div>
                     </CardContent>
                  </Card>

                  <Card className="border-border bg-card overflow-hidden">
                     <CardHeader className="bg-muted/30">
                        <CardTitle className="text-sm font-bold uppercase tracking-widest">Original Scan</CardTitle>
                     </CardHeader>
                     <CardContent className="p-0 aspect-square relative">
                        <Image src={report.imageUrl} alt="Scan" fill className="object-contain p-4" unoptimized />
                     </CardContent>
                  </Card>
               </div>
             </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}

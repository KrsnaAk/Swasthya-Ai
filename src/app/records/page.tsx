
'use client';

import React, { useState, useEffect } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  ShieldCheck, 
  RefreshCw, 
  Database, 
  ClipboardList, 
  Activity, 
  FileText,
  AlertCircle,
  Loader2,
  CheckCircle2,
  Syringe,
  Stethoscope,
  Heart
} from "lucide-react";
import { useUser, useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { doc, serverTimestamp } from "firebase/firestore";
import { updateDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

export default function RecordsPage() {
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();

  const userDocRef = useMemoFirebase(() => {
    if (!db || !user?.uid) return null;
    return doc(db, 'users', user.uid);
  }, [db, user?.uid]);

  const { data: profile, isLoading } = useDoc(userDocRef);
  const [isSyncing, setIsSyncing] = useState(false);
  const [formData, setFormData] = useState<any>({
    abhaId: "",
    bloodGroup: "",
    allergies: "",
    existingDiseases: "",
    medications: "",
    pastSurgeries: "",
    vaccinationNotes: "",
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        abhaId: profile.abhaId || "",
        bloodGroup: profile.bloodGroup || "",
        allergies: profile.allergies || "",
        existingDiseases: profile.existingDiseases || "",
        medications: profile.medications || "",
        pastSurgeries: profile.pastSurgeries || "",
        vaccinationNotes: profile.vaccinationNotes || "",
      });
    }
  }, [profile]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSave = () => {
    if (!userDocRef) return;
    updateDocumentNonBlocking(userDocRef, {
      ...formData,
      updatedAt: serverTimestamp(),
    });
    toast({
      title: "Records Updated",
      description: "Your clinical profile has been saved successfully.",
    });
  };

  const syncABHA = async () => {
    setIsSyncing(true);
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Mock data fetched from "ABHA Ecosystem"
    const abhaMock = {
      bloodGroup: "O+",
      allergies: "Penicillin, Peanuts",
      existingDiseases: "Hypertension (Diagnosed 2021)",
      medications: "Amlodipine 5mg OD",
      vaccinationNotes: "COVID-19 Full Course, Hepatitis B Completed",
    };

    setFormData(prev => ({ ...prev, ...abhaMock }));
    setIsSyncing(false);
    toast({
      title: "ABHA Sync Complete",
      description: "External medical records have been synchronized.",
    });
  };

  if (isLoading) {
    return (
      <AppShell>
        <div className="flex h-[60vh] w-full items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="max-w-5xl mx-auto space-y-8 pb-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-headline font-bold">Health Records (ABHA)</h1>
            <p className="text-muted-foreground italic">Maintain your digital health ID for faster clinical decisions.</p>
          </div>
          <Button 
            variant="secondary" 
            className="gap-2 bg-primary/10 text-primary hover:bg-primary/20"
            onClick={syncABHA}
            disabled={isSyncing}
          >
            {isSyncing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            Sync with ABHA Portal
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-8 space-y-6">
            <Card className="border-border bg-card">
              <CardHeader className="border-b border-border pb-4">
                <CardTitle className="text-xl flex items-center gap-2">
                  <ClipboardList className="h-5 w-5 text-primary" />
                  Clinical Information
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="abhaId">ABHA ID (Digital Health ID)</Label>
                    <Input id="abhaId" placeholder="XX-XXXX-XXXX-XXXX" value={formData.abhaId} onChange={handleInputChange} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bloodGroup">Blood Group</Label>
                    <Input id="bloodGroup" placeholder="e.g., A+" value={formData.bloodGroup} onChange={handleInputChange} />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="existingDiseases" className="flex items-center gap-2">
                    <Activity className="h-4 w-4 text-primary" />
                    Chronic Conditions / Diseases
                  </Label>
                  <Textarea id="existingDiseases" placeholder="e.g., Diabetes, Hypertension, Asthma" value={formData.existingDiseases} onChange={handleInputChange} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="allergies" className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-destructive" />
                    Known Allergies
                  </Label>
                  <Textarea id="allergies" placeholder="e.g., Peanuts, Penicillin, Dust" value={formData.allergies} onChange={handleInputChange} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="medications" className="flex items-center gap-2">
                    <Stethoscope className="h-4 w-4 text-primary" />
                    Current Medications
                  </Label>
                  <Textarea id="medications" placeholder="List all current medicines and dosages" value={formData.medications} onChange={handleInputChange} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pastSurgeries">Past Surgeries / Hospitalizations</Label>
                  <Textarea id="pastSurgeries" value={formData.pastSurgeries} onChange={handleInputChange} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="vaccinationNotes" className="flex items-center gap-2">
                    <Syringe className="h-4 w-4 text-primary" />
                    Vaccination History
                  </Label>
                  <Textarea id="vaccinationNotes" value={formData.vaccinationNotes} onChange={handleInputChange} />
                </div>
              </CardContent>
              <CardFooter className="border-t border-border p-6 flex justify-end">
                <Button onClick={handleSave} className="bg-primary text-primary-foreground font-bold px-8">
                  Update Clinical Profile
                </Button>
              </CardFooter>
            </Card>
          </div>

          {/* Sidebar / Stats */}
          <div className="lg:col-span-4 space-y-6">
            <Card className="border-border bg-muted/30">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-green-500" />
                  Privacy & Consent
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-4 text-muted-foreground">
                <p>
                  Your health records are encrypted and stored securely. This data is only used during AI Triage to provide more accurate assessments.
                </p>
                <div className="flex items-center gap-2 text-foreground font-medium">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  HIPAA Compliant Storage
                </div>
                <div className="flex items-center gap-2 text-foreground font-medium">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  End-to-End Encryption
                </div>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Database className="h-5 w-5 text-primary" />
                  Export Data
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-xs text-muted-foreground">Download a clinical summary of your profile to share with your doctor.</p>
                <Button variant="outline" className="w-full justify-start gap-2 h-12">
                  <FileText className="h-4 w-4" /> Export as PDF
                </Button>
                <Button variant="outline" className="w-full justify-start gap-2 h-12">
                  <Database className="h-4 w-4" /> JSON Export (FHIR)
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

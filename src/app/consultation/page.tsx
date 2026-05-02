
'use client';

import React, { useMemo } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Presentation, 
  Stethoscope, 
  ClipboardList, 
  History, 
  Activity, 
  FileText, 
  Loader2, 
  Copy, 
  Share2, 
  User as UserIcon,
  Calendar,
  AlertCircle
} from "lucide-react";
import { useUser, useFirestore, useMemoFirebase, useCollection, useDoc } from "@/firebase";
import { collection, query, orderBy, limit, doc } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

export default function ConsultationModePage() {
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();

  const userDocRef = useMemoFirebase(() => {
    if (!db || !user?.uid) return null;
    return doc(db, 'users', user.uid);
  }, [db, user?.uid]);

  const { data: profile, isLoading: isProfileLoading } = useDoc(userDocRef);

  // Fetch Latest Triage Assessments
  const triageQuery = useMemoFirebase(() => {
    if (!db || !user?.uid) return null;
    return query(
      collection(db, 'users', user.uid, 'triageAssessments'),
      orderBy('assessmentDate', 'desc'),
      limit(5)
    );
  }, [db, user?.uid]);

  // Fetch Latest Doctor Summaries
  const summaryQuery = useMemoFirebase(() => {
    if (!db || !user?.uid) return null;
    return query(
      collection(db, 'users', user.uid, 'doctorSummaries'),
      orderBy('createdAt', 'desc'),
      limit(1)
    );
  }, [db, user?.uid]);

  const { data: triageRecords, isLoading: isTriageLoading } = useCollection(triageQuery);
  const { data: summaryRecords, isLoading: isSummaryLoading } = useCollection(summaryQuery);

  const latestSummary = summaryRecords?.[0];

  const handleCopy = () => {
    if (latestSummary?.summaryText) {
      navigator.clipboard.writeText(latestSummary.summaryText);
      toast({ title: "Copied", description: "Clinical summary copied for sharing." });
    }
  };

  if (isProfileLoading || isTriageLoading || isSummaryLoading) {
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
      <div className="max-w-6xl mx-auto space-y-8 pb-20">
        {/* Physician View Header */}
        <div className="bg-primary/10 border border-primary/20 p-6 rounded-2xl flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="bg-primary p-3 rounded-2xl text-primary-foreground shadow-lg shadow-primary/20">
              <Presentation className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-2xl font-headline font-bold">Consultation Mode</h1>
              <p className="text-sm text-muted-foreground">Patient: <span className="text-foreground font-bold">{profile?.name}</span> • Age: {profile?.age} • Gender: {profile?.gender}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2 bg-background" onClick={handleCopy}>
              <Copy className="h-4 w-4" /> Copy Summary
            </Button>
            <Button className="gap-2 bg-primary text-primary-foreground font-bold" onClick={() => {
              if (navigator.share) {
                navigator.share({ title: `Consultation Data - ${profile?.name}`, text: latestSummary?.summaryText });
              } else {
                handleCopy();
              }
            }}>
              <Share2 className="h-4 w-4" /> Share with Doctor
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Clinical Summary */}
          <div className="lg:col-span-8 space-y-8">
            <Card className="border-border bg-card shadow-xl overflow-hidden">
              <CardHeader className="bg-muted/30 border-b border-border flex flex-row items-center justify-between py-4">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">Structured Clinical Summary</CardTitle>
                </div>
                {latestSummary && (
                  <time className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">
                    Generated: {new Date(latestSummary.createdAt?.toDate?.() || latestSummary.createdAt).toLocaleDateString()}
                  </time>
                )}
              </CardHeader>
              <CardContent className="p-6">
                {latestSummary ? (
                  <div className="prose prose-invert max-w-none">
                    <div className="whitespace-pre-wrap font-mono text-sm leading-relaxed bg-muted/50 p-6 rounded-xl border border-border">
                      {latestSummary.summaryText}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 space-y-4">
                    <ClipboardList className="h-12 w-12 text-muted-foreground/30 mx-auto" />
                    <p className="text-muted-foreground">No recent clinical summary found.</p>
                    <Button variant="secondary" asChild><a href="/records">Prepare Records</a></Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Symptom Timeline */}
            <div className="space-y-4">
              <h3 className="text-xl font-headline font-bold flex items-center gap-2">
                <History className="h-5 w-5 text-primary" />
                Recent Symptom Timeline
              </h3>
              <div className="space-y-4 relative before:absolute before:left-5 before:top-2 before:bottom-2 before:w-0.5 before:bg-border">
                {triageRecords && triageRecords.length > 0 ? triageRecords.map((r, i) => (
                  <div key={r.id} className="relative pl-12">
                    <div className={cn(
                      "absolute left-0 top-1 w-10 h-10 rounded-full border-4 border-background flex items-center justify-center z-10",
                      r.assessmentResult === 'red' ? "bg-destructive text-white" : 
                      r.assessmentResult === 'yellow' ? "bg-primary text-primary-foreground" : "bg-green-500 text-white"
                    )}>
                      <Stethoscope className="h-4 w-4" />
                    </div>
                    <Card className="border-border bg-card/50 hover:bg-card transition-colors">
                      <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between space-y-0">
                        <CardTitle className="text-sm font-bold capitalize">
                          {r.assessmentResult} Severity
                        </CardTitle>
                        <time className="text-[10px] text-muted-foreground">
                          {new Date(r.assessmentDate?.toDate?.() || r.assessmentDate).toLocaleDateString()}
                        </time>
                      </CardHeader>
                      <CardContent className="p-4 pt-0">
                        <p className="text-sm text-muted-foreground mb-2 line-clamp-2 italic">"{r.symptomsInput}"</p>
                        <div className="text-xs bg-muted/50 p-2 rounded border-l-2 border-primary">
                          <span className="font-bold mr-1">AI Note:</span> {r.aiSummary || 'No AI insights for this session.'}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )) : (
                  <div className="pl-12 text-muted-foreground italic text-sm">No recent triage assessments recorded.</div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Context Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            <Card className="border-border bg-muted/30">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <UserIcon className="h-5 w-5 text-primary" />
                  Patient Profile
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase font-bold tracking-tighter">Blood Group</p>
                    <p className="font-medium text-foreground">{profile?.bloodGroup || 'Not set'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase font-bold tracking-tighter">ABHA ID</p>
                    <p className="font-medium text-foreground">{profile?.abhaId || 'Not linked'}</p>
                  </div>
                </div>
                <div className="pt-4 border-t border-border">
                  <p className="text-xs text-muted-foreground uppercase font-bold tracking-tighter mb-1">Chronic Conditions</p>
                  <p className="text-sm">{profile?.existingDiseases || 'None reported'}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase font-bold tracking-tighter mb-1">Known Allergies</p>
                  <p className="text-sm text-destructive font-medium">{profile?.allergies || 'No known allergies'}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase font-bold tracking-tighter mb-1">Active Medications</p>
                  <p className="text-sm">{profile?.medications || 'None'}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Activity className="h-5 w-5 text-primary" />
                  Live Vitals Placeholder
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center p-3 rounded-lg bg-background border border-border">
                  <span className="text-sm text-muted-foreground">Blood Pressure</span>
                  <span className="font-bold text-primary">120/80</span>
                </div>
                <div className="flex justify-between items-center p-3 rounded-lg bg-background border border-border">
                  <span className="text-sm text-muted-foreground">Heart Rate</span>
                  <span className="font-bold text-primary">72 bpm</span>
                </div>
                <div className="flex justify-between items-center p-3 rounded-lg bg-background border border-border">
                  <span className="text-sm text-muted-foreground">SpO2 (Latest)</span>
                  <span className="font-bold text-primary">98%</span>
                </div>
              </CardContent>
            </Card>

            <div className="p-6 bg-accent/5 border border-accent/20 rounded-2xl">
              <h4 className="font-bold text-accent flex items-center gap-2 mb-2 uppercase text-xs tracking-widest">
                <AlertCircle className="h-4 w-4" /> Medical Disclaimer
              </h4>
              <p className="text-[10px] text-muted-foreground leading-relaxed">
                This dashboard presents user-provided data only. AI summaries are intended to assist communication and do not constitute professional diagnosis or clinical advice.
              </p>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

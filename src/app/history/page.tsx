'use client';

import React, { useMemo } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  History, 
  Search, 
  Download, 
  Filter, 
  Loader2, 
  AlertCircle, 
  Stethoscope, 
  ShieldAlert, 
  Navigation,
  ArrowRight,
  Calendar
} from "lucide-react";
import { useUser, useFirestore, useMemoFirebase, useCollection } from "@/firebase";
import { collection, query, where, orderBy } from "firebase/firestore";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function UnifiedHistoryPage() {
  const { user } = useUser();
  const db = useFirestore();

  // Fetch Triage Assessments
  const triageQuery = useMemoFirebase(() => {
    if (!db || !user?.uid) return null;
    return query(
      collection(db, 'users', user.uid, 'triageAssessments'),
      orderBy('assessmentDate', 'desc')
    );
  }, [db, user?.uid]);

  // Fetch SOS Alerts
  const sosQuery = useMemoFirebase(() => {
    if (!db || !user?.uid) return null;
    return query(
      collection(db, 'sos_alerts'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );
  }, [db, user?.uid]);

  const { data: triageRecords, isLoading: isTriageLoading } = useCollection(triageQuery);
  const { data: sosRecords, isLoading: isSosLoading } = useCollection(sosQuery);

  // Combine and sort records for a unified clinical timeline
  const timeline = useMemo(() => {
    const combined = [
      ...(triageRecords || []).map(r => ({
        id: r.id,
        type: 'triage',
        date: r.assessmentDate?.toDate ? r.assessmentDate.toDate() : new Date(r.assessmentDate),
        title: "Symptom Triage Assessment",
        description: r.symptomsInput,
        severity: r.assessmentResult,
        aiSummary: r.aiSummary
      })),
      ...(sosRecords || []).map(r => ({
        id: r.id,
        type: 'sos',
        date: r.createdAt?.toDate ? r.createdAt.toDate() : new Date(r.createdAt),
        title: "EMERGENCY SOS TRIGGERED",
        description: `Alert status: ${r.status}`,
        location: `${r.locationLat.toFixed(2)}, ${r.locationLng.toFixed(2)}`
      }))
    ];

    return combined.sort((a, b) => b.date.getTime() - a.date.getTime());
  }, [triageRecords, sosRecords]);

  const getSeverityBadge = (severity: string) => {
    switch (severity?.toLowerCase()) {
      case 'red': 
      case 'emergency':
        return <Badge variant="destructive" className="uppercase text-[10px]">Critical</Badge>;
      case 'yellow':
      case 'hospital':
        return <Badge className="bg-primary text-primary-foreground uppercase text-[10px]">Urgent</Badge>;
      case 'green':
      case 'home care':
        return <Badge variant="outline" className="uppercase text-[10px] text-green-500 border-green-500">Monitor</Badge>;
      default: return <Badge variant="secondary" className="uppercase text-[10px]">Note</Badge>;
    }
  };

  if (isTriageLoading || isSosLoading) {
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
      <div className="max-w-4xl mx-auto space-y-8 pb-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-headline font-bold">Unified History</h1>
            <p className="text-muted-foreground">Clinical timeline of triage sessions, SOS alerts, and reports.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="gap-2"><Filter className="h-4 w-4" /> Filter</Button>
            <Button variant="outline" size="sm" className="gap-2"><Download className="h-4 w-4" /> Export All</Button>
          </div>
        </div>

        {timeline.length > 0 ? (
          <div className="relative space-y-8 before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
            {timeline.map((item, idx) => (
              <div key={item.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                {/* Icon Circle */}
                <div className="flex items-center justify-center w-10 h-10 rounded-full border border-border bg-card shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 group-hover:border-primary transition-colors">
                  {item.type === 'sos' ? (
                    <ShieldAlert className="h-5 w-5 text-destructive animate-pulse" />
                  ) : (
                    <Stethoscope className="h-5 w-5 text-primary" />
                  )}
                </div>

                {/* Content Card */}
                <Card className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 border-border bg-card hover:border-primary/50 transition-all shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <time className="text-xs font-mono text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {item.date.toLocaleDateString()} {item.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </time>
                    {item.severity && getSeverityBadge(item.severity)}
                  </div>
                  <h3 className={cn("font-bold mb-1", item.type === 'sos' ? "text-destructive" : "text-foreground")}>
                    {item.title}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                    {item.description}
                  </p>
                  
                  {item.aiSummary && (
                    <div className="bg-muted/50 p-2 rounded-lg text-xs mb-3 border-l-2 border-primary">
                      <span className="font-bold text-primary mr-1">AI:</span>
                      {item.aiSummary}
                    </div>
                  )}

                  <div className="flex items-center justify-between mt-auto">
                    {item.type === 'triage' ? (
                      <Button variant="link" className="p-0 h-auto text-xs text-primary" asChild>
                         <Link href={`/triage`}>View Assessment <ArrowRight className="ml-1 h-3 w-3" /></Link>
                      </Button>
                    ) : (
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Navigation className="h-3 w-3" /> {item.location}
                      </span>
                    )}
                  </div>
                </Card>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 border border-dashed border-border rounded-3xl">
            <History className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-xl font-bold">No Records Found</h3>
            <p className="text-muted-foreground mb-6">Complete a triage assessment or link your Patient ID to see your history.</p>
            <Button asChild className="bg-primary text-primary-foreground">
              <Link href="/triage">Start First Triage</Link>
            </Button>
          </div>
        )}

        <div className="pt-8 border-t border-border">
          <Card className="bg-primary/5 border-primary/20">
            <CardHeader className="flex flex-row items-center gap-4">
              <div className="p-3 bg-primary rounded-2xl text-primary-foreground">
                <FileText className="h-6 w-6" />
              </div>
              <div>
                <CardTitle>Medical Note Placeholder</CardTitle>
                <CardDescription>All clinical history is synced with your secure private cloud profile.</CardDescription>
              </div>
            </CardHeader>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}

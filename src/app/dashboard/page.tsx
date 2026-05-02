'use client';

import React from "react";
import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Stethoscope, 
  MapPin, 
  FileText, 
  ShieldCheck, 
  ArrowRight,
  Activity,
  Calendar,
  AlertCircle,
  Loader2,
  Presentation,
  HeartPulse
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { useUser, useFirestore, useMemoFirebase, useDoc } from "@/firebase";
import { doc } from "firebase/firestore";

export default function DashboardPage() {
  const { user, isUserLoading } = useUser();
  const db = useFirestore();
  
  const userDocRef = useMemoFirebase(() => {
    if (!db || !user?.uid) return null;
    return doc(db, 'users', user.uid);
  }, [db, user?.uid]);

  const { data: profile, isLoading: isProfileLoading } = useDoc(userDocRef);

  const heroImage = PlaceHolderImages.find(img => img.id === 'hero-bg');

  if (isUserLoading || isProfileLoading) {
    return (
      <AppShell>
        <div className="flex h-[60vh] w-full items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AppShell>
    );
  }

  const displayName = profile?.name || user?.email?.split('@')[0] || "Health Seeker";

  return (
    <AppShell>
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Welcome Section */}
        <div className="relative overflow-hidden rounded-3xl bg-card border border-primary/10 group shadow-2xl">
          <div className="absolute inset-0 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity">
            {heroImage && (
              <Image 
                src={heroImage.imageUrl} 
                alt={heroImage.description} 
                fill 
                className="object-cover"
                data-ai-hint={heroImage.imageHint}
              />
            )}
          </div>
          <div className="absolute top-0 right-0 p-8 opacity-20 pointer-events-none">
            <HeartPulse className="h-48 w-48 text-primary heartbeat" />
          </div>
          
          <div className="relative p-8 md:p-12 flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="space-y-6 max-w-xl text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-widest">
                <Activity className="h-3 w-3" />
                Your AI Healthcare Hub
              </div>
              <h1 className="text-3xl md:text-5xl font-headline font-bold text-foreground leading-tight">
                Welcome back, <span className="medical-gradient-text">{displayName}</span>
              </h1>
              <p className="text-muted-foreground text-lg leading-relaxed">
                Analyze your symptoms instantly or find clinical care near you with our intelligent healthcare navigator.
              </p>
              <div className="flex flex-wrap gap-4 pt-2 justify-center md:justify-start">
                <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-2xl px-8 shadow-xl shadow-primary/20">
                  <Link href="/triage" className="flex items-center gap-2">
                    <Stethoscope className="h-5 w-5" />
                    Start AI Triage
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="border-primary/30 hover:bg-primary/5 rounded-2xl px-8">
                  <Link href="/consultation" className="flex items-center gap-2">
                    <Presentation className="h-5 w-5" />
                    Consultation Mode
                  </Link>
                </Button>
              </div>
            </div>
            <div className="hidden lg:block w-72">
              <div className="glass-panel p-6 rounded-3xl border-primary/20">
                <div className="flex items-center gap-4 mb-4">
                  <div className="bg-destructive/10 rounded-2xl p-2.5">
                    <AlertCircle className="h-6 w-6 text-destructive" />
                  </div>
                  <span className="font-headline font-bold text-destructive">Quick SOS</span>
                </div>
                <p className="text-xs text-muted-foreground mb-6 leading-relaxed">Broadcast an emergency alert to your contact and clinical services.</p>
                <Button variant="destructive" asChild className="w-full font-bold h-12 rounded-xl shadow-lg shadow-destructive/20">
                  <Link href="/sos">ACTIVATE SOS</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Action Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="hover:border-primary/40 transition-all hover:shadow-2xl group border-white/5 bg-card/50 backdrop-blur-sm rounded-3xl">
            <CardHeader className="p-8 pb-4">
              <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <FileText className="h-7 w-7 text-primary" />
              </div>
              <CardTitle className="text-xl">Health Records</CardTitle>
              <CardDescription className="text-sm">Secure clinical profile & history.</CardDescription>
            </CardHeader>
            <CardContent className="px-8 pb-8">
              <div className="p-4 rounded-2xl bg-muted/40 border border-border/50 mb-6">
                 <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mb-1">Patient ID</p>
                 <p className="text-sm font-mono truncate">{profile?.abhaId || 'Not Linked'}</p>
              </div>
              <Button variant="link" asChild className="p-0 text-primary font-bold group-hover:translate-x-1 transition-transform">
                <Link href="/records">Manage Records <ArrowRight className="ml-1 h-4 w-4" /></Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:border-accent/40 transition-all hover:shadow-2xl group border-white/5 bg-card/50 backdrop-blur-sm rounded-3xl">
            <CardHeader className="p-8 pb-4">
              <div className="h-14 w-14 rounded-2xl bg-accent/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <ShieldCheck className="h-7 w-7 text-accent" />
              </div>
              <CardTitle className="text-xl">Preventive Analytics</CardTitle>
              <CardDescription className="text-sm">Personalized lifestyle risk insights.</CardDescription>
            </CardHeader>
            <CardContent className="px-8 pb-8">
              <div className="space-y-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">Wellness Score</span>
                  <span className="text-xs font-bold text-accent">Optimized</span>
                </div>
                <div className="h-1.5 w-full bg-accent/10 rounded-full overflow-hidden">
                  <div className="h-full bg-accent w-[75%] rounded-full" />
                </div>
              </div>
              <Button variant="link" asChild className="p-0 text-accent font-bold group-hover:translate-x-1 transition-transform">
                <Link href="/preventive">Run Analysis <ArrowRight className="ml-1 h-4 w-4" /></Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:border-primary/40 transition-all hover:shadow-2xl group border-white/5 bg-card/50 backdrop-blur-sm rounded-3xl">
            <CardHeader className="p-8 pb-4">
              <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Activity className="h-7 w-7 text-primary" />
              </div>
              <CardTitle className="text-xl">Vital Stats</CardTitle>
              <CardDescription className="text-sm">Latest clinical measurements.</CardDescription>
            </CardHeader>
            <CardContent className="px-8 pb-8">
              <div className="space-y-3 mb-6">
                <div className="flex justify-between items-center py-2 border-b border-border/50">
                  <span className="text-xs text-muted-foreground">Blood Pressure</span>
                  <span className="text-sm font-bold">120/80</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-xs text-muted-foreground">Heart Rate</span>
                  <span className="text-sm font-bold">72 bpm</span>
                </div>
              </div>
              <Button variant="link" className="p-0 text-primary font-bold group-hover:translate-x-1 transition-transform">
                All Vitals <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Unified History Link */}
        <div className="pt-4">
          <Link href="/history">
            <div className="p-6 rounded-3xl glass-panel border-primary/20 flex items-center justify-between group cursor-pointer hover:bg-primary/5 transition-colors">
              <div className="flex items-center gap-6">
                <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h4 className="font-bold text-lg">Clinical Timeline</h4>
                  <p className="text-sm text-muted-foreground">View your unified history of triage and SOS alerts.</p>
                </div>
              </div>
              <div className="h-10 w-10 rounded-full border border-border flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                <ArrowRight className="h-5 w-5" />
              </div>
            </div>
          </Link>
        </div>
      </div>
    </AppShell>
  );
}

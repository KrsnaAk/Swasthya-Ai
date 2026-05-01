
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
  Loader2
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
  const preventiveImage = PlaceHolderImages.find(img => img.id === 'health-checkup');

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
        <div className="relative overflow-hidden rounded-2xl bg-card border border-border group">
          <div className="absolute inset-0 opacity-10 group-hover:opacity-15 transition-opacity">
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
          <div className="relative p-8 md:p-12 flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="space-y-4 max-w-xl">
              <h1 className="text-3xl md:text-4xl font-headline font-bold text-foreground">
                Welcome back, <span className="text-primary">{displayName}</span>
              </h1>
              <p className="text-muted-foreground text-lg">
                Your health insights and healthcare navigator are ready. Start a triage or find nearby facilities.
              </p>
              <div className="flex flex-wrap gap-4 pt-2">
                <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold">
                  <Link href="/triage" className="flex items-center gap-2">
                    <Stethoscope className="h-5 w-5" />
                    Start AI Triage
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="border-primary text-primary hover:bg-primary/10">
                  <Link href="/facilities" className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Find Hospitals
                  </Link>
                </Button>
              </div>
            </div>
            <div className="hidden lg:block">
              <div className="bg-background/40 backdrop-blur-xl border border-white/10 p-6 rounded-2xl shadow-2xl">
                <div className="flex items-center gap-4 mb-4">
                  <div className="bg-accent rounded-full p-2">
                    <AlertCircle className="h-5 w-5 text-accent-foreground" />
                  </div>
                  <span className="font-headline font-semibold">Quick SOS</span>
                </div>
                <p className="text-sm text-muted-foreground mb-4">Call local emergency services immediately in case of severe distress.</p>
                <Button variant="destructive" className="w-full font-bold">CALL 102 / 108</Button>
              </div>
            </div>
          </div>
        </div>

        {/* Action Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="hover:border-primary/50 transition-all hover:shadow-lg group">
            <CardHeader>
              <FileText className="h-8 w-8 text-primary mb-2 group-hover:scale-110 transition-transform" />
              <CardTitle>Health Records (ABHA)</CardTitle>
              <CardDescription>Securely access and manage your medical history digitally.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-32 rounded-lg bg-muted flex items-center justify-center border border-dashed border-border mb-4">
                <div className="text-center p-4">
                  <span className="text-xs text-muted-foreground block mb-2">ABHA: {profile?.abhaId || 'Not Linked'}</span>
                  {!profile?.abhaId && <Button variant="outline" size="sm" asChild><Link href="/profile">Link Now</Link></Button>}
                </div>
              </div>
              <Button variant="link" asChild className="p-0 text-primary h-auto group-hover:translate-x-1 transition-transform">
                <Link href="/history">View History <ArrowRight className="ml-1 h-4 w-4" /></Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:border-primary/50 transition-all hover:shadow-lg group">
            <CardHeader>
              <ShieldCheck className="h-8 w-8 text-primary mb-2 group-hover:scale-110 transition-transform" />
              <CardTitle>Preventive Health</CardTitle>
              <CardDescription>Personalized tips based on your age ({profile?.age || '??'}) and profile.</CardDescription>
            </CardHeader>
            <CardContent>
              {preventiveImage && (
                <div className="relative h-32 w-full rounded-lg overflow-hidden mb-4">
                   <Image 
                    src={preventiveImage.imageUrl} 
                    alt={preventiveImage.description} 
                    fill 
                    className="object-cover"
                    data-ai-hint={preventiveImage.imageHint}
                  />
                </div>
              )}
              <Button variant="link" className="p-0 text-primary h-auto group-hover:translate-x-1 transition-transform">
                View Recommendations <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:border-primary/50 transition-all hover:shadow-lg group">
            <CardHeader>
              <Activity className="h-8 w-8 text-primary mb-2 group-hover:scale-110 transition-transform" />
              <CardTitle>Recent Vital Stats</CardTitle>
              <CardDescription>Track your fitness and health metrics.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center text-sm border-b border-border pb-2">
                <span className="text-muted-foreground">Heart Rate</span>
                <span className="font-semibold text-primary">72 bpm</span>
              </div>
              <div className="flex justify-between items-center text-sm border-b border-border pb-2">
                <span className="text-muted-foreground">Blood Pressure</span>
                <span className="font-semibold text-primary">120/80 mmHg</span>
              </div>
              <Button variant="link" className="p-0 text-primary h-auto group-hover:translate-x-1 transition-transform">
                View All Stats <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* History Preview (Static for now, but personalized context added) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-headline font-semibold">Triage History</h3>
            <Button variant="ghost" asChild>
              <Link href="/history">View All</Link>
            </Button>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 rounded-xl bg-card border border-border hover:border-primary/30 transition-colors">
              <div className="flex items-center gap-4">
                <div className="bg-secondary p-3 rounded-full">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-medium">No recent triage sessions</p>
                  <p className="text-xs text-muted-foreground">Start an assessment to see your history here.</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" asChild>
                <Link href="/triage"><ArrowRight className="h-4 w-4" /></Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

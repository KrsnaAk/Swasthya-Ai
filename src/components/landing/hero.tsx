'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Stethoscope, Sparkles, ShieldCheck, UserCog, Loader2 } from 'lucide-react';

export function LandingHero() {
  const { user, isUserLoading } = useUser();
  const db = useFirestore();
  const router = useRouter();

  const userDocRef = useMemoFirebase(() => {
    if (!db || !user?.uid) return null;
    return doc(db, 'users', user.uid);
  }, [db, user?.uid]);

  const { data: profile } = useDoc(userDocRef);

  const handleCitizenPortal = () => {
    if (isUserLoading) return;
    if (user) router.push('/dashboard');
    else router.push('/login');
  };

  const handleDoctorPortal = () => {
    if (isUserLoading) return;
    if (user && profile?.role === 'doctor') router.push('/doctor');
    else router.push('/doctor-auth');
  };

  const handleAdminPortal = () => {
    if (isUserLoading) return;
    if (user && profile?.role === 'admin') router.push('/admin');
    else router.push('/admin-auth');
  };

  return (
    <section className="relative pt-20 pb-16 md:pt-32 md:pb-32 overflow-hidden">
      <div className="container mx-auto px-6 relative">
        <div className="max-w-5xl mx-auto text-center space-y-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-bold uppercase tracking-wider animate-in fade-in slide-in-from-top-4 duration-700">
            <Sparkles className="h-4 w-4" />
            Agentic AI Healthcare Traffic Controller
          </div>

          {/* Title */}
          <h1 className="text-5xl md:text-7xl font-headline font-black text-white leading-tight animate-in fade-in slide-in-from-bottom-4 duration-700">
            The Future of <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent"> Clinical Intelligence
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
            Instant symptom triage, secure health records, and verified doctor consultations. 
            A unified ecosystem for citizens and healthcare professionals.
          </p>

          {/* Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-8 animate-in fade-in slide-in-from-bottom-10 duration-700 delay-300">
            <Button 
              size="lg" 
              onClick={handleCitizenPortal}
              disabled={isUserLoading}
              className="h-24 flex flex-col items-center justify-center gap-2 text-lg font-bold bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_30px_rgba(249,115,22,0.3)] rounded-3xl group"
            >
              {isUserLoading ? (
                <Loader2 className="animate-spin" />
              ) : (
                <>
                  <div className="flex items-center gap-2">
                    <Stethoscope className="h-6 w-6" />
                    Citizen Portal
                  </div>
                  <span className="text-[10px] uppercase tracking-widest opacity-80 font-black">AI Triage & Records</span>
                </>
              )}
            </Button>

            <Button 
              size="lg" 
              variant="outline"
              onClick={handleDoctorPortal}
              disabled={isUserLoading}
              className="h-24 flex flex-col items-center justify-center gap-2 text-lg font-bold border-white/10 bg-white/5 backdrop-blur-md hover:bg-white/10 rounded-3xl"
            >
              {isUserLoading ? (
                <Loader2 className="animate-spin" />
              ) : (
                <>
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-6 w-6 text-primary" />
                    Doctor Dashboard
                  </div>
                  <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-black">Verified Professionals</span>
                </>
              )}
            </Button>

            <Button 
              size="lg" 
              variant="ghost"
              onClick={handleAdminPortal}
              disabled={isUserLoading}
              className="h-24 flex flex-col items-center justify-center gap-2 text-lg font-bold hover:bg-white/5 rounded-3xl border border-dashed border-white/5"
            >
              {isUserLoading ? (
                <Loader2 className="animate-spin" />
              ) : (
                <>
                  <div className="flex items-center gap-2">
                    <UserCog className="h-6 w-6 text-muted-foreground" />
                    Admin Panel
                  </div>
                  <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-black">Facility Management</span>
                </>
              )}
            </Button>
          </div>

          {/* Animated Heartbeat Line Visual */}
          <div className="pt-20 opacity-30 select-none pointer-events-none">
            <svg viewBox="0 0 1000 100" className="w-full h-24 stroke-primary fill-none stroke-[2]">
              <path d="M0,50 L200,50 L220,20 L240,80 L260,10 L280,90 L300,50 L500,50 L520,30 L540,70 L560,50 L800,50 L820,10 L840,90 L860,40 L880,60 L900,50 L1000,50">
                <animate 
                  attributeName="stroke-dasharray" 
                  from="0,1000" 
                  to="1000,0" 
                  dur="3s" 
                  repeatCount="indefinite" 
                />
              </path>
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
}

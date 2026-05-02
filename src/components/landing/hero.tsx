
'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useUser } from '@/firebase';
import { ArrowRight, Stethoscope, Sparkles } from 'lucide-react';

export function LandingHero() {
  const { user } = useUser();
  const router = useRouter();

  const handleStartTriage = () => {
    if (user) {
      router.push('/triage');
    } else {
      router.push('/login');
    }
  };

  return (
    <section className="relative pt-20 pb-16 md:pt-32 md:pb-32 overflow-hidden">
      <div className="container mx-auto px-6 relative">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-bold uppercase tracking-wider animate-in fade-in slide-in-from-top-4 duration-700">
            <Sparkles className="h-4 w-4" />
            Voice-first • Multilingual • Works in Rural India
          </div>

          {/* Title */}
          <h1 className="text-5xl md:text-7xl font-headline font-black text-white leading-tight animate-in fade-in slide-in-from-bottom-4 duration-700">
            Agentic AI-Powered <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent"> Healthcare Assistant
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
            Get instant symptom-based triage, multilingual AI guidance, and smart healthcare routing — all within 60 seconds.
          </p>

          {/* Tagline */}
          <div className="text-primary font-bold text-lg tracking-widest uppercase opacity-80 animate-in fade-in duration-1000 delay-200">
            From symptoms → to decision → instantly.
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 animate-in fade-in slide-in-from-bottom-10 duration-700 delay-300">
            <Button 
              size="lg" 
              onClick={handleStartTriage}
              className="w-full sm:w-auto h-16 px-8 text-lg font-bold bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_30px_rgba(249,115,22,0.4)] group"
            >
              <Stethoscope className="mr-2 h-6 w-6" />
              Start Free Triage
              <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Button>
            {!user && (
              <Button 
                asChild
                variant="outline" 
                size="lg"
                className="w-full sm:w-auto h-16 px-8 text-lg font-bold border-white/10 bg-white/5 backdrop-blur-md hover:bg-white/10"
              >
                <Link href="/signup">Create Account</Link>
              </Button>
            )}
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

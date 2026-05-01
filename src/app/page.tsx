
'use client';

import React from 'react';
import { LandingNavbar } from '@/components/landing/navbar';
import { LandingHero } from '@/components/landing/hero';
import { LandingFeatures } from '@/components/landing/features';
import { LandingHowItWorks } from '@/components/landing/how-it-works';
import { LandingUseCases } from '@/components/landing/use-cases';
import { LandingAgenticAI } from '@/components/landing/agentic-ai';
import { LandingTrust } from '@/components/landing/trust-section';
import { LandingCTA } from '@/components/landing/cta-section';
import { LandingFooter } from '@/components/landing/footer';
import { LandingFuture } from '@/components/landing/future-vision';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/30">
      {/* Background glow effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent/10 rounded-full blur-[120px] animate-pulse delay-700" />
      </div>

      <LandingNavbar />
      
      <main className="relative z-10">
        <LandingHero />
        <LandingFeatures />
        <LandingHowItWorks />
        <LandingAgenticAI />
        <LandingUseCases />
        <LandingTrust />
        <LandingFuture />
        <LandingCTA />
      </main>

      <LandingFooter />

      {/* Floating Chatbot Icon (Visual Placeholder) */}
      <div className="fixed bottom-8 right-8 z-50">
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-primary to-accent rounded-full blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-pulse"></div>
          <button className="relative flex items-center justify-center w-14 h-14 bg-card rounded-full border border-white/10 shadow-2xl transition-transform hover:scale-110">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
          </button>
        </div>
      </div>
    </div>
  );
}

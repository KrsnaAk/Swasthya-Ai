'use client';

import React from 'react';
import { ShieldCheck, Lock, Globe, UserCheck, AlertCircle } from 'lucide-react';

export function LandingTrust() {
  return (
    <section id="safety" className="py-24">
      <div className="container mx-auto px-6">
        <div className="max-w-5xl mx-auto rounded-3xl bg-gradient-to-br from-white/10 to-transparent border border-white/10 overflow-hidden shadow-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-12">
            <div className="lg:col-span-7 p-12 space-y-8">
              <h2 className="text-3xl md:text-4xl font-headline font-black text-white">
                Safe, Reliable, and <br /><span className="text-primary">Privacy-First</span>
              </h2>
              
              <ul className="space-y-6">
                <li className="flex items-start gap-4">
                  <div className="mt-1 bg-green-500/10 p-1 rounded-full">
                    <ShieldCheck className="h-5 w-5 text-green-500" />
                  </div>
                  <p className="text-muted-foreground"><strong>No Diagnosis</strong> — We provide first-level triage guidance only, never disease diagnosis.</p>
                </li>
                <li className="flex items-start gap-4">
                  <div className="mt-1 bg-green-500/10 p-1 rounded-full">
                    <Lock className="h-5 w-5 text-green-500" />
                  </div>
                  <p className="text-muted-foreground"><strong>Secure Data Encryption</strong> — Your health data is encrypted at rest and in transit using industry-standard protocols.</p>
                </li>
                <li className="flex items-start gap-4">
                  <div className="mt-1 bg-green-500/10 p-1 rounded-full">
                    <UserCheck className="h-5 w-5 text-green-500" />
                  </div>
                  <p className="text-muted-foreground"><strong>User Consent</strong> — You control your data. It is shared only with verified clinical professionals.</p>
                </li>
                <li className="flex items-start gap-4">
                  <div className="mt-1 bg-green-500/10 p-1 rounded-full">
                    <Globe className="h-5 w-5 text-green-500" />
                  </div>
                  <p className="text-muted-foreground"><strong>Low-Connectivity Optimized</strong> — Built to work in varied network conditions across India.</p>
                </li>
              </ul>
            </div>

            <div className="lg:col-span-5 bg-primary/5 p-12 flex flex-col justify-center gap-6 border-l border-white/5">
              <div className="space-y-2">
                <h4 className="font-bold text-white text-lg">Infrastructure Security</h4>
                <div className="flex flex-wrap gap-2 pt-2">
                  <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs font-bold text-primary">SECURE</span>
                  <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs font-bold text-primary">TRUSTED CLOUD</span>
                  <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs font-bold text-primary">PRIVACY FOCUS</span>
                </div>
              </div>
              
              <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20">
                <h5 className="font-bold text-destructive text-sm flex items-center gap-2 mb-2">
                  <AlertCircle className="h-4 w-4" /> SAFETY DISCLAIMER
                </h5>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  This system provides first-level triage guidance only and does NOT diagnose diseases. Always consult a qualified medical professional. In emergencies, seek immediate medical help.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

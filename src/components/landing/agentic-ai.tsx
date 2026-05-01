
'use client';

import React from 'react';
import { BrainCircuit, Fingerprint, Route, Building2 } from 'lucide-react';

const agents = [
  { name: "Triage Agent", desc: "Detects clinical severity", icon: BrainCircuit },
  { name: "Explanation Agent", desc: "Explains results in plain language", icon: Fingerprint },
  { name: "Recommendation Agent", desc: "Suggests actionable next steps", icon: Route },
  { name: "Hospital Agent", desc: "Finds best care options nearby", icon: Building2 }
];

export function LandingAgenticAI() {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background visual */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          <div className="lg:w-1/2 space-y-8 text-center lg:text-left">
            <h2 className="text-4xl md:text-5xl font-headline font-black text-white leading-tight">
              Powered by <span className="text-primary">Agentic AI</span> — <br /> Not Just a Chatbot
            </h2>
            <p className="text-xl text-muted-foreground leading-relaxed">
              Our system uses multiple intelligent AI agents working together as a coordinated medical traffic controller.
            </p>
            <div className="p-6 rounded-2xl bg-primary/5 border border-primary/20">
              <p className="text-primary font-medium">
                "This ensures faster, safer, and more reliable healthcare decisions for every user, at every step."
              </p>
            </div>
          </div>

          <div className="lg:w-1/2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {agents.map((a, i) => (
                <div 
                  key={i} 
                  className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md hover:border-primary transition-all group"
                >
                  <a.icon className="h-8 w-8 text-primary mb-4 group-hover:scale-110 transition-transform" />
                  <h4 className="text-lg font-bold text-white mb-2">{a.name}</h4>
                  <p className="text-sm text-muted-foreground">{a.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

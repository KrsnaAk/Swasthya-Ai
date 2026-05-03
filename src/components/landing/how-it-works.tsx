'use client';

import React from 'react';
import { ArrowRight } from 'lucide-react';

const steps = [
  { title: "Enter Symptoms", desc: "Type or speak symptoms in your preferred language." },
  { title: "AI Analysis", desc: "Our system extracts key medical signals using NLP." },
  { title: "Severity Detection", desc: "Agentic AI classifies risk into Red, Yellow, or Green." },
  { title: "Smart Recommendation", desc: "Get clear guidance: home care, doctor, or emergency." },
  { title: "Hospital Routing", desc: "Find and navigate to the nearest healthcare facility." },
  { title: "Health Record Update", desc: "Your data is securely saved for future use." }
];

export function LandingHowItWorks() {
  return (
    <section id="how-it-works" className="py-24">
      <div className="container mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
          <h2 className="text-4xl md:text-5xl font-headline font-black text-foreground">
            From Symptoms to Solution in <br /><span className="text-primary">Under 60 Seconds</span>
          </h2>
        </div>

        <div className="relative">
          {/* Horizontal line for desktop */}
          <div className="hidden lg:block absolute top-12 left-0 w-full h-px bg-gradient-to-r from-transparent via-border to-transparent" />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8 relative z-10">
            {steps.map((s, i) => (
              <div key={i} className="space-y-6 group">
                <div className="relative">
                  <div className="h-12 w-12 rounded-full bg-background border-2 border-primary flex items-center justify-center font-black text-primary text-xl shadow-[0_0_15px_rgba(249,115,22,0.5)] group-hover:scale-110 transition-transform">
                    {i + 1}
                  </div>
                  {i < steps.length - 1 && (
                    <div className="hidden lg:block absolute top-1/2 -right-4 translate-x-1/2 -translate-y-1/2 text-muted-foreground/30">
                      <ArrowRight className="h-4 w-4" />
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <h4 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">{s.title}</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

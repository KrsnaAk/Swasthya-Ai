'use client';

import React from 'react';
import { 
  Stethoscope, 
  Mic, 
  Navigation, 
  MapPin, 
  FileHeart, 
  AlertCircle, 
  Activity, 
  ShieldCheck 
} from 'lucide-react';

const features = [
  {
    title: "AI Symptom Triage",
    desc: "Analyze symptoms instantly and classify severity (Red, Yellow, Green).",
    icon: Stethoscope
  },
  {
    title: "Voice & Multilingual Input",
    desc: "Speak your symptoms in Hindi or regional languages — no typing needed.",
    icon: Mic
  },
  {
    title: "Smart Healthcare Routing",
    desc: "Get guided to home care, clinic, or emergency within seconds.",
    icon: Navigation
  },
  {
    title: "Real-Time Hospital Finder",
    desc: "Locate nearest hospitals and clinics with instant navigation.",
    icon: MapPin
  },
  {
    title: "Digital Health Records",
    desc: "Store and access your medical history securely with clinical synchronization.",
    icon: FileHeart
  },
  {
    title: "Emergency SOS System",
    desc: "Trigger instant alerts and access emergency support when needed.",
    icon: AlertCircle
  },
  {
    title: "Preventive Health Insights",
    desc: "Get early risk insights for diabetes, cardiac issues, and lifestyle factors.",
    icon: Activity
  },
  {
    title: "Explainable AI Decisions",
    desc: "Understand WHY a decision was made — transparency for better care.",
    icon: ShieldCheck
  }
];

export function LandingFeatures() {
  return (
    <section id="features" className="py-24 bg-card/30 border-y border-white/5">
      <div className="container mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <h2 className="text-4xl md:text-5xl font-headline font-black text-white">
            Powerful AI Features Designed <br /> for <span className="text-primary">Real-World</span> Healthcare
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f, i) => (
            <div 
              key={i} 
              className="group p-8 rounded-2xl bg-white/5 border border-white/10 hover:border-primary/50 transition-all duration-300 relative overflow-hidden"
            >
              {/* Glow effect on hover */}
              <div className="absolute -inset-px bg-gradient-to-br from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
              
              <div className="relative z-10 space-y-4">
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                  <f.icon className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-headline font-bold text-white group-hover:text-primary transition-colors">
                  {f.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {f.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

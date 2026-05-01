
'use client';

import React from 'react';
import { 
  Trees, 
  Siren, 
  Video, 
  HeartPulse, 
  BarChart3, 
  Activity 
} from 'lucide-react';

const cases = [
  {
    title: "Rural Healthcare",
    desc: "Get instant medical guidance even without nearby doctors.",
    icon: Trees
  },
  {
    title: "Emergency Pre-Screening",
    desc: "Detect critical symptoms like chest pain instantly.",
    icon: Siren
  },
  {
    title: "Telemedicine Support",
    desc: "Provide structured patient data before doctor consultation.",
    icon: Video
  },
  {
    title: "Preventive Healthcare",
    desc: "Identify health risks early based on lifestyle and history.",
    icon: Activity
  },
  {
    title: "Hospital Load Reduction",
    desc: "Redirect non-emergency cases to appropriate home care.",
    icon: HeartPulse
  },
  {
    title: "Public Health Monitoring",
    desc: "Help detect regional disease trends using anonymized data.",
    icon: BarChart3
  }
];

export function LandingUseCases() {
  return (
    <section className="py-24 bg-card/20">
      <div className="container mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <h2 className="text-4xl md:text-5xl font-headline font-black text-white">
            Built for Every Citizen, <span className="text-primary">Everywhere</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {cases.map((c, i) => (
            <div key={i} className="flex gap-6 p-6 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors group">
              <div className="h-14 w-14 shrink-0 rounded-xl bg-white/5 flex items-center justify-center text-primary group-hover:bg-primary/20 transition-colors">
                <c.icon className="h-7 w-7" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-white">{c.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{c.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

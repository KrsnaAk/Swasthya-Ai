
'use client';

import React from 'react';
import { Watch, Video, LineChart, Building } from 'lucide-react';

const visions = [
  { title: "Wearable Integration", desc: "Sync real-time vitals for proactive monitoring.", icon: Watch },
  { title: "Live Consultations", desc: "Instant video sessions with verified specialists.", icon: Video },
  { title: "Predictive Analytics", desc: "Disease prediction using longitudinal history.", icon: LineChart },
  { title: "Govt. Integration", desc: "Deep synchronization with ABHA & Ayushman Bharat.", icon: Building }
];

export function LandingFuture() {
  return (
    <section className="py-24">
      <div className="container mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <h2 className="text-4xl md:text-5xl font-headline font-black text-white">
            Building the Future of <br /><span className="text-primary">Healthcare in India</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {visions.map((v, i) => (
            <div key={i} className="text-center space-y-4">
              <div className="mx-auto h-16 w-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                <v.icon className="h-8 w-8" />
              </div>
              <h4 className="text-lg font-bold text-white">{v.title}</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">{v.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

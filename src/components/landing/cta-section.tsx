
'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useUser } from '@/firebase';
import { ArrowRight, Stethoscope } from 'lucide-react';

export function LandingCTA() {
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
    <section className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-primary/5 -z-10" />
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto text-center space-y-8 p-12 md:p-20 rounded-3xl bg-card border border-primary/20 relative">
          <div className="absolute -top-10 -left-10 w-40 h-40 bg-primary/10 rounded-full blur-[80px]" />
          <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-accent/10 rounded-full blur-[80px]" />
          
          <h2 className="text-4xl md:text-5xl font-headline font-black text-white">
            Get Instant Healthcare <br /> Guidance — <span className="text-primary">Anytime, Anywhere</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Don’t wait in uncertainty. Let agentic AI guide you to the right care in seconds.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Button 
              size="lg" 
              onClick={handleStartTriage}
              className="w-full sm:w-auto h-16 px-10 text-lg font-bold bg-primary text-primary-foreground hover:bg-primary/90 group"
            >
              <Stethoscope className="mr-2 h-6 w-6" />
              Start Free Triage
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            {!user && (
              <Button 
                asChild
                variant="outline" 
                size="lg" 
                className="w-full sm:w-auto h-16 px-10 text-lg font-bold border-white/10 hover:bg-white/5"
              >
                <Link href="/signup">Create Account</Link>
              </Button>
            )}
          </div>
          
          <div className="text-sm text-muted-foreground font-medium pt-2">
            Works in 10+ Indian languages • Instant Assessment • No Diagnosis
          </div>
        </div>
      </div>
    </section>
  );
}

'use client';

import React from 'react';
import Link from 'next/link';
import { HeartPulse, Github, Twitter, Linkedin, AlertCircle } from 'lucide-react';

export function LandingFooter() {
  return (
    <footer className="py-20 border-t border-border bg-background relative z-10">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1 md:col-span-2 space-y-6">
            <div className="flex items-center gap-2">
              <div className="bg-primary rounded-lg p-1.5">
                <HeartPulse className="h-6 w-6 text-primary-foreground" />
              </div>
              <span className="font-headline font-bold text-2xl tracking-tight text-foreground">
                Swasthya<span className="text-primary">AI</span>
              </span>
            </div>
            <p className="text-muted-foreground max-w-sm leading-relaxed font-medium">
              Agentic AI-powered healthcare Assistant providing instant triage, multilingual guidance, and smart routing for every citizen.
            </p>
            <div className="flex gap-4">
              <Link href="#" className="h-10 w-10 rounded-lg bg-card border border-border flex items-center justify-center text-muted-foreground hover:text-primary transition-colors">
                <Twitter className="h-5 w-5" />
              </Link>
              <Link href="#" className="h-10 w-10 rounded-lg bg-card border border-border flex items-center justify-center text-muted-foreground hover:text-primary transition-colors">
                <Linkedin className="h-5 w-5" />
              </Link>
              <Link href="#" className="h-10 w-10 rounded-lg bg-card border border-border flex items-center justify-center text-muted-foreground hover:text-primary transition-colors">
                <Github className="h-5 w-5" />
              </Link>
            </div>
          </div>

          <div>
            <h4 className="font-bold text-foreground mb-6">Product</h4>
            <ul className="space-y-4 text-sm text-muted-foreground font-medium">
              <li><Link href="/triage" className="hover:text-primary transition-colors">AI Triage</Link></li>
              <li><Link href="/facilities" className="hover:text-primary transition-colors">Facility Finder</Link></li>
              <li><Link href="/sos" className="hover:text-primary transition-colors">Emergency SOS</Link></li>
              <li><Link href="/preventive" className="hover:text-primary transition-colors">Preventive Analytics</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-foreground mb-6">Company</h4>
            <ul className="space-y-4 text-sm text-muted-foreground font-medium">
              <li><Link href="#safety" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
              <li><Link href="#safety" className="hover:text-primary transition-colors">Terms of Service</Link></li>
              <li><Link href="#safety" className="hover:text-primary transition-colors">Safety Guidelines</Link></li>
              <li><Link href="/public-health" className="hover:text-primary transition-colors">Public Health Trends</Link></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-border space-y-8">
          <div className="p-6 rounded-2xl bg-destructive/5 border border-destructive/10">
            <p className="text-xs text-muted-foreground leading-relaxed text-center italic font-medium">
              <AlertCircle className="h-4 w-4 inline mr-1 text-destructive" />
              <strong className="text-foreground">Medical Disclaimer:</strong> This platform provides first-level triage guidance only and does NOT diagnose diseases or provide medical treatment. Always consult a qualified medical professional for any health concerns. In case of emergency, contact local emergency services immediately (108/102).
            </p>
          </div>
          <div className="text-center text-xs text-muted-foreground font-bold uppercase tracking-widest">
            &copy; {new Date().getFullYear()} Swasthya AI. Built for the future of healthcare.
          </div>
        </div>
      </div>
    </footer>
  );
}

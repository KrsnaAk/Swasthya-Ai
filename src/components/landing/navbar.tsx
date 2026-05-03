'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { HeartPulse } from 'lucide-react';
import { useUser } from '@/firebase';
import { ThemeToggle } from '@/components/ThemeToggle';

export function LandingNavbar() {
  const { user } = useUser();

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/40 backdrop-blur-2xl">
      <div className="container mx-auto flex h-20 items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="bg-primary rounded-xl p-2 transition-all group-hover:scale-110 shadow-lg shadow-primary/20 heartbeat">
            <HeartPulse className="h-6 w-6 text-primary-foreground" />
          </div>
          <div className="flex flex-col">
            <span className="font-headline font-bold text-2xl tracking-tighter text-foreground group-hover:text-primary transition-colors">
              Swasthya<span className="text-primary">AI</span>
            </span>
            <span className="text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground opacity-70">Clinical Intelligence</span>
          </div>
        </Link>

        <div className="hidden md:flex items-center gap-10 text-xs font-black uppercase tracking-widest text-muted-foreground">
          <Link href="#features" className="hover:text-primary transition-all hover:translate-y-[-1px]">Features</Link>
          <Link href="#how-it-works" className="hover:text-primary transition-all hover:translate-y-[-1px]">How it Works</Link>
          <Link href="#safety" className="hover:text-primary transition-all hover:translate-y-[-1px]">Protocol</Link>
        </div>

        <div className="flex items-center gap-4">
          <ThemeToggle />
          {user ? (
            <Button asChild variant="secondary" className="font-black uppercase text-xs tracking-widest rounded-xl px-6 h-11 border border-border shadow-xl">
              <Link href="/dashboard">Portal Dashboard</Link>
            </Button>
          ) : (
            <>
              <Button asChild variant="ghost" className="hidden sm:inline-flex text-xs font-black uppercase tracking-widest text-muted-foreground hover:text-primary">
                <Link href="/login">Login</Link>
              </Button>
              <Button asChild className="bg-primary text-primary-foreground font-black uppercase text-xs tracking-widest shadow-xl shadow-primary/20 rounded-xl px-8 h-11">
                <Link href="/signup">Access Portal</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}


'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { HeartPulse } from 'lucide-react';
import { useUser } from '@/firebase';

export function LandingNavbar() {
  const { user } = useUser();

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-white/5 bg-background/60 backdrop-blur-xl">
      <div className="container mx-auto flex h-20 items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="bg-primary rounded-lg p-1.5 transition-transform group-hover:scale-110">
            <HeartPulse className="h-6 w-6 text-primary-foreground" />
          </div>
          <span className="font-headline font-bold text-2xl tracking-tight text-white">
            Swasthya<span className="text-primary">AI</span>
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
          <Link href="#features" className="hover:text-primary transition-colors">Features</Link>
          <Link href="#how-it-works" className="hover:text-primary transition-colors">How it Works</Link>
          <Link href="#safety" className="hover:text-primary transition-colors">Safety</Link>
        </div>

        <div className="flex items-center gap-4">
          {user ? (
            <Button asChild variant="secondary" className="font-bold">
              <Link href="/dashboard">Dashboard</Link>
            </Button>
          ) : (
            <>
              <Button asChild variant="ghost" className="hidden sm:inline-flex">
                <Link href="/login">Login</Link>
              </Button>
              <Button asChild className="bg-primary text-primary-foreground font-bold shadow-[0_0_15px_rgba(249,115,22,0.3)]">
                <Link href="/signup">Sign Up</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

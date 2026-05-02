
'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Bot, Sparkles, Activity } from 'lucide-react';
import { ChatbotPanel } from './ChatbotPanel';

export function ChatbotButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div className="fixed bottom-8 right-8 z-50">
        <div className="relative group">
          {/* Medical Pulse Glow */}
          <div className="absolute -inset-2 bg-gradient-to-r from-primary via-accent to-primary rounded-full blur-xl opacity-30 group-hover:opacity-60 transition duration-1000 group-hover:duration-200 animate-pulse"></div>
          
          <Button
            size="lg"
            className="relative h-16 w-16 rounded-3xl bg-card border-2 border-primary/20 shadow-2xl flex flex-col items-center justify-center gap-0 group hover:border-primary transition-all duration-500 overflow-hidden"
            onClick={() => setIsOpen(!isOpen)}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <Bot className="h-7 w-7 text-primary group-hover:scale-110 transition-transform relative z-10" />
            <div className="flex items-center gap-1 mt-1 relative z-10">
               <Activity className="h-2 w-2 text-primary animate-pulse" />
               <span className="text-[9px] font-black tracking-widest uppercase text-primary/80">AI Guide</span>
            </div>
            <Sparkles className="absolute top-2 right-2 h-3 w-3 text-primary animate-pulse" />
          </Button>
        </div>
      </div>

      {isOpen && <ChatbotPanel onClose={() => setIsOpen(false)} />}
    </>
  );
}

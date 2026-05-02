
'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Bot, MessageCircle, Sparkles } from 'lucide-react';
import { ChatbotPanel } from './ChatbotPanel';

export function ChatbotButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div className="fixed bottom-8 right-8 z-50">
        <div className="relative group">
          {/* Animated glow */}
          <div className="absolute -inset-1.5 bg-gradient-to-r from-primary via-accent to-primary rounded-full blur opacity-40 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-pulse"></div>
          
          <Button
            size="lg"
            className="relative h-16 w-16 rounded-full bg-card border-2 border-primary/20 shadow-2xl flex flex-col items-center justify-center gap-0 group hover:border-primary transition-all duration-300"
            onClick={() => setIsOpen(!isOpen)}
          >
            <Bot className="h-7 w-7 text-primary group-hover:scale-110 transition-transform" />
            <Sparkles className="absolute -top-1 -right-1 h-4 w-4 text-primary animate-pulse" />
            <span className="text-[9px] font-black tracking-tighter uppercase mt-1 text-primary">Assistant</span>
          </Button>
        </div>
      </div>

      {isOpen && <ChatbotPanel onClose={() => setIsOpen(false)} />}
    </>
  );
}

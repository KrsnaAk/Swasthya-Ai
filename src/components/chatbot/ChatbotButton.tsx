
'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Bot, Sparkles, Activity } from 'lucide-react';
import { ChatbotPanel } from './ChatbotPanel';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export function ChatbotButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div className="fixed bottom-8 right-8 z-50">
        <div className="relative group">
          {/* High-Intensity Glow Effect */}
          <div className="absolute -inset-4 bg-gradient-to-r from-[#7C3AED] to-[#2563EB] rounded-full blur-2xl opacity-40 group-hover:opacity-70 transition duration-1000 group-hover:duration-200 animate-pulse"></div>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="lg"
                  className="relative h-16 w-auto px-6 rounded-2xl bg-gradient-to-r from-[#7C3AED] to-[#2563EB] border-2 border-white/30 shadow-[0_0_40px_rgba(124,58,237,0.5)] flex items-center justify-center gap-3 group hover:scale-105 active:scale-95 transition-all duration-300 overflow-hidden ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  onClick={() => setIsOpen(!isOpen)}
                >
                  {/* Glass Shimmer Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  
                  {/* Icon with Animation */}
                  <Bot className="h-7 w-7 text-white group-hover:rotate-12 transition-transform relative z-10 drop-shadow-md" />
                  
                  {/* Label Group */}
                  <div className="flex flex-col items-start relative z-10">
                    <span className="text-white text-[11px] font-black uppercase tracking-[0.15em] leading-none drop-shadow-sm">
                      Swasthya
                    </span>
                    <div className="flex items-center gap-1.5 mt-0.5">
                       <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse shadow-[0_0_5px_#4ade80]" />
                       <span className="text-[12px] font-bold text-white tracking-tight">AI Assistant</span>
                    </div>
                  </div>

                  {/* Floating Sparkle Elements */}
                  <Sparkles className="absolute -top-1 -right-1 h-5 w-5 text-white/40 animate-pulse" />
                  <Activity className="absolute bottom-1 right-2 h-3 w-3 text-white/20" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="left" className="bg-card text-foreground border-border shadow-xl">
                <p className="font-bold">Open AI Assistant</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {isOpen && <ChatbotPanel onClose={() => setIsOpen(false)} />}
    </>
  );
}

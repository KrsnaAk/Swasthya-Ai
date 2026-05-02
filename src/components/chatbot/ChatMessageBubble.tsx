
import React from 'react';
import { cn } from '@/lib/utils';
import { ChatMessage } from '@/lib/chatbot/types';
import { ShieldAlert, AlertTriangle, CheckCircle2, User, Bot } from 'lucide-react';

interface ChatMessageBubbleProps {
  message: ChatMessage;
}

export function ChatMessageBubble({ message }: ChatMessageBubbleProps) {
  const isUser = message.role === 'user';

  return (
    <div className={cn("flex w-full mb-4 gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300", isUser ? "flex-row-reverse" : "flex-row")}>
      <div className={cn(
        "flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-lg border shadow-sm",
        isUser ? "bg-primary border-primary/20 text-primary-foreground" : "bg-muted border-border"
      )}>
        {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
      </div>
      
      <div className={cn(
        "max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-sm",
        isUser 
          ? "bg-primary text-primary-foreground rounded-tr-none" 
          : "bg-muted/80 backdrop-blur-sm border border-border/50 text-foreground rounded-tl-none"
      )}>
        {message.type === 'triage_result' ? (
          <TriageResultCard result={message.data} />
        ) : (
          <div className="whitespace-pre-wrap leading-relaxed">
            {message.content}
          </div>
        )}
        <div className={cn("text-[10px] mt-1 opacity-50 font-medium", isUser ? "text-right" : "text-left")}>
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </div>
  );
}

function TriageResultCard({ result }: { result: any }) {
  const isRed = result.severity === 'RED';
  const isYellow = result.severity === 'YELLOW';

  return (
    <div className="space-y-4 min-w-[280px]">
      <div className={cn(
        "flex items-center gap-3 p-3 rounded-xl border-2",
        isRed ? "bg-destructive/10 border-destructive text-destructive" :
        isYellow ? "bg-primary/10 border-primary text-primary" : "bg-green-500/10 border-green-500 text-green-500"
      )}>
        {isRed ? <ShieldAlert className="h-6 w-6" /> : isYellow ? <AlertTriangle className="h-6 w-6" /> : <CheckCircle2 className="h-6 w-6" />}
        <span className="font-bold text-base uppercase tracking-tight">{result.title}</span>
      </div>

      <div className="space-y-3 text-foreground">
        <div>
          <p className="font-bold text-xs uppercase opacity-60 mb-1">Why this status?</p>
          <p className="text-sm italic">"{result.explanation}"</p>
        </div>

        {result.aiInsights && (
          <div className="p-3 bg-background/50 rounded-lg border border-border/50 space-y-2">
             <p className="text-xs font-bold text-primary flex items-center gap-1 uppercase">
               <Bot className="h-3 w-3" /> AI Summary
             </p>
             <p className="text-xs leading-normal">{result.aiInsights.friendlyExplanation}</p>
          </div>
        )}

        <div>
          <p className="font-bold text-xs uppercase opacity-60 mb-1">Recommended Action</p>
          <p className="text-sm font-medium">{result.recommendation}</p>
        </div>

        <div className="text-[10px] text-muted-foreground bg-muted p-2 rounded border border-border/30 italic">
          {result.disclaimer}
        </div>
      </div>
    </div>
  );
}

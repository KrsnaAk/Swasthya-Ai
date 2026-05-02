import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { ChatMessage } from '@/lib/chatbot/types';
import { ShieldAlert, AlertTriangle, CheckCircle2, User, Bot, Volume2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { generateSpeech } from '@/ai/flows/tts-flow';

interface ChatMessageBubbleProps {
  message: ChatMessage;
  language?: 'en' | 'hi';
}

export function ChatMessageBubble({ message, language = 'en' }: ChatMessageBubbleProps) {
  const isUser = message.role === 'user';
  const [isPlaying, setIsPlaying] = useState(false);

  const handlePlayVoice = async () => {
    if (isPlaying) return;
    setIsPlaying(true);
    try {
      const textToSpeak = message.type === 'triage_result' 
        ? `${message.data.title}. ${message.data.explanation}. ${message.data.recommendation}`
        : message.content;
      
      const audioDataUri = await generateSpeech({ text: textToSpeak, language });
      const audio = new Audio(audioDataUri);
      audio.onended = () => setIsPlaying(false);
      audio.play();
    } catch (e) {
      console.error('Speech playback failed', e);
      setIsPlaying(false);
    }
  };

  return (
    <div className={cn("flex w-full mb-4 gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300", isUser ? "flex-row-reverse" : "flex-row")}>
      <div className={cn(
        "flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-lg border shadow-sm",
        isUser ? "bg-primary border-primary/20 text-primary-foreground" : "bg-muted border-border"
      )}>
        {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
      </div>
      
      <div className={cn(
        "max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-sm relative group",
        isUser 
          ? "bg-primary text-primary-foreground rounded-tr-none" 
          : "bg-muted/80 backdrop-blur-sm border border-border/50 text-foreground rounded-tl-none"
      )}>
        {!isUser && (
          <Button 
            variant="ghost" 
            size="icon" 
            className="absolute -right-10 top-0 opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 text-muted-foreground hover:text-primary"
            onClick={handlePlayVoice}
          >
            {isPlaying ? <Loader2 className="h-4 w-4 animate-spin" /> : <Volume2 className="h-4 w-4" />}
          </Button>
        )}

        {message.type === 'triage_result' ? (
          <TriageResultCard result={message.data} language={language} />
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

function TriageResultCard({ result, language }: { result: any, language: string }) {
  const isRed = result.severity === 'RED';
  const isYellow = result.severity === 'YELLOW';
  const labels = {
    why: language === 'hi' ? 'यह स्थिति क्यों है?' : 'Why this status?',
    action: language === 'hi' ? 'अनुशंसित कार्रवाई' : 'Recommended Action',
    ai: language === 'hi' ? 'AI सारांश' : 'AI Summary'
  };

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
          <p className="font-bold text-xs uppercase opacity-60 mb-1">{labels.why}</p>
          <p className="text-sm italic">"{result.explanation}"</p>
        </div>

        {result.aiInsights && (
          <div className="p-3 bg-background/50 rounded-lg border border-border/50 space-y-2">
             <p className="text-xs font-bold text-primary flex items-center gap-1 uppercase">
               <Bot className="h-3 w-3" /> {labels.ai}
             </p>
             <p className="text-xs leading-normal">{result.aiInsights.friendlyExplanation}</p>
          </div>
        )}

        <div>
          <p className="font-bold text-xs uppercase opacity-60 mb-1">{labels.action}</p>
          <p className="text-sm font-medium">{result.recommendation}</p>
        </div>

        <div className="text-[10px] text-muted-foreground bg-muted p-2 rounded border border-border/30 italic">
          {result.disclaimer}
        </div>
      </div>
    </div>
  );
}
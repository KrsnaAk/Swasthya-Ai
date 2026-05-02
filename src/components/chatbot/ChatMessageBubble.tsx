
import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { ChatMessage } from '@/lib/chatbot/types';
import { ShieldAlert, AlertTriangle, CheckCircle2, User, Bot, Volume2, Loader2, Activity } from 'lucide-react';
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
    <div className={cn("flex w-full mb-6 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500", isUser ? "flex-row-reverse" : "flex-row")}>
      <div className={cn(
        "flex h-10 w-10 shrink-0 select-none items-center justify-center rounded-2xl border shadow-lg transition-transform hover:scale-110",
        isUser ? "bg-primary border-primary/20 text-primary-foreground" : "bg-card border-white/5"
      )}>
        {isUser ? <User className="h-5 w-5" /> : <Bot className="h-5 w-5 text-primary" />}
      </div>
      
      <div className={cn(
        "max-w-[80%] rounded-[1.5rem] px-5 py-4 text-sm shadow-xl relative group border transition-all",
        isUser 
          ? "bg-primary text-primary-foreground border-primary/20 rounded-tr-none" 
          : "bg-card/50 backdrop-blur-md border-white/10 text-foreground rounded-tl-none hover:bg-card/80"
      )}>
        {!isUser && (
          <Button 
            variant="ghost" 
            size="icon" 
            className="absolute -right-12 top-0 opacity-0 group-hover:opacity-100 transition-opacity h-10 w-10 text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-full"
            onClick={handlePlayVoice}
          >
            {isPlaying ? <Loader2 className="h-5 w-5 animate-spin text-primary" /> : <Volume2 className="h-5 w-5" />}
          </Button>
        )}

        {message.type === 'triage_result' ? (
          <TriageResultCard result={message.data} language={language} />
        ) : (
          <div className="whitespace-pre-wrap leading-relaxed font-medium">
            {message.content}
          </div>
        )}
        <div className={cn("text-[9px] mt-2 opacity-40 font-black tracking-widest uppercase", isUser ? "text-right" : "text-left")}>
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
    why: language === 'hi' ? 'कारण' : 'Clinical Rationale',
    action: language === 'hi' ? 'अगला कदम' : 'Protocol Directive',
    ai: language === 'hi' ? 'AI विश्लेषण' : 'Pathological Insights'
  };

  return (
    <div className="space-y-6 min-w-[280px]">
      <div className={cn(
        "flex items-center gap-4 p-4 rounded-2xl border-2 shadow-inner",
        isRed ? "bg-destructive/10 border-destructive text-destructive" :
        isYellow ? "bg-warning/10 border-warning text-warning" : "bg-green-500/10 border-green-500 text-green-500"
      )}>
        <div className="bg-background/20 p-2.5 rounded-xl shadow-lg">
          {isRed ? <ShieldAlert className="h-6 w-6" /> : isYellow ? <AlertTriangle className="h-6 w-6" /> : <CheckCircle2 className="h-6 w-6" />}
        </div>
        <span className="font-black text-base uppercase tracking-tight leading-tight">{result.title}</span>
      </div>

      <div className="space-y-5 text-foreground">
        <div>
          <p className="font-black text-[9px] uppercase opacity-60 tracking-widest mb-2 flex items-center gap-1">
             <Activity className="h-3 w-3" /> {labels.why}
          </p>
          <p className="text-sm font-medium leading-relaxed bg-muted/30 p-3 rounded-xl border border-white/5">"{result.explanation}"</p>
        </div>

        {result.aiInsights && (
          <div className="p-4 bg-primary/5 rounded-2xl border border-primary/20 space-y-3 relative overflow-hidden">
             <div className="absolute top-0 right-0 p-2 opacity-10">
                <Bot className="h-10 w-10" />
             </div>
             <p className="text-[10px] font-black text-primary flex items-center gap-1 uppercase tracking-widest">
               <Activity className="h-3 w-3" /> {labels.ai}
             </p>
             <p className="text-xs leading-normal font-medium text-foreground/80">{result.aiInsights.friendlyExplanation}</p>
          </div>
        )}

        <div>
          <p className="font-black text-[9px] uppercase opacity-60 tracking-widest mb-2">{labels.action}</p>
          <p className="text-sm font-black text-primary leading-relaxed bg-primary/5 p-3 rounded-xl border border-primary/20">{result.recommendation}</p>
        </div>

        <div className="text-[9px] text-muted-foreground bg-muted/40 p-3 rounded-xl border border-white/5 italic leading-relaxed">
          {result.disclaimer}
        </div>
      </div>
    </div>
  );
}


'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChatMessage, ChatTriageSession } from '@/lib/chatbot/types';
import { ChatMessageBubble } from './ChatMessageBubble';
import { TypingIndicator } from './TypingIndicator';
import { 
  X, 
  Send, 
  Mic, 
  History, 
  Building2, 
  ShieldAlert, 
  Stethoscope, 
  FileText,
  ChevronDown,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc, collection, serverTimestamp } from 'firebase/firestore';
import { addDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { assessSymptoms } from '@/lib/triage-engine';
import { enhanceChatbotResult } from '@/ai/flows/chatbot-enhancement-flow';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface ChatbotPanelProps {
  onClose: () => void;
}

export function ChatbotPanel({ onClose }: ChatbotPanelProps) {
  const { user } = useUser();
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  const scrollRef = useRef<HTMLDivElement>(null);

  const userDocRef = useMemoFirebase(() => {
    if (!db || !user?.uid) return null;
    return doc(db, 'users', user.uid);
  }, [db, user?.uid]);
  const { data: profile } = useDoc(userDocRef);

  const [messages, setMessages] = useState<ChatMessage[]>([
    { 
      id: '1', 
      role: 'bot', 
      content: `Hello! I'm your SwasthyaAI Healthcare Assistant. How can I help you today?`, 
      timestamp: new Date() 
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [inputText, setInputText] = useState('');
  
  // Triage state machine
  const [triageStep, setTriageStep] = useState<number | null>(null);
  const [session, setSession] = useState<Partial<ChatTriageSession>>({});

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const addMessage = (msg: Omit<ChatMessage, 'id' | 'timestamp'>) => {
    setMessages(prev => [...prev, {
      ...msg,
      id: Date.now().toString(),
      timestamp: new Date()
    }]);
  };

  const botReply = async (content: string, type: ChatMessage['type'] = 'text', data?: any) => {
    setIsTyping(true);
    await new Promise(r => setTimeout(r, 1000));
    addMessage({ role: 'bot', content, type, data });
    setIsTyping(false);
  };

  const handleSend = async (text: string = inputText) => {
    if (!text.trim() && triageStep === null) return;
    
    const userText = text.trim();
    if (userText) {
      addMessage({ role: 'user', content: userText });
      setInputText('');
    }

    if (triageStep !== null) {
      handleTriageFlow(userText);
    } else {
      handleGeneralQuery(userText);
    }
  };

  const handleTriageFlow = async (input: string) => {
    switch (triageStep) {
      case 1: // Symptoms
        setSession(s => ({ ...s, symptoms: input }));
        setTriageStep(2);
        botReply("Since how many days or hours have you been feeling this way?");
        break;
      case 2: // Duration
        setSession(s => ({ ...s, duration: input }));
        setTriageStep(3);
        botReply("On a scale of 1 to 10, how severe is your discomfort?");
        break;
      case 3: // Pain
        setSession(s => ({ ...s, painScore: parseInt(input) || 1 }));
        setTriageStep(4);
        botReply("Are you experiencing any chest pain?", 'quick_reply', ['Yes', 'No']);
        break;
      case 4: // Chest pain
        setSession(s => ({ ...s, hasChestPain: input.toLowerCase() === 'yes' }));
        setTriageStep(5);
        botReply("Are you having any difficulty breathing?", 'quick_reply', ['Yes', 'No']);
        break;
      case 5: // Breathing
        setSession(s => ({ ...s, hasBreathingDifficulty: input.toLowerCase() === 'yes' }));
        setTriageStep(6);
        botReply("Did you faint or become unconscious at any point?", 'quick_reply', ['Yes', 'No']);
        break;
      case 6: // Fainting
        setSession(s => ({ ...s, hasFainting: input.toLowerCase() === 'yes' }));
        setTriageStep(7);
        botReply("Do you have a high fever?", 'quick_reply', ['Yes', 'No']);
        break;
      case 7: // Fever
        setSession(s => ({ ...s, hasHighFever: input.toLowerCase() === 'yes' }));
        setTriageStep(8);
        botReply("Do you have any chronic conditions (like Diabetes or Asthma) or are you elderly/pregnant?", 'quick_reply', ['Yes', 'No']);
        break;
      case 8: // Final confirmation
        setSession(s => ({ ...s, hasChronicCondition: input.toLowerCase() === 'yes' }));
        setTriageStep(null);
        await performTriageAnalysis({ ...session, hasChronicCondition: input.toLowerCase() === 'yes' } as ChatTriageSession);
        break;
    }
  };

  const performTriageAnalysis = async (finalSession: ChatTriageSession) => {
    setIsTyping(true);
    
    // Rule-based engine call
    const result = assessSymptoms({
      symptoms: finalSession.symptoms,
      duration: parseInt(finalSession.duration) || 1,
      age: profile?.age || 30,
      existingConditions: profile?.existingDiseases || (finalSession.hasChronicCondition ? "Yes" : ""),
      painSeverity: finalSession.painScore,
      hasChestPain: finalSession.hasChestPain,
      hasBreathingDifficulty: finalSession.hasBreathingDifficulty,
      hasUnconscious: finalSession.hasFainting,
      hasFever: finalSession.hasHighFever,
      hasSevereBleeding: false,
    });

    let aiInsights = null;
    try {
      aiInsights = await enhanceChatbotResult({
        symptoms: finalSession.symptoms,
        severity: result.severity,
        duration: finalSession.duration,
        painScore: finalSession.painScore,
        redFlags: [
          finalSession.hasChestPain ? 'Chest Pain' : null,
          finalSession.hasBreathingDifficulty ? 'Breathing Difficulty' : null,
          finalSession.hasFainting ? 'Unconsciousness' : null,
        ].filter(Boolean) as string[],
        userContext: profile ? {
          name: profile.name,
          age: profile.age,
          conditions: profile.existingDiseases
        } : undefined
      });
    } catch (e) {
      console.error("AI enhancement failed", e);
    }

    const fullResult = {
      ...result,
      aiInsights
    };

    botReply("Analysis complete. Here is your triage assessment:", 'triage_result', fullResult);
    
    // Save to Firestore
    if (db && user?.uid) {
      const recordsRef = collection(db, 'chat_triage_records');
      addDocumentNonBlocking(recordsRef, {
        userId: user.uid,
        symptoms: finalSession.symptoms,
        duration: finalSession.duration,
        painScore: finalSession.painScore,
        severity: result.severity,
        explanation: result.reason,
        recommendation: result.nextSteps,
        redFlags: [
          finalSession.hasChestPain && 'Chest Pain',
          finalSession.hasBreathingDifficulty && 'Breathing Difficulty',
          finalSession.hasFainting && 'Fainting',
        ].filter(Boolean),
        createdAt: serverTimestamp(),
        source: 'chatbot'
      });
    }

    setIsTyping(false);
  };

  const handleGeneralQuery = (text: string) => {
    const q = text.toLowerCase();
    if (q.includes('symptom') || q.includes('check')) {
      startTriage();
    } else if (q.includes('hospital') || q.includes('facility')) {
      botReply("I can help you find a hospital. Redirecting you to the Facility Finder...", 'text');
      setTimeout(() => router.push('/facilities'), 1500);
    } else if (q.includes('emergency') || q.includes('help')) {
      triggerEmergencyHelp();
    } else if (q.includes('history')) {
      botReply("Fetching your clinical timeline...");
      setTimeout(() => router.push('/history'), 1500);
    } else {
      botReply("I'm trained to help with healthcare navigation. Would you like to start a symptom check or find a nearby hospital?");
    }
  };

  const startTriage = () => {
    setTriageStep(1);
    setSession({});
    botReply("Understood. I will guide you through a safety assessment. What symptoms are you experiencing?");
  };

  const triggerEmergencyHelp = () => {
    botReply("🚨 ATTENTION: If this is a life-threatening emergency, call 108 immediately.", 'text');
    botReply("Would you like to open the SOS Emergency Panel?", 'quick_reply', ['Open SOS Panel', 'Find Emergency Hospital', 'No, I am okay']);
  };

  const handleQuickReply = (reply: string) => {
    addMessage({ role: 'user', content: reply });
    
    if (triageStep !== null) {
      handleTriageFlow(reply);
    } else {
      if (reply === 'Start symptom check') startTriage();
      else if (reply === 'Find nearest hospital' || reply === 'Find Emergency Hospital') router.push('/facilities');
      else if (reply === 'Emergency help' || reply === 'Open SOS Panel') router.push('/sos');
      else if (reply === 'Generate doctor summary') router.push('/records');
      else if (reply === 'View health history') router.push('/history');
      else handleGeneralQuery(reply);
    }
  };

  return (
    <div className="fixed bottom-24 right-6 w-[400px] h-[600px] max-h-[80vh] flex flex-col bg-card border border-border shadow-2xl rounded-3xl overflow-hidden z-50 animate-in slide-in-from-bottom-4 duration-300">
      {/* Header */}
      <div className="bg-primary p-4 flex items-center justify-between text-primary-foreground shadow-lg">
        <div className="flex items-center gap-3">
          <div className="bg-white/20 p-2 rounded-xl">
            <Bot className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-headline font-bold text-sm leading-tight">Decision Assistant</h3>
            <p className="text-[10px] opacity-80 flex items-center gap-1 font-medium">
              <Sparkles className="h-2 w-2" /> Powered by SwasthyaAI
            </p>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} className="hover:bg-white/10 rounded-full h-8 w-8">
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Warning Bar */}
      <div className="bg-destructive/10 border-b border-destructive/20 p-2 text-[10px] text-destructive font-bold text-center uppercase tracking-widest flex items-center justify-center gap-2">
        <AlertCircle className="h-3 w-3" /> NOT FOR MEDICAL DIAGNOSIS
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-2">
          {messages.map(m => (
            <div key={m.id}>
              <ChatMessageBubble message={m} />
              {m.type === 'quick_reply' && (
                <div className="flex flex-wrap gap-2 mb-4 ml-11">
                  {m.data.map((reply: string) => (
                    <Button 
                      key={reply} 
                      variant="outline" 
                      size="sm" 
                      className="rounded-full bg-background border-primary/20 text-primary text-xs hover:bg-primary/10"
                      onClick={() => handleQuickReply(reply)}
                    >
                      {reply}
                    </Button>
                  ))}
                </div>
              )}
            </div>
          ))}
          {isTyping && <TypingIndicator />}
        </div>
      </ScrollArea>

      {/* Quick Replies Footer */}
      {triageStep === null && (
        <div className="px-4 py-2 flex gap-2 overflow-x-auto border-t border-border/50 bg-muted/20 no-scrollbar">
          {['Start symptom check', 'Find nearest hospital', 'Emergency help'].map(label => (
            <button 
              key={label}
              onClick={() => handleQuickReply(label)}
              className="whitespace-nowrap px-3 py-1.5 rounded-full bg-card border border-border text-[11px] font-bold text-muted-foreground hover:border-primary hover:text-primary transition-colors shadow-sm"
            >
              {label}
            </button>
          ))}
        </div>
      )}

      {/* Input Area */}
      <div className="p-4 bg-background border-t border-border flex items-center gap-2">
        <Button variant="ghost" size="icon" className="shrink-0 text-muted-foreground hover:text-primary">
          <Mic className="h-5 w-5" />
        </Button>
        <Input 
          placeholder={triageStep ? "Type your answer..." : "Ask about your health..."} 
          className="bg-muted/50 border-none focus-visible:ring-1 focus-visible:ring-primary h-11 text-sm rounded-xl"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
        />
        <Button 
          size="icon" 
          className="shrink-0 bg-primary text-primary-foreground rounded-xl h-11 w-11 shadow-lg shadow-primary/20"
          onClick={() => handleSend()}
        >
          <Send className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}

function Bot({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M12 8V4H8" />
      <rect width="16" height="12" x="4" y="8" rx="2" />
      <path d="M2 14h2" />
      <path d="M20 14h2" />
      <path d="M15 13v2" />
      <path d="M9 13v2" />
    </svg>
  );
}

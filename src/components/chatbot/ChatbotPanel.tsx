
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
  MicOff,
  Sparkles,
  AlertCircle,
  Volume2,
  VolumeX,
  Languages,
  ShieldCheck,
  Activity
} from 'lucide-react';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc, collection, serverTimestamp } from 'firebase/firestore';
import { addDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { assessSymptoms } from '@/lib/triage-engine';
import { enhanceChatbotResult } from '@/ai/flows/chatbot-enhancement-flow';
import { generateSpeech } from '@/ai/flows/tts-flow';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { useSpeechRecognition } from '@/hooks/use-speech-recognition';
import { t } from '@/lib/translations';
import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ChatbotPanelProps {
  onClose: () => void;
}

export function ChatbotPanel({ onClose }: ChatbotPanelProps) {
  const { user } = useUser();
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  const scrollRef = useRef<HTMLDivElement>(null);

  const [activeLang, setActiveLang] = useState<'en' | 'hi'>('en');
  const [isMuted, setIsMuted] = useState(false);

  const { 
    isListening, 
    transcript, 
    startListening, 
    stopListening, 
    setTranscript 
  } = useSpeechRecognition(activeLang === 'hi' ? 'hi-IN' : 'en-IN');

  const userDocRef = useMemoFirebase(() => {
    if (!db || !user?.uid) return null;
    return doc(db, 'users', user.uid);
  }, [db, user?.uid]);
  const { data: profile } = useDoc(userDocRef);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [inputText, setInputText] = useState('');
  
  const [triageStep, setTriageStep] = useState<number | null>(null);
  const [session, setSession] = useState<Partial<ChatTriageSession>>({});

  useEffect(() => {
    const welcomeMsg = activeLang === 'hi' 
      ? `नमस्ते! मैं आपका SwasthyaAI क्लिनिकल असिस्टेंट हूँ। मैं आज आपकी कैसे सहायता कर सकता हूँ?`
      : `Hello! I'm your SwasthyaAI Clinical Assistant. How can I assist you with your health today?`;
    
    setMessages([
      { 
        id: '1', 
        role: 'bot', 
        content: welcomeMsg, 
        timestamp: new Date() 
      }
    ]);
  }, [activeLang]);

  useEffect(() => {
    if (transcript) {
      setInputText(transcript);
    }
  }, [transcript]);

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

    if (!isMuted) {
      try {
        const textToSpeak = type === 'triage_result' 
          ? `${data.title}. ${data.explanation}. ${data.recommendation}`
          : content;
        const audioDataUri = await generateSpeech({ text: textToSpeak, language: activeLang });
        const audio = new Audio(audioDataUri);
        audio.play();
      } catch (e) {
        console.error('Bot voice output failed', e);
      }
    }
  };

  const handleSend = async (text: string = inputText) => {
    if (!text.trim() && triageStep === null) return;
    
    const userText = text.trim();
    if (userText) {
      addMessage({ role: 'user', content: userText, data: { inputType: transcript ? 'voice' : 'text', language: activeLang } });
      setInputText('');
      setTranscript('');
    }

    if (triageStep !== null) {
      handleTriageFlow(userText);
    } else {
      handleGeneralQuery(userText);
    }
  };

  const handleTriageFlow = async (input: string) => {
    const steps = [
      t('chatbot_q1', activeLang),
      t('chatbot_q2', activeLang),
      t('chatbot_q3', activeLang),
      t('chatbot_q4', activeLang),
      t('chatbot_q5', activeLang),
      t('chatbot_q6', activeLang),
      t('chatbot_q7', activeLang),
      t('chatbot_q8', activeLang),
      t('chatbot_q_analyze', activeLang)
    ];

    const yesLabels = activeLang === 'hi' ? ['हाँ', 'हा', 'yes'] : ['yes', 'y'];

    switch (triageStep) {
      case 1: 
        setSession(s => ({ ...s, symptoms: input }));
        setTriageStep(2);
        botReply(steps[1]);
        break;
      case 2: 
        setSession(s => ({ ...s, duration: input }));
        setTriageStep(3);
        botReply(steps[2]);
        break;
      case 3: 
        setSession(s => ({ ...s, painScore: parseInt(input) || 1 }));
        setTriageStep(4);
        botReply(steps[3], 'quick_reply', activeLang === 'hi' ? ['हाँ', 'नहीं'] : ['Yes', 'No']);
        break;
      case 4: 
        setSession(s => ({ ...s, hasChestPain: yesLabels.includes(input.toLowerCase()) }));
        setTriageStep(5);
        botReply(steps[4], 'quick_reply', activeLang === 'hi' ? ['हाँ', 'नहीं'] : ['Yes', 'No']);
        break;
      case 5: 
        setSession(s => ({ ...s, hasBreathingDifficulty: yesLabels.includes(input.toLowerCase()) }));
        setTriageStep(6);
        botReply(steps[5], 'quick_reply', activeLang === 'hi' ? ['हाँ', 'नहीं'] : ['Yes', 'No']);
        break;
      case 6: 
        setSession(s => ({ ...s, hasFainting: yesLabels.includes(input.toLowerCase()) }));
        setTriageStep(7);
        botReply(steps[6], 'quick_reply', activeLang === 'hi' ? ['हाँ', 'नहीं'] : ['Yes', 'No']);
        break;
      case 7: 
        setSession(s => ({ ...s, hasHighFever: yesLabels.includes(input.toLowerCase()) }));
        setTriageStep(8);
        botReply(steps[7], 'quick_reply', activeLang === 'hi' ? ['हाँ', 'नहीं'] : ['Yes', 'No']);
        break;
      case 8: 
        setSession(s => ({ ...s, hasChronicCondition: yesLabels.includes(input.toLowerCase()) }));
        setTriageStep(9);
        botReply(steps[8], 'quick_reply', activeLang === 'hi' ? ['हाँ', 'नहीं'] : ['Yes', 'No']);
        break;
      case 9:
        setTriageStep(null);
        if (yesLabels.includes(input.toLowerCase())) {
          await performTriageAnalysis({ ...session } as ChatTriageSession);
        } else {
          botReply(activeLang === 'hi' ? "समझ गया, विश्लेषण रद्द कर दिया गया।" : "Understood, analysis cancelled.");
        }
        break;
    }
  };

  const performTriageAnalysis = async (finalSession: ChatTriageSession) => {
    setIsTyping(true);
    
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
        language: activeLang,
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
      title: activeLang === 'hi' 
        ? (result.severity === 'RED' ? "आपातकालीन (RED)" : result.severity === 'YELLOW' ? "डॉक्टर से सलाह आवश्यक (YELLOW)" : "होम केयर (GREEN)")
        : result.label,
      aiInsights,
      disclaimer: t('chatbot_disclaimer', activeLang)
    };

    botReply(t('chatbot_analysis_complete', activeLang), 'triage_result', fullResult);
    
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
        source: 'chatbot',
        language: activeLang
      });
    }

    setIsTyping(false);
  };

  const handleGeneralQuery = (text: string) => {
    const q = text.toLowerCase();
    const isSymptom = q.includes('symptom') || q.includes('check') || q.includes('लक्षण') || q.includes('जांच');
    const isHospital = q.includes('hospital') || q.includes('facility') || q.includes('अस्पताल');
    const isEmergency = q.includes('emergency') || q.includes('help') || q.includes('इमरजेंसी') || q.includes('मदद');

    if (isSymptom) {
      startTriage();
    } else if (isHospital) {
      botReply(activeLang === 'hi' ? "मैं आपको अस्पताल खोजने में मदद कर सकता हूँ। सुविधा खोजक पर रिडायरेक्ट कर रहा हूँ..." : "I can help you find a hospital. Redirecting you to the Facility Finder...", 'text');
      setTimeout(() => router.push('/facilities'), 1500);
    } else if (isEmergency) {
      triggerEmergencyHelp();
    } else {
      botReply(activeLang === 'hi' 
        ? "मैं स्वास्थ्य सेवा नेविगेशन में सहायता के लिए प्रशिक्षित हूँ। क्या आप लक्षण जांच शुरू करना चाहेंगे या पास के अस्पताल को खोजना चाहेंगे?"
        : "I'm trained to assist with healthcare navigation. Would you like to start a symptom check or find a nearby hospital?");
    }
  };

  const startTriage = () => {
    setTriageStep(1);
    setSession({});
    botReply(t('chatbot_q1', activeLang));
  };

  const triggerEmergencyHelp = () => {
    botReply(activeLang === 'hi' ? "🚨 ध्यान दें: यदि यह जानलेवा स्थिति है, तो तुरंत 108 पर कॉल करें।" : "🚨 ATTENTION: If this is a life-threatening emergency, call 108 immediately.", 'text');
    botReply(activeLang === 'hi' ? "क्या आप SOS इमरजेंसी पैनल खोलना चाहेंगे?" : "Would you like to open the SOS Emergency Panel?", 'quick_reply', activeLang === 'hi' ? ['SOS पैनल खोलें', 'इमरजेंसी अस्पताल खोजें', 'नहीं, मैं ठीक हूँ'] : ['Open SOS Panel', 'Find Emergency Hospital', 'No, I am okay']);
  };

  const handleQuickReply = (reply: string) => {
    addMessage({ role: 'user', content: reply });
    
    const startTriageLabels = [t('chatbot_start_triage', 'en'), t('chatbot_start_triage', 'hi')];
    const findHospitalLabels = [t('chatbot_find_hospital', 'en'), t('chatbot_find_hospital', 'hi'), 'Find Emergency Hospital', 'इमरजेंसी अस्पताल खोजें'];
    const emergencyLabels = [t('chatbot_emergency_help', 'en'), t('chatbot_emergency_help', 'hi'), 'Open SOS Panel', 'SOS पैनल खोलें'];
    const summaryLabels = [t('chatbot_generate_summary', 'en'), t('chatbot_generate_summary', 'hi')];
    const historyLabels = [t('chatbot_view_history', 'en'), t('chatbot_view_history', 'hi')];

    if (triageStep !== null) {
      handleTriageFlow(reply);
    } else {
      if (startTriageLabels.includes(reply)) startTriage();
      else if (findHospitalLabels.includes(reply)) router.push('/facilities');
      else if (emergencyLabels.includes(reply)) router.push('/sos');
      else if (summaryLabels.includes(reply)) router.push('/records');
      else if (historyLabels.includes(reply)) router.push('/history');
      else handleGeneralQuery(reply);
    }
  };

  return (
    <div className="fixed bottom-24 right-6 w-[420px] h-[640px] max-h-[85vh] flex flex-col glass-panel rounded-[2rem] overflow-hidden z-50 animate-in slide-in-from-bottom-6 duration-500 shadow-[0_32px_64px_rgba(0,0,0,0.5)] border-white/10">
      {/* Header */}
      <div className="bg-primary p-5 flex items-center justify-between text-primary-foreground shadow-xl relative z-10">
        <div className="flex items-center gap-4">
          <div className="bg-white/20 p-2.5 rounded-2xl heartbeat shadow-inner">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-headline font-bold text-base leading-tight tracking-tight">{t('chatbot_title', activeLang)}</h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="h-1.5 w-1.5 rounded-full bg-accent-foreground/50 animate-pulse" />
              <span className="text-[10px] font-black opacity-80 uppercase tracking-widest">Medical Assistant v2</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Select value={activeLang} onValueChange={(v: any) => setActiveLang(v)}>
            <SelectTrigger className="w-[85px] bg-white/10 border-none h-8 text-[10px] font-bold text-white focus:ring-0 rounded-xl">
              <Languages className="h-3 w-3 mr-1" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en">English</SelectItem>
              <SelectItem value="hi">हिंदी</SelectItem>
            </SelectContent>
          </Select>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setIsMuted(!isMuted)} 
            className="hover:bg-white/10 rounded-xl h-8 w-8 text-white transition-colors"
          >
            {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </Button>
          <Button variant="ghost" size="icon" onClick={onClose} className="hover:bg-white/10 rounded-xl h-8 w-8 text-white transition-colors">
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Warning Bar */}
      <div className="bg-destructive/10 border-b border-white/5 p-2 text-[9px] text-destructive font-black text-center uppercase tracking-[0.2em] flex items-center justify-center gap-2">
        <ShieldCheck className="h-3 w-3" /> Secure AI Assessment • Not for Diagnosis
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-6 bg-gradient-to-b from-transparent to-primary/5" ref={scrollRef}>
        <div className="space-y-4">
          {messages.map(m => (
            <div key={m.id}>
              <ChatMessageBubble message={m} language={activeLang} />
              {m.type === 'quick_reply' && (
                <div className="flex flex-wrap gap-2 mb-6 ml-12">
                  {m.data.map((reply: string) => (
                    <Button 
                      key={reply} 
                      variant="outline" 
                      size="sm" 
                      className="rounded-xl bg-background/50 border-primary/30 text-primary text-xs font-bold hover:bg-primary/10 hover:border-primary transition-all shadow-sm px-4 h-9"
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
        <div className="px-6 py-3 flex gap-3 overflow-x-auto border-t border-white/5 bg-muted/20 no-scrollbar">
          {[
            t('chatbot_start_triage', activeLang), 
            t('chatbot_find_hospital', activeLang), 
            t('chatbot_emergency_help', activeLang)
          ].map(label => (
            <button 
              key={label}
              onClick={() => handleQuickReply(label)}
              className="whitespace-nowrap px-4 py-2 rounded-xl bg-card/80 border border-white/10 text-[11px] font-black text-muted-foreground uppercase tracking-widest hover:border-primary hover:text-primary transition-all shadow-lg active:scale-95"
            >
              {label}
            </button>
          ))}
        </div>
      )}

      {/* Input Area */}
      <div className="p-5 bg-background/80 backdrop-blur-xl border-t border-white/5 flex items-center gap-3">
        <Button 
          variant={isListening ? "destructive" : "ghost"} 
          size="icon" 
          className={cn("shrink-0 h-12 w-12 rounded-2xl transition-all", isListening ? "animate-pulse" : "text-muted-foreground hover:bg-primary/10 hover:text-primary")}
          onClick={isListening ? stopListening : startListening}
        >
          {isListening ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
        </Button>
        <Input 
          placeholder={t('chatbot_input_placeholder', activeLang)} 
          className="bg-muted/50 border-none focus-visible:ring-1 focus-visible:ring-primary h-12 text-sm rounded-2xl px-5"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
        />
        <Button 
          size="icon" 
          className="shrink-0 bg-primary text-primary-foreground rounded-2xl h-12 w-12 shadow-xl shadow-primary/20 hover:scale-105 transition-transform"
          onClick={() => handleSend()}
        >
          <Send className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}

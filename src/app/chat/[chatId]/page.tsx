'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { AppShell } from '@/components/layout/app-shell';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, addDoc, serverTimestamp, doc, setDoc } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, User as UserIcon, Loader2, MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function ChatPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const chatId = params.chatId as string;
  const otherName = searchParams.get('with') || 'Consultant';
  const role = searchParams.get('role') || 'patient';
  
  const { user } = useUser();
  const db = useFirestore();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [inputText, setInputText] = useState("");

  const messagesQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(
      collection(db, 'consultationChats', chatId, 'messages'),
      orderBy('createdAt', 'asc')
    );
  }, [db, chatId]);

  const { data: messages, isLoading } = useCollection(messagesQuery);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!inputText.trim() || !db || !user) return;
    const text = inputText;
    setInputText("");

    const chatRef = doc(db, 'consultationChats', chatId);
    await setDoc(chatRef, {
      updatedAt: serverTimestamp(),
      lastMessage: text,
      chatId: chatId
    }, { merge: true });

    await addDoc(collection(db, 'consultationChats', chatId, 'messages'), {
      senderUid: user.uid,
      senderRole: role,
      text: text,
      createdAt: serverTimestamp()
    });
  };

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto h-[calc(100vh-160px)] flex flex-col">
        <Card className="flex-1 flex flex-col border-border bg-card shadow-2xl overflow-hidden">
          <CardHeader className="bg-muted/30 border-b border-border py-4">
             <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                   <UserIcon className="h-5 w-5" />
                </div>
                <div>
                   <CardTitle className="text-lg">{otherName}</CardTitle>
                   <p className="text-[10px] font-black uppercase text-primary tracking-widest">Active Consultation</p>
                </div>
             </div>
          </CardHeader>
          
          <ScrollArea className="flex-1 p-6" ref={scrollRef}>
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="space-y-4">
                {messages?.map((m) => {
                  const isMe = m.senderUid === user?.uid;
                  return (
                    <div key={m.id} className={cn("flex", isMe ? "justify-end" : "justify-start")}>
                      <div className={cn(
                        "max-w-[80%] p-4 rounded-2xl text-sm shadow-sm",
                        isMe ? "bg-primary text-primary-foreground rounded-tr-none" : "bg-muted rounded-tl-none"
                      )}>
                        {m.text}
                      </div>
                    </div>
                  );
                })}
                {messages?.length === 0 && (
                  <div className="text-center py-20 opacity-30 space-y-4">
                    <MessageCircle className="h-12 w-12 mx-auto" />
                    <p>Start your clinical conversation safely.</p>
                  </div>
                )}
              </div>
            )}
          </ScrollArea>

          <CardFooter className="p-4 bg-muted/20 border-t border-border gap-3">
             <Input 
               placeholder="Type clinical inquiry..." 
               className="bg-card h-12"
               value={inputText}
               onChange={e => setInputText(e.target.value)}
               onKeyDown={e => e.key === 'Enter' && handleSend()}
             />
             <Button className="h-12 w-12 rounded-xl" onClick={handleSend}>
                <Send className="h-5 w-5" />
             </Button>
          </CardFooter>
        </Card>
      </div>
    </AppShell>
  );
}

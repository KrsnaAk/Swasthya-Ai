
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
import { Send, User as UserIcon, Loader2, MessageCircle, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

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

  // Determine participants from chatId (standard format: UID1_UID2)
  const participants = chatId.split('_');
  const otherPartyId = participants.find(id => id !== user?.uid) || '';

  const messagesQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(
      collection(db, 'consultationChats', chatId, 'messages'),
      orderBy('createdAt', 'asc')
    );
  }, [db, chatId]);

  const { data: messages, isLoading, error } = useCollection(messagesQuery);

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
    
    // Ensure chat document exists with standard participant metadata
    setDoc(chatRef, {
      updatedAt: serverTimestamp(),
      lastMessage: text,
      chatId: chatId,
      participants: participants,
      patientId: role === 'patient' ? user.uid : otherPartyId,
      doctorId: role === 'doctor' ? user.uid : otherPartyId,
    }, { merge: true }).catch(async (serverError) => {
       errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: chatRef.path,
          operation: 'update',
          requestResourceData: { lastMessage: text, participants }
       }));
    });

    const messagesCol = collection(db, 'consultationChats', chatId, 'messages');
    addDoc(messagesCol, {
      senderUid: user.uid,
      senderRole: role,
      text: text,
      createdAt: serverTimestamp()
    }).catch(async (serverError) => {
       errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: messagesCol.path,
          operation: 'create',
          requestResourceData: { text, senderUid: user.uid }
       }));
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
            ) : error ? (
              <div className="flex flex-col items-center justify-center h-full text-center space-y-6 max-w-sm mx-auto">
                <div className="bg-destructive/10 p-6 rounded-full">
                   <Lock className="h-12 w-12 text-destructive" />
                </div>
                <div className="space-y-2">
                   <h3 className="text-xl font-bold">Secure Access Required</h3>
                   <p className="text-sm text-muted-foreground">Preparing your clinical channel. If access is delayed, ensure you are authenticated correctly.</p>
                </div>
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

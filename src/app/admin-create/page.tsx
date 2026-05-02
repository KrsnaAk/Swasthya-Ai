'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, useFirestore } from '@/firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { ShieldCheck, Loader2, Lock, ArrowRight, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function AdminCreatePage() {
  const [email, setEmail] = useState('prince32@gmail.com');
  const [password, setPassword] = useState('Admin@123');
  const [secret, setSecret] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const auth = useAuth();
  const db = useFirestore();
  const { toast } = useToast();
  const router = useRouter();

  const SETUP_SECRET = "SWASTHYA_ADMIN_SETUP_2026";

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (secret !== SETUP_SECRET) {
      toast({ variant: "destructive", title: "Invalid Secret", description: "The setup secret key is incorrect." });
      return;
    }

    setLoading(true);
    try {
      let uid = '';
      try {
        // 1. Try creating user
        const res = await createUserWithEmailAndPassword(auth, email, password);
        uid = res.user.uid;
      } catch (authError: any) {
        if (authError.code === 'auth/email-already-in-use') {
          // 2. If exists, sign in to get UID
          const res = await signInWithEmailAndPassword(auth, email, password);
          uid = res.user.uid;
        } else {
          throw authError;
        }
      }

      // 3. Set Firestore Role
      const userRef = doc(db, 'users', uid);
      await setDoc(userRef, {
        uid,
        email,
        name: "System Admin",
        role: "admin",
        updatedAt: serverTimestamp(),
        createdAt: serverTimestamp(),
        setupMethod: "client-provisioning"
      }, { merge: true });

      setResult({ uid, email, path: `users/${uid}` });
      toast({ title: "Admin Provisioned", description: "System administrator created successfully." });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Setup Failed", description: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md border-border bg-card shadow-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit mb-4">
            <Lock className="h-10 w-10 text-primary" />
          </div>
          <CardTitle className="text-3xl font-headline font-bold">Admin Provisioning</CardTitle>
          <CardDescription>One-time clinical account setup using client SDK.</CardDescription>
        </CardHeader>

        <CardContent>
          {!result ? (
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-2">
                <Label>Admin Email</Label>
                <Input value={email} onChange={e => setEmail(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>Admin Password</Label>
                <Input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>Setup Secret Key</Label>
                <Input type="password" placeholder="Enter clinical setup secret" value={secret} onChange={e => setSecret(e.target.value)} required />
              </div>
              <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl flex gap-3">
                 <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0" />
                 <p className="text-[10px] text-amber-500 font-bold uppercase tracking-widest leading-tight">
                   Caution: This creates a REAL Firebase Authentication user with elevated administrative roles in Firestore.
                 </p>
              </div>
              <Button type="submit" className="w-full h-12 font-bold bg-primary" disabled={loading}>
                {loading ? <Loader2 className="animate-spin mr-2" /> : <ShieldCheck className="mr-2" />}
                PROVISION SYSTEM ADMIN
              </Button>
            </form>
          ) : (
            <div className="space-y-6 text-center animate-in fade-in zoom-in-95">
               <div className="p-6 bg-green-500/10 border border-green-500/20 rounded-2xl">
                  <ShieldCheck className="h-12 w-12 text-green-500 mx-auto mb-2" />
                  <h3 className="font-bold text-green-500">Provisioning Successful</h3>
               </div>
               <div className="text-left text-xs font-mono bg-muted p-4 rounded-xl space-y-2 border border-border">
                  <p><span className="text-muted-foreground uppercase font-black mr-2">UID:</span> {result.uid}</p>
                  <p><span className="text-muted-foreground uppercase font-black mr-2">EMAIL:</span> {result.email}</p>
                  <p><span className="text-muted-foreground uppercase font-black mr-2">PATH:</span> {result.path}</p>
               </div>
               <Button onClick={() => router.push('/admin-auth')} className="w-full h-12 gap-2">
                  Go to Admin Terminal <ArrowRight className="h-4 w-4" />
               </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

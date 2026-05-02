'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth, useFirestore } from '@/firebase';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { ShieldCheck, Loader2, ArrowLeft, Lock, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function AdminAuthPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const auth = useAuth();
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Sign in with Firebase Auth
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 2. Fetch User Profile to check role
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      const profile = userDoc.data();

      if (profile?.role === 'admin') {
        toast({ title: "Access Granted", description: "Welcome to the Clinical Admin Terminal." });
        router.push('/admin');
      } else {
        // 3. If not admin, sign out immediately
        await signOut(auth);
        toast({
          variant: "destructive",
          title: "Access Denied",
          description: "This account is not authorized for administrative access."
        });
      }
    } catch (error: any) {
      toast({
        title: "Authentication Failed",
        description: error.message || "Invalid administrative credentials.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md border-border bg-card shadow-2xl">
        <CardHeader className="space-y-2 text-center border-b border-border pb-8">
          <div className="mx-auto bg-destructive/10 p-4 rounded-full w-fit mb-4">
            <Lock className="h-10 w-10 text-destructive" />
          </div>
          <CardTitle className="text-3xl font-headline font-bold text-foreground">Admin Terminal</CardTitle>
          <CardDescription>
            Restricted area. Clinical administrators only.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4 pt-8">
            <div className="space-y-2">
              <Label htmlFor="email">Admin Email</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="admin@swasthya.ai" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-muted/30 h-12"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Security Token / Password</Label>
              <Input 
                id="password" 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-muted/30 h-12"
              />
            </div>
            <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl flex gap-3 mt-4">
              <ShieldCheck className="h-5 w-5 text-amber-500 shrink-0" />
              <p className="text-[10px] text-amber-500 font-bold uppercase leading-tight tracking-wider">
                Multi-factor authentication required for production sessions. Unauthorized attempts are logged.
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4 mt-6">
            <Button 
              type="submit" 
              className="w-full bg-destructive text-destructive-foreground font-black h-14 text-base shadow-xl hover:bg-destructive/90"
              disabled={loading}
            >
              {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : "AUTHORIZE ACCESS"}
            </Button>
            <div className="flex flex-col gap-2 w-full">
              <Button variant="ghost" asChild className="gap-2 text-muted-foreground">
                <Link href="/">
                  <ArrowLeft className="h-4 w-4" /> Back to Safety
                </Link>
              </Button>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

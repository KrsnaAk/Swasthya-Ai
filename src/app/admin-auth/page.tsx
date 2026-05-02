'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { ShieldCheck, Loader2, ArrowLeft, Lock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function AdminAuthPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState(''); // This acts as the Security Token
  const [loading, setLoading] = useState(false);
  const auth = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // 1. Check for Demo Credentials
    if (email === "prince32@gmail.com" && password === "Admin@123") {
      localStorage.setItem("demoAdminAccess", "true");
      localStorage.setItem("demoAdminEmail", email);
      toast({ title: "Demo Admin Authorized", description: "Entering system in demo mode..." });
      router.push('/admin');
      setLoading(false);
      return;
    }

    // 2. Fallback to Firebase Auth for regular admins
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast({ title: "Admin Authenticated", description: "Verifying system privileges..." });
      router.push('/admin');
    } catch (error: any) {
      toast({
        title: "Access Denied",
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
            Restricted area. Authorized personnel only.
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
              <Label htmlFor="password">Security Token</Label>
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
                Multi-factor authentication required after initial sign-in. All actions are logged.
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
            <Button variant="ghost" asChild className="gap-2 text-muted-foreground">
              <Link href="/">
                <ArrowLeft className="h-4 w-4" /> Back to Safety
              </Link>
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

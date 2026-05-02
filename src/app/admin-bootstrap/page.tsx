'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ShieldAlert, Loader2, CheckCircle2, ArrowRight, ShieldCheck, Lock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function AdminBootstrapPage() {
  const [secret, setSecret] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const { toast } = useToast();

  const handleBootstrap = async () => {
    if (!secret) return;
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/admin/bootstrap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ secret }),
      });

      const data = await response.json();

      if (response.ok) {
        setResult(data);
        toast({ title: "Bootstrap Successful", description: "Admin account is ready." });
      } else {
        toast({ 
          variant: "destructive", 
          title: "Bootstrap Failed", 
          description: data.error || "Something went wrong." 
        });
      }
    } catch (e) {
      toast({ variant: "destructive", title: "Network Error", description: "Could not reach the server." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-xl border-border bg-card shadow-2xl">
        <CardHeader className="text-center space-y-2 border-b border-border pb-8">
          <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit mb-2">
            <Lock className="h-10 w-10 text-primary" />
          </div>
          <CardTitle className="text-3xl font-headline font-bold">Admin Bootstrap</CardTitle>
          <CardDescription>
            One-time setup for the system administrator account.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6 pt-8">
          {!result ? (
            <div className="space-y-4">
              <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl flex gap-3">
                <ShieldAlert className="h-6 w-6 text-amber-500 shrink-0" />
                <div className="text-xs text-amber-500 font-bold uppercase leading-relaxed tracking-wider">
                  Caution: This will create an admin account based on the credentials in your .env file.
                  Ensure you have set ADMIN_BOOTSTRAP_SECRET correctly.
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="secret">Bootstrap Secret Key</Label>
                <Input 
                  id="secret" 
                  type="password" 
                  placeholder="Enter secret from .env" 
                  value={secret}
                  onChange={(e) => setSecret(e.target.value)}
                  className="bg-muted/30 h-12"
                />
              </div>

              <Button 
                onClick={handleBootstrap} 
                className="w-full h-14 bg-primary text-primary-foreground font-black text-lg shadow-xl shadow-primary/20"
                disabled={loading || !secret}
              >
                {loading ? <Loader2 className="mr-2 h-6 w-6 animate-spin" /> : <ShieldCheck className="mr-2 h-6 w-6" />}
                INITIALIZE ADMIN SYSTEM
              </Button>
            </div>
          ) : (
            <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500">
              <div className="p-6 bg-green-500/10 border border-green-500/20 rounded-2xl flex flex-col items-center gap-4 text-center">
                 <CheckCircle2 className="h-12 w-12 text-green-500" />
                 <div>
                    <h3 className="text-lg font-bold text-green-500">Bootstrap Completed</h3>
                    <p className="text-sm text-muted-foreground">The admin user has been successfully provisioned.</p>
                 </div>
              </div>

              <div className="grid grid-cols-1 gap-4 text-sm font-mono bg-muted/40 p-6 rounded-2xl border border-border">
                 <div className="flex justify-between border-b border-border/50 pb-2">
                    <span className="text-muted-foreground uppercase text-[10px] font-black">Email:</span>
                    <span className="text-primary">{result.adminEmail}</span>
                 </div>
                 <div className="flex justify-between border-b border-border/50 pb-2">
                    <span className="text-muted-foreground uppercase text-[10px] font-black">UID:</span>
                    <span className="truncate ml-4">{result.adminUid}</span>
                 </div>
                 <div className="flex justify-between">
                    <span className="text-muted-foreground uppercase text-[10px] font-black">Path:</span>
                    <span>{result.firestorePath}</span>
                 </div>
              </div>

              <div className="p-4 bg-destructive/5 border border-destructive/10 rounded-xl">
                 <p className="text-[10px] text-destructive font-bold uppercase text-center leading-tight tracking-widest">
                   Safety Notice: Please remove or rotate the ADMIN_BOOTSTRAP_SECRET in your environment settings now.
                 </p>
              </div>

              <Button asChild className="w-full h-12 bg-primary font-bold">
                <Link href="/admin-auth" className="flex items-center justify-center gap-2">
                  Go to Admin Terminal <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          )}
        </CardContent>

        <CardFooter className="justify-center border-t border-border mt-4">
          <Button variant="ghost" asChild className="text-muted-foreground">
            <Link href="/">Back to Landing</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

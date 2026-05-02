'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth, useFirestore } from '@/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { HeartPulse, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { SUPPORTED_LANGUAGES } from '@/lib/languages';

export default function SignupPage() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    phone: '',
    age: '',
    gender: '',
    city: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    abhaId: '',
    preferredLanguage: 'en',
  });

  const auth = useAuth();
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSelectChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      const user = userCredential.user;

      await setDoc(doc(db, "users", user.uid), {
        id: user.uid,
        name: formData.name,
        phone: formData.phone,
        age: Number(formData.age),
        gender: formData.gender,
        preferredLanguage: formData.preferredLanguage,
        city: formData.city,
        emergencyContactName: formData.emergencyContactName,
        emergencyContactPhone: formData.emergencyContactPhone,
        abhaId: formData.abhaId || null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      toast({ title: "Account Created", description: "Welcome to SwasthyaAI!" });
      router.push('/dashboard');
    } catch (error: any) {
      toast({ title: "Signup Failed", description: error.message || "An error occurred.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4 py-12">
      <Card className="w-full max-w-2xl border-border bg-card shadow-2xl">
        <CardHeader className="space-y-2 text-center">
          <div className="mx-auto bg-primary p-3 rounded-2xl w-fit mb-4"><HeartPulse className="h-8 w-8 text-primary-foreground" /></div>
          <CardTitle className="text-3xl font-headline font-bold">Create Account</CardTitle>
          <CardDescription>Join SwasthyaAI for personalized healthcare guidance</CardDescription>
        </CardHeader>
        <form onSubmit={handleSignup}>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
            <div className="space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-primary">Login & Preferences</h3>
              <div className="space-y-2"><Label htmlFor="email">Email</Label><Input id="email" type="email" placeholder="name@example.com" value={formData.email} onChange={handleInputChange} required /></div>
              <div className="space-y-2"><Label htmlFor="password">Password</Label><Input id="password" type="password" value={formData.password} onChange={handleInputChange} required /></div>
              <div className="space-y-2">
                <Label htmlFor="preferredLanguage">Language</Label>
                <Select onValueChange={(v) => handleSelectChange('preferredLanguage', v)} defaultValue="en">
                  <SelectTrigger><SelectValue placeholder="Language" /></SelectTrigger>
                  <SelectContent>
                    {SUPPORTED_LANGUAGES.map((lang) => (<SelectItem key={lang.code} value={lang.code}>{lang.name}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-primary pt-2">Personal</h3>
              <div className="space-y-2"><Label htmlFor="name">Full Name</Label><Input id="name" placeholder="John Doe" value={formData.name} onChange={handleInputChange} required /></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label htmlFor="age">Age</Label><Input id="age" type="number" value={formData.age} onChange={handleInputChange} required /></div>
                <div className="space-y-2">
                  <Label htmlFor="gender">Gender</Label>
                  <Select onValueChange={(v) => handleSelectChange('gender', v)} required>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent><SelectItem value="Male">Male</SelectItem><SelectItem value="Female">Female</SelectItem><SelectItem value="Other">Other</SelectItem></SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-primary">Contact</h3>
              <div className="space-y-2"><Label htmlFor="phone">Phone Number</Label><Input id="phone" placeholder="+91 XXXXX XXXXX" value={formData.phone} onChange={handleInputChange} required /></div>
              <div className="space-y-2"><Label htmlFor="city">City</Label><Input id="city" placeholder="Mumbai" value={formData.city} onChange={handleInputChange} required /></div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-primary pt-2">Emergency</h3>
              <div className="space-y-2"><Label htmlFor="emergencyContactName">Contact Name</Label><Input id="emergencyContactName" value={formData.emergencyContactName} onChange={handleInputChange} required /></div>
              <div className="space-y-2"><Label htmlFor="emergencyContactPhone">Contact Phone</Label><Input id="emergencyContactPhone" value={formData.emergencyContactPhone} onChange={handleInputChange} required /></div>
              <div className="space-y-2"><Label htmlFor="abhaId">Patient ID</Label><Input id="abhaId" placeholder="XX-XXXX-XXXX-XXXX" value={formData.abhaId} onChange={handleInputChange} /></div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4 mt-6">
            <Button type="submit" className="w-full bg-primary text-primary-foreground font-bold h-12" disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Complete Registration"}
            </Button>
            <p className="text-sm text-center text-muted-foreground">Already have an account? <Link href="/login" className="text-primary font-semibold hover:underline">Log In</Link></p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

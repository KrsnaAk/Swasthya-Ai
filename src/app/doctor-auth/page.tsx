'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth, useUser, useFirestore } from '@/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Stethoscope, Loader2, ShieldCheck, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function DoctorAuthPage() {
  const [loading, setLoading] = useState(false);
  const auth = useAuth();
  const db = useFirestore();
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    phone: '',
    specialization: '',
    experienceYears: '',
    licenseNumber: '',
    clinicName: '',
    city: '',
  });

  useEffect(() => {
    if (!isUserLoading && user) {
      // If user is already logged in, AppShell will handle redirection to dashboard
      // based on role. We don't want to block here unless we are sure.
    }
  }, [user, isUserLoading]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, formData.email, formData.password);
      toast({ title: "Welcome Doctor", description: "Verifying clinical credentials..." });
      router.push('/doctor');
    } catch (error: any) {
      toast({
        title: "Login Failed",
        description: error.message || "Invalid doctor credentials.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      const newUser = userCredential.user;

      const doctorProfile = {
        id: newUser.uid,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        city: formData.city,
        role: 'doctor',
        verificationStatus: 'pending',
        specialization: formData.specialization,
        experienceYears: Number(formData.experienceYears),
        licenseNumber: formData.licenseNumber,
        clinicName: formData.clinicName,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      await setDoc(doc(db, "users", newUser.uid), doctorProfile);
      await setDoc(doc(db, "doctorApplications", newUser.uid), {
        ...doctorProfile,
        submittedAt: serverTimestamp()
      });

      toast({ title: "Application Submitted", description: "Your profile is now under clinical review." });
      router.push('/doctor');
    } catch (error: any) {
      toast({ title: "Signup Failed", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  if (isUserLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4 py-12">
      <Card className="w-full max-w-2xl border-border bg-card shadow-2xl">
        <CardHeader className="space-y-2 text-center">
          <div className="mx-auto bg-primary p-3 rounded-2xl w-fit mb-4">
            <Stethoscope className="h-8 w-8 text-primary-foreground" />
          </div>
          <CardTitle className="text-3xl font-headline font-bold text-primary">Doctor Gateway</CardTitle>
          <CardDescription>
            Verified professional access to SwasthyaAI Clinical Portal
          </CardDescription>
        </CardHeader>
        
        <Tabs defaultValue="login" className="w-full px-6">
          <TabsList className="grid w-full grid-cols-2 mb-8 bg-muted/50 p-1">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="signup">Register as Professional</TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <form onSubmit={handleLogin} className="space-y-4 pb-6">
              <div className="space-y-2">
                <Label htmlFor="email">Professional Email</Label>
                <Input id="email" type="email" placeholder="dr.name@hospital.com" value={formData.email} onChange={handleInputChange} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" value={formData.password} onChange={handleInputChange} required />
              </div>
              <Button type="submit" className="w-full h-12 font-bold bg-primary text-primary-foreground" disabled={loading}>
                {loading ? <Loader2 className="animate-spin mr-2" /> : "Secure Login"}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="signup">
            <form onSubmit={handleSignup} className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-6">
              <div className="space-y-2 col-span-2">
                <Label htmlFor="name">Full Name (with Title)</Label>
                <Input id="name" placeholder="Dr. Jane Smith" value={formData.name} onChange={handleInputChange} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={formData.email} onChange={handleInputChange} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" value={formData.password} onChange={handleInputChange} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" value={formData.phone} onChange={handleInputChange} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="licenseNumber">Medical License #</Label>
                <Input id="licenseNumber" value={formData.licenseNumber} onChange={handleInputChange} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="specialization">Specialization</Label>
                <Input id="specialization" placeholder="e.g. Cardiology" value={formData.specialization} onChange={handleInputChange} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="experienceYears">Experience (Years)</Label>
                <Input id="experienceYears" type="number" value={formData.experienceYears} onChange={handleInputChange} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="clinicName">Clinic/Hospital</Label>
                <Input id="clinicName" value={formData.clinicName} onChange={handleInputChange} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input id="city" value={formData.city} onChange={handleInputChange} required />
              </div>
              <Button type="submit" className="w-full h-12 font-bold col-span-2 mt-4 bg-primary text-primary-foreground" disabled={loading}>
                {loading ? <Loader2 className="animate-spin mr-2" /> : "Submit Application"}
              </Button>
            </form>
          </TabsContent>
        </Tabs>

        <CardFooter className="justify-center border-t border-border mt-4">
          <Button variant="ghost" asChild className="gap-2 text-muted-foreground">
            <Link href="/">
              <ArrowLeft className="h-4 w-4" /> Back to Home
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

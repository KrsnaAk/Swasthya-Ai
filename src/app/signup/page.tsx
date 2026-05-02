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
import { HeartPulse, Loader2, Stethoscope, User as UserIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { SUPPORTED_LANGUAGES } from '@/lib/languages';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export default function SignupPage() {
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState<'patient' | 'doctor'>('patient');
  
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
    // Doctor specific
    specialization: '',
    experienceYears: '',
    licenseNumber: '',
    clinicName: '',
    clinicAddress: '',
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

      const userProfile: any = {
        id: user.uid,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        city: formData.city,
        role: role,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      if (role === 'patient') {
        userProfile.age = Number(formData.age);
        userProfile.gender = formData.gender;
        userProfile.preferredLanguage = formData.preferredLanguage;
        userProfile.emergencyContactName = formData.emergencyContactName;
        userProfile.emergencyContactPhone = formData.emergencyContactPhone;
        userProfile.abhaId = formData.abhaId || null;
      } else {
        userProfile.verificationStatus = 'pending';
        userProfile.specialization = formData.specialization;
        userProfile.experienceYears = Number(formData.experienceYears);
        userProfile.licenseNumber = formData.licenseNumber;
        userProfile.clinicName = formData.clinicName;
        userProfile.clinicAddress = formData.clinicAddress;

        // Also create an application record for admin
        await setDoc(doc(db, "doctorApplications", user.uid), {
           ...userProfile,
           submittedAt: serverTimestamp()
        });
      }

      await setDoc(doc(db, "users", user.uid), userProfile);

      toast({ title: "Account Created", description: `Welcome to SwasthyaAI, ${role}!` });
      router.push('/dashboard');
    } catch (error: any) {
      toast({ title: "Signup Failed", description: error.message || "An error occurred.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4 py-12">
      <Card className="w-full max-w-3xl border-border bg-card shadow-2xl">
        <CardHeader className="space-y-2 text-center">
          <div className="mx-auto bg-primary p-3 rounded-2xl w-fit mb-4"><HeartPulse className="h-8 w-8 text-primary-foreground" /></div>
          <CardTitle className="text-3xl font-headline font-bold">Join SwasthyaAI</CardTitle>
          <CardDescription>Create your clinical account for intelligent healthcare</CardDescription>
        </CardHeader>
        
        <div className="px-6">
          <Tabs defaultValue="patient" className="w-full" onValueChange={(v: any) => setRole(v)}>
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="patient" className="gap-2"><UserIcon className="h-4 w-4" /> Patient Access</TabsTrigger>
              <TabsTrigger value="doctor" className="gap-2"><Stethoscope className="h-4 w-4" /> Medical Professional</TabsTrigger>
            </TabsList>
            
            <form onSubmit={handleSignup}>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-primary">Essential Info</h3>
                  <div className="space-y-2"><Label htmlFor="email">Email</Label><Input id="email" type="email" placeholder="name@example.com" value={formData.email} onChange={handleInputChange} required /></div>
                  <div className="space-y-2"><Label htmlFor="password">Password</Label><Input id="password" type="password" value={formData.password} onChange={handleInputChange} required /></div>
                  <div className="space-y-2"><Label htmlFor="name">Full Name</Label><Input id="name" placeholder="Dr. / Mr. Name" value={formData.name} onChange={handleInputChange} required /></div>
                  <div className="space-y-2"><Label htmlFor="phone">Phone Number</Label><Input id="phone" placeholder="+91 XXXXX XXXXX" value={formData.phone} onChange={handleInputChange} required /></div>
                  <div className="space-y-2"><Label htmlFor="city">City</Label><Input id="city" placeholder="Mumbai" value={formData.city} onChange={handleInputChange} required /></div>
                </div>

                <div className="space-y-4">
                  <TabsContent value="patient" className="space-y-4 mt-0">
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-primary">Health Context</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2"><Label htmlFor="age">Age</Label><Input id="age" type="number" value={formData.age} onChange={handleInputChange} /></div>
                      <div className="space-y-2">
                        <Label htmlFor="gender">Gender</Label>
                        <Select onValueChange={(v) => handleSelectChange('gender', v)}>
                          <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                          <SelectContent><SelectItem value="Male">Male</SelectItem><SelectItem value="Female">Female</SelectItem><SelectItem value="Other">Other</SelectItem></SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="preferredLanguage">Interface Language</Label>
                      <Select onValueChange={(v) => handleSelectChange('preferredLanguage', v)} defaultValue="en">
                        <SelectTrigger><SelectValue placeholder="Language" /></SelectTrigger>
                        <SelectContent>{SUPPORTED_LANGUAGES.map((lang) => (<SelectItem key={lang.code} value={lang.code}>{lang.name}</SelectItem>))}</SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2"><Label htmlFor="emergencyContactPhone">Emergency Phone</Label><Input id="emergencyContactPhone" placeholder="Contact number" value={formData.emergencyContactPhone} onChange={handleInputChange} /></div>
                    <div className="space-y-2"><Label htmlFor="abhaId">Patient ID (ABHA)</Label><Input id="abhaId" placeholder="XX-XXXX-XXXX-XXXX" value={formData.abhaId} onChange={handleInputChange} /></div>
                  </TabsContent>

                  <TabsContent value="doctor" className="space-y-4 mt-0">
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-primary">Credentials</h3>
                    <div className="space-y-2"><Label htmlFor="specialization">Specialization</Label><Input id="specialization" placeholder="e.g. Cardiology" value={formData.specialization} onChange={handleInputChange} /></div>
                    <div className="space-y-2"><Label htmlFor="experienceYears">Experience (Years)</Label><Input id="experienceYears" type="number" value={formData.experienceYears} onChange={handleInputChange} /></div>
                    <div className="space-y-2"><Label htmlFor="licenseNumber">Medical License #</Label><Input id="licenseNumber" placeholder="Registration ID" value={formData.licenseNumber} onChange={handleInputChange} /></div>
                    <div className="space-y-2"><Label htmlFor="clinicName">Clinic / Hospital Name</Label><Input id="clinicName" value={formData.clinicName} onChange={handleInputChange} /></div>
                  </TabsContent>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col space-y-4 mt-6">
                <Button type="submit" className="w-full bg-primary text-primary-foreground font-bold h-12" disabled={loading}>
                  {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : `Complete ${role === 'patient' ? 'Patient' : 'Professional'} Registration`}
                </Button>
                <p className="text-sm text-center text-muted-foreground">Already have an account? <Link href="/login" className="text-primary font-semibold hover:underline">Log In</Link></p>
              </CardFooter>
            </form>
          </Tabs>
        </div>
      </Card>
    </div>
  );
}

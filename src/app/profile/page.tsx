'use client';

import React, { useState, useEffect } from 'react';
import { AppShell } from "@/components/layout/app-shell";
import { useUser, useFirestore, useMemoFirebase, useDoc } from '@/firebase';
import { doc, serverTimestamp } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, User, Save, ShieldCheck, Languages } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { SUPPORTED_LANGUAGES } from '@/lib/languages';

export default function ProfilePage() {
  const { user, isUserLoading } = useUser();
  const db = useFirestore();
  const { toast } = useToast();

  const userDocRef = useMemoFirebase(() => {
    if (!db || !user?.uid) return null;
    return doc(db, 'users', user.uid);
  }, [db, user?.uid]);

  const { data: profile, isLoading: isProfileLoading } = useDoc(userDocRef);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<any>(null);

  useEffect(() => {
    if (profile) {
      setFormData(profile);
    }
  }, [profile]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSelectChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSave = () => {
    if (!userDocRef || !formData) return;
    
    updateDocumentNonBlocking(userDocRef, {
      ...formData,
      updatedAt: serverTimestamp(),
    });

    setIsEditing(false);
    toast({
      title: "Profile Updated",
      description: "Your changes have been saved successfully.",
    });
  };

  if (isUserLoading || isProfileLoading || !formData) {
    return (
      <AppShell>
        <div className="flex h-[60vh] w-full items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-headline font-bold">Your Profile</h1>
            <p className="text-muted-foreground">Manage your personal and health record information.</p>
          </div>
          {!isEditing ? (
            <Button onClick={() => setIsEditing(true)} className="gap-2">
              <User className="h-4 w-4" /> Edit Profile
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button variant="ghost" onClick={() => setIsEditing(false)}>Cancel</Button>
              <Button onClick={handleSave} className="gap-2 bg-primary text-primary-foreground">
                <Save className="h-4 w-4" /> Save Changes
              </Button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-1 border-border bg-card h-fit">
            <CardHeader className="text-center">
              <div className="mx-auto bg-muted rounded-full p-6 w-fit mb-4">
                <User className="h-12 w-12 text-muted-foreground" />
              </div>
              <CardTitle>{formData.name}</CardTitle>
              <CardDescription>{user?.email}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center text-sm border-t border-border pt-4">
                <span className="text-muted-foreground">Member Since</span>
                <span className="font-medium">
                   {formData.createdAt ? new Date(formData.createdAt?.seconds * 1000).toLocaleDateString() : 'N/A'}
                </span>
              </div>
              <div className="p-4 bg-primary/10 rounded-xl border border-primary/20 space-y-2">
                <div className="flex items-center gap-2 text-primary">
                  <ShieldCheck className="h-4 w-4" />
                  <span className="text-xs font-bold uppercase">Account Verified</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Your data is encrypted and used only for triage analysis.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2 border-border bg-card">
            <CardHeader>
              <CardTitle className="text-xl">Health Profile Information</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" value={formData.name} onChange={handleInputChange} disabled={!isEditing} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="preferredLanguage">Preferred Language</Label>
                <Select 
                  value={formData.preferredLanguage || 'en'} 
                  onValueChange={(v) => handleSelectChange('preferredLanguage', v)}
                  disabled={!isEditing}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Language" />
                  </SelectTrigger>
                  <SelectContent>
                    {SUPPORTED_LANGUAGES.map((lang) => (
                      <SelectItem key={lang.code} value={lang.code}>{lang.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" value={formData.phone} onChange={handleInputChange} disabled={!isEditing} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="age">Age</Label>
                <Input id="age" type="number" value={formData.age} onChange={handleInputChange} disabled={!isEditing} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <Select 
                  value={formData.gender} 
                  onValueChange={(v) => handleSelectChange('gender', v)}
                  disabled={!isEditing}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input id="city" value={formData.city} onChange={handleInputChange} disabled={!isEditing} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="abhaId">ABHA ID</Label>
                <Input id="abhaId" value={formData.abhaId || ''} onChange={handleInputChange} disabled={!isEditing} placeholder="XX-XXXX-XXXX-XXXX" />
              </div>
              
              <div className="md:col-span-2 pt-4 border-t border-border">
                <h3 className="text-sm font-semibold text-primary uppercase mb-4">Emergency Contact</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="emergencyContactName">Contact Name</Label>
                    <Input id="emergencyContactName" value={formData.emergencyContactName} onChange={handleInputChange} disabled={!isEditing} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="emergencyContactPhone">Contact Phone</Label>
                    <Input id="emergencyContactPhone" value={formData.emergencyContactPhone} onChange={handleInputChange} disabled={!isEditing} />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}

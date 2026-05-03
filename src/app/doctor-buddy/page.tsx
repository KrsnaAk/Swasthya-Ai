'use client';

import React, { useState } from 'react';
import { AppShell } from '@/components/layout/app-shell';
import { useFirestore, useDoc, useMemoFirebase, useUser } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  UserPlus, 
  Stethoscope, 
  CheckCircle2, 
  MapPin, 
  Phone, 
  MessageSquare,
  Search,
  Loader2,
  ShieldCheck,
  AlertCircle,
  User as UserIcon
} from 'lucide-react';
import { useRouter } from 'next/navigation';

// Seeded Doctor Data for safe demo guidance without listing entire /users collection
const SEEDED_DOCTORS = [
  {
    id: "doc-001",
    name: "Dr. Anjali Sharma",
    specialization: "Cardiology",
    experienceYears: 12,
    clinicName: " Sharma Heart Center",
    clinicAddress: "Bandra West, Mumbai",
    phone: "+91 98200 12345",
    verified: true
  },
  {
    id: "doc-002",
    name: "Dr. Vikram Malhotra",
    specialization: "General Medicine",
    experienceYears: 8,
    clinicName: "Metro Clinic",
    clinicAddress: "Andheri East, Mumbai",
    phone: "+91 98211 54321",
    verified: true
  },
  {
    id: "doc-003",
    name: "Dr. Sanya Gupta",
    specialization: "Pediatrics",
    experienceYears: 15,
    clinicName: "Gupta Kids Clinic",
    clinicAddress: "Colaba, Mumbai",
    phone: "+91 98300 98765",
    verified: true
  }
];

export default function DoctorBuddyPage() {
  const db = useFirestore();
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const [filter, setFilter] = useState("");

  // Safely fetch ONLY the current user's profile
  const userDocRef = useMemoFirebase(() => {
    if (!db || !user?.uid) return null;
    return doc(db, 'users', user.uid);
  }, [db, user?.uid]);

  const { data: profile, isLoading: isProfileLoading } = useDoc(userDocRef);

  const filteredDoctors = SEEDED_DOCTORS.filter(d => 
    d.name.toLowerCase().includes(filter.toLowerCase()) || 
    d.specialization.toLowerCase().includes(filter.toLowerCase())
  );

  const handleStartChat = (doctor: any) => {
    if (!user) return;
    const chatId = [user.uid, doctor.id].sort().join('_');
    router.push(`/chat/${chatId}?with=${doctor.name}&role=patient`);
  };

  if (isUserLoading || isProfileLoading) {
    return (
      <AppShell>
        <div className="flex h-[60vh] w-full items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AppShell>
    );
  }

  if (!user) {
    return (
      <AppShell>
        <div className="max-w-md mx-auto py-20 text-center space-y-6">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
          <h2 className="text-xl font-bold">Authentication Required</h2>
          <p className="text-muted-foreground">Please login to use the Doctor Buddy clinical assistant.</p>
          <Button onClick={() => router.push('/login')}>Go to Login</Button>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Patient Profile Context Header */}
        <div className="bg-primary/5 border border-primary/20 p-6 rounded-2xl flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="bg-primary/10 p-3 rounded-xl text-primary">
              <UserIcon className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Consultation Context</h2>
              {profile ? (
                <p className="text-xs text-muted-foreground">
                  Logged in as <span className="text-primary font-bold">{profile.name}</span> • 
                  City: <span className="text-foreground">{profile.city || 'Not specified'}</span>
                </p>
              ) : (
                <p className="text-xs text-amber-500 font-bold">Patient profile not found. Please complete your profile.</p>
              )}
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={() => router.push('/profile')}>Manage Profile</Button>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
           <div>
              <h1 className="text-3xl font-headline font-bold">Doctor Buddy</h1>
              <p className="text-muted-foreground italic">Find and connect with verified healthcare professionals near you.</p>
           </div>
           <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search by name or specialization..." 
                className="pl-10 h-11"
                value={filter}
                onChange={e => setFilter(e.target.value)}
              />
           </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
           {filteredDoctors.map((doc) => (
             <Card key={doc.id} className="border-border hover:border-primary/40 transition-all group overflow-hidden">
               <CardHeader className="bg-muted/30 pb-4">
                  <div className="flex justify-between items-start">
                     <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform shadow-inner">
                        <Stethoscope className="h-6 w-6" />
                     </div>
                     <Badge variant="secondary" className="text-[9px] uppercase font-black bg-green-500/10 text-green-500 border-green-500/20">
                        <CheckCircle2 className="h-3 w-3 mr-1" /> Verified
                     </Badge>
                  </div>
                  <div className="mt-4">
                    <CardTitle className="text-lg">{doc.name}</CardTitle>
                    <p className="text-xs font-bold text-primary uppercase tracking-wider">{doc.specialization}</p>
                  </div>
               </CardHeader>
               <CardContent className="pt-6 space-y-4">
                  <div className="flex items-center gap-2 text-sm">
                     <ShieldCheck className="h-4 w-4 text-muted-foreground" />
                     <span>{doc.experienceYears} Years Experience</span>
                  </div>
                  <div className="flex items-start gap-2 text-sm">
                     <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                     <div className="space-y-0.5">
                        <p className="font-bold text-foreground">{doc.clinicName}</p>
                        <p className="text-xs text-muted-foreground leading-snug">{doc.clinicAddress}</p>
                     </div>
                  </div>
               </CardContent>
               <CardFooter className="grid grid-cols-2 gap-2 border-t border-border pt-4">
                  <Button variant="outline" className="w-full" asChild disabled={!doc.phone}>
                     <a href={`tel:${doc.phone}`}><Phone className="h-4 w-4 mr-2" /> Call</a>
                  </Button>
                  <Button className="w-full bg-primary" onClick={() => handleStartChat(doc)}>
                     <MessageSquare className="h-4 w-4 mr-2" /> Chat
                  </Button>
               </CardFooter>
             </Card>
           ))}
           
           {filteredDoctors.length === 0 && (
             <div className="col-span-full py-20 text-center space-y-4 opacity-50 border-2 border-dashed rounded-[2rem]">
                <UserPlus className="h-12 w-12 mx-auto" />
                <p>No verified doctors matching your search were found.</p>
             </div>
           )}
        </div>
      </div>
    </AppShell>
  );
}

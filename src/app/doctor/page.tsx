'use client';

import React, { useState } from 'react';
import { AppShell } from '@/components/layout/app-shell';
import { useFirestore, useUser, useDoc, useMemoFirebase } from '@/firebase';
import { doc, collection, query, where, getDocs, limit } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  User as UserIcon, 
  Phone, 
  MessageSquare, 
  Stethoscope, 
  History, 
  Activity, 
  ClipboardList,
  Loader2,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

export default function DoctorDashboard() {
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  const router = useRouter();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<any[]>([]);

  const userDocRef = useMemoFirebase(() => {
    if (!db || !user?.uid) return null;
    return doc(db, 'users', user.uid);
  }, [db, user?.uid]);

  const { data: profile } = useDoc(userDocRef);

  const seededPatient = {
    id: "0xzdXIIRsmSdZ7yspuY6s984q1Y2",
    name: "Madhav Ambani",
    abhaId: "91-7267-4417-6579",
    age: 35,
    gender: "Male",
    bloodGroup: "A+",
    city: "Mumbai",
    phone: "9999911111",
    emergencyContactName: "Mukesh Ambani",
    emergencyContactPhone: "6202128292",
    allergies: "Penicillin",
    existingDiseases: "Type 2 Diabetes, Hypertension",
    medications: "Metformin 500 mg (twice daily), Amlodipine 5 mg (once daily)",
    pastSurgeries: "Appendectomy (2015)",
    vaccinationNotes: "COVID-19 (2 doses + booster)",
    preferredLanguage: "en",
    role: "patient"
  };

  const handleSearch = async () => {
    if (!searchQuery || !db) return;
    setIsSearching(true);
    try {
      // Searching patients by patientId (ABHA) or name
      const usersRef = collection(db, 'users');
      const q = query(
        usersRef, 
        where('role', '==', 'patient'),
        where('abhaId', '==', searchQuery), // Primary search by ID
        limit(5)
      );
      
      let snapshot = await getDocs(q);
      let found: any[] = snapshot.docs.map(d => ({ ...d.data(), id: d.id }));

      if (found.length === 0) {
        // Fallback search by name (Note: real name search usually requires Algolia or lowercase fields)
        const nameQ = query(usersRef, where('role', '==', 'patient'), where('name', '==', searchQuery), limit(5));
        const nameSnapshot = await getDocs(nameQ);
        found = nameSnapshot.docs.map(d => ({ ...d.data(), id: d.id }));
      }

      // Logic to show seeded patient if no real results match
      if (found.length === 0) {
        const queryNorm = searchQuery.toLowerCase().trim();
        if (queryNorm === seededPatient.name.toLowerCase() || queryNorm === seededPatient.abhaId) {
          found = [seededPatient];
        }
      }

      setResults(found);
      if (found.length === 0) toast({ title: "No Patient Found", description: "Try searching by exact Patient ID." });
    } catch (e) {
      console.error(e);
      // Fallback search check even on network failure
      const queryNorm = searchQuery.toLowerCase().trim();
      if (queryNorm === seededPatient.name.toLowerCase() || queryNorm === seededPatient.abhaId) {
        setResults([seededPatient]);
      } else {
        toast({ variant: 'destructive', title: "Search Failed" });
      }
    } finally {
      setIsSearching(false);
    }
  };

  const startChat = (patient: any) => {
     const chatId = [user?.uid, patient.id].sort().join('_');
     router.push(`/chat/${chatId}?with=${patient.name}&role=doctor`);
  };

  return (
    <AppShell>
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Main Search Panel */}
          <div className="lg:col-span-8 space-y-6">
             <Card className="border-primary/20 bg-primary/5 shadow-xl">
               <CardHeader>
                 <CardTitle className="flex items-center gap-2">
                    <Search className="h-5 w-5 text-primary" />
                    Clinical Patient Search
                 </CardTitle>
                 <CardDescription>Search by exact Patient ID (ABHA) or registered full name.</CardDescription>
               </CardHeader>
               <CardContent>
                 <div className="flex gap-2">
                   <Input 
                     placeholder="e.g. 12-3456-7890-1234" 
                     className="bg-card h-12"
                     value={searchQuery}
                     onChange={e => setSearchQuery(e.target.value)}
                     onKeyDown={e => e.key === 'Enter' && handleSearch()}
                   />
                   <Button className="h-12 px-8 font-bold" onClick={handleSearch} disabled={isSearching}>
                     {isSearching ? <Loader2 className="animate-spin" /> : "FIND PATIENT"}
                   </Button>
                 </div>
               </CardContent>
             </Card>

             <div className="space-y-4">
                <h3 className="text-sm font-black uppercase text-muted-foreground tracking-widest px-1">Search Results</h3>
                {results.length > 0 ? results.map((patient) => (
                  <Card key={patient.id} className="border-border hover:border-primary/40 transition-colors">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start">
                        <div className="flex gap-4">
                           <div className="h-14 w-14 rounded-2xl bg-muted flex items-center justify-center">
                              <UserIcon className="h-8 w-8 text-muted-foreground" />
                           </div>
                           <div className="space-y-1">
                              <h4 className="text-xl font-bold">{patient.name}</h4>
                              <p className="text-xs font-mono text-primary uppercase font-bold tracking-widest">ID: {patient.abhaId || 'N/A'}</p>
                           </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" asChild disabled={!patient.phone}>
                             <a href={`tel:${patient.phone}`}><Phone className="h-4 w-4 mr-2" /> Call</a>
                          </Button>
                          <Button size="sm" onClick={() => startChat(patient)}>
                             <MessageSquare className="h-4 w-4 mr-2" /> Consultation Chat
                          </Button>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-6 pt-6 border-t border-border">
                         <div>
                            <p className="text-[10px] font-black text-muted-foreground uppercase">Age / Gender</p>
                            <p className="text-sm font-bold">{patient.age} / {patient.gender}</p>
                         </div>
                         <div>
                            <p className="text-[10px] font-black text-muted-foreground uppercase">Blood Group</p>
                            <p className="text-sm font-bold text-primary">{patient.bloodGroup || 'Not set'}</p>
                         </div>
                         <div className="col-span-2">
                            <p className="text-[10px] font-black text-muted-foreground uppercase">Chronic Conditions</p>
                            <p className="text-xs line-clamp-1">{patient.existingDiseases || 'None reported'}</p>
                         </div>
                      </div>
                    </CardContent>
                  </Card>
                )) : searchQuery && !isSearching && (
                   <div className="text-center py-12 border-2 border-dashed rounded-3xl opacity-30">
                      <AlertCircle className="h-12 w-12 mx-auto mb-2" />
                      <p>Use search bar to retrieve clinical profiles.</p>
                   </div>
                )}
             </div>
          </div>

          {/* Doctor Info Sidebar */}
          <div className="lg:col-span-4 space-y-6">
             <Card className="border-border bg-card">
               <CardHeader className="text-center">
                  <div className="mx-auto h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                     <Stethoscope className="h-10 w-10 text-primary" />
                  </div>
                  <CardTitle>{profile?.name}</CardTitle>
                  <div className="flex items-center justify-center gap-1 mt-1">
                    <CheckCircle2 className="h-3 w-3 text-green-500" />
                    <span className="text-[10px] font-black uppercase text-green-500">Verified Medical Professional</span>
                  </div>
               </CardHeader>
               <CardContent className="space-y-4 pt-4 border-t border-border">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Specialization</span>
                    <span className="font-bold">{profile?.specialization}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">License #</span>
                    <span className="font-mono text-xs">{profile?.licenseNumber}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Clinic</span>
                    <span className="font-bold text-right leading-tight">{profile?.clinicName}</span>
                  </div>
               </CardContent>
             </Card>

             <Card className="border-border">
               <CardHeader>
                  <CardTitle className="text-lg">Recent Activities</CardTitle>
               </CardHeader>
               <CardContent className="space-y-4 text-sm text-muted-foreground italic">
                  <p>Consultation history will appear here once you start interacting with patients.</p>
               </CardContent>
             </Card>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

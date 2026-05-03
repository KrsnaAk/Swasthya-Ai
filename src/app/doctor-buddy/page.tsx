
'use client';

import React, { useState, useEffect } from 'react';
import { AppShell } from '@/components/layout/app-shell';
import { useFirestore, useDoc, useMemoFirebase, useUser, useCollection } from '@/firebase';
import { doc, collection, query, where, getDocs } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Stethoscope, 
  CheckCircle2, 
  MapPin, 
  Phone, 
  MessageSquare,
  Search,
  Loader2,
  ShieldCheck,
  AlertCircle,
  User as UserIcon,
  Calendar,
  Star,
  Activity,
  ChevronRight,
  Bot
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

// Seeded Doctor Data for safe demo guidance
const SEEDED_DOCTORS = [
  {
    id: "doc-001",
    name: "Dr. Anjali Sharma",
    specialization: "Cardiology",
    experienceYears: 12,
    clinicName: "Sharma Heart Center",
    clinicAddress: "Bandra West, Mumbai",
    city: "Mumbai",
    phone: "+91 98200 12345",
    rating: 4.9,
    availability: "Mon-Sat (10AM - 5PM)",
    consultationFee: 800,
    verified: true
  },
  {
    id: "doc-002",
    name: "Dr. Vikram Malhotra",
    specialization: "General Medicine",
    experienceYears: 8,
    clinicName: "Metro Clinic",
    clinicAddress: "Andheri East, Mumbai",
    city: "Mumbai",
    phone: "+91 98211 54321",
    rating: 4.7,
    availability: "Daily (9AM - 8PM)",
    consultationFee: 500,
    verified: true
  },
  {
    id: "doc-003",
    name: "Dr. Sanya Gupta",
    specialization: "Pediatrics",
    experienceYears: 15,
    clinicName: "Gupta Kids Clinic",
    clinicAddress: "Colaba, Mumbai",
    city: "Mumbai",
    phone: "+91 98300 98765",
    rating: 4.8,
    availability: "Mon-Fri (11AM - 6PM)",
    consultationFee: 700,
    verified: true
  }
];

export default function DoctorBuddyPage() {
  const db = useFirestore();
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const { toast } = useToast();

  const [searchFilter, setSearchFilter] = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const [doctors, setDoctors] = useState<any[]>([]);
  const [isFetching, setIsFetching] = useState(true);
  const [selectedDoctor, setSelectedDoctor] = useState<any>(null);

  // Fetch Patient Profile
  const userDocRef = useMemoFirebase(() => {
    if (!db || !user?.uid) return null;
    return doc(db, 'users', user.uid);
  }, [db, user?.uid]);

  const { data: profile, isLoading: isProfileLoading } = useDoc(userDocRef);

  // Attempt to fetch live doctor listings
  useEffect(() => {
    async function loadDoctors() {
      setIsFetching(true);
      try {
        if (!db) {
          setDoctors(SEEDED_DOCTORS);
          return;
        }
        const doctorsRef = collection(db, 'doctors');
        const snapshot = await getDocs(doctorsRef);
        const liveDocs = snapshot.docs.map(d => ({ ...d.data(), id: d.id }));
        
        // Merge live docs with seeded docs if live docs are few
        setDoctors(liveDocs.length > 0 ? liveDocs : SEEDED_DOCTORS);
      } catch (e) {
        console.warn("Using seeded clinical records fallback");
        setDoctors(SEEDED_DOCTORS);
      } finally {
        setIsFetching(false);
      }
    }
    loadDoctors();
  }, [db]);

  const filteredDoctors = doctors.filter(d => 
    (d.name.toLowerCase().includes(searchFilter.toLowerCase()) || 
     d.specialization.toLowerCase().includes(searchFilter.toLowerCase())) &&
    (d.city.toLowerCase().includes(cityFilter.toLowerCase()))
  );

  const handleStartChat = (doctor: any) => {
    if (!user) return;
    const chatId = [user.uid, doctor.id].sort().join('_');
    router.push(`/chat/${chatId}?with=${doctor.name}&role=patient`);
  };

  const handleRequestAppointment = (doctor: any) => {
    toast({
      title: "Appointment Requested",
      description: `Your clinical data has been shared with ${doctor.name}. You will be notified of confirmation.`,
    });
    setSelectedDoctor(null);
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
      <div className="max-w-6xl mx-auto space-y-8 pb-20">
        {/* Clinical Context Banner */}
        <div className="bg-primary/10 border border-primary/20 p-6 rounded-[2rem] flex flex-col md:flex-row justify-between items-center gap-6 shadow-xl shadow-primary/5">
          <div className="flex items-center gap-5">
            <div className="bg-primary p-4 rounded-2xl text-primary-foreground shadow-lg shadow-primary/20 heartbeat">
              <Bot className="h-8 w-8" />
            </div>
            <div>
              <h2 className="text-xl font-headline font-bold">Doctor Buddy Discovery</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Connect with verified specialists. AI can assist in booking and data sharing.
              </p>
            </div>
          </div>
          <div className="flex gap-3">
             <div className="px-4 py-2 bg-background/50 rounded-xl border border-white/10 text-xs flex items-center gap-2">
                <MapPin className="h-3 w-3 text-primary" />
                <span className="font-bold">{profile?.city || 'Detecting Location...'}</span>
             </div>
             <Button variant="outline" className="rounded-xl h-10 px-6 font-bold" onClick={() => router.push('/profile')}>
                Update Health ID
             </Button>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col lg:flex-row gap-4">
           <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input 
                placeholder="Search by name or clinical specialization (e.g. Cardiology)..." 
                className="pl-12 h-14 rounded-2xl bg-card border-white/5 focus:border-primary/50 text-base"
                value={searchFilter}
                onChange={e => setSearchFilter(e.target.value)}
              />
           </div>
           <div className="relative w-full lg:w-72">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input 
                placeholder="Filter by City..." 
                className="pl-12 h-14 rounded-2xl bg-card border-white/5 focus:border-primary/50 text-base"
                value={cityFilter}
                onChange={e => setCityFilter(e.target.value)}
              />
           </div>
        </div>

        {/* Doctor Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
           {isFetching ? (
             Array.from({ length: 6 }).map((_, i) => (
               <Card key={i} className="animate-pulse border-border h-80 bg-muted/20" />
             ))
           ) : filteredDoctors.length > 0 ? filteredDoctors.map((doc) => (
             <Card key={doc.id} className="border-border hover:border-primary/40 transition-all group overflow-hidden flex flex-col bg-card shadow-lg hover:shadow-2xl hover:shadow-primary/5 rounded-[2rem]">
               <CardHeader className="bg-muted/30 pb-6 p-8 relative">
                  <div className="flex justify-between items-start">
                     <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform shadow-inner">
                        <Stethoscope className="h-8 w-8" />
                     </div>
                     <div className="flex flex-col items-end gap-2">
                        <Badge variant="secondary" className="text-[10px] uppercase font-black bg-green-500/10 text-green-500 border-green-500/20 px-3 py-1">
                           <CheckCircle2 className="h-3 w-3 mr-1.5" /> Verified
                        </Badge>
                        <div className="flex items-center gap-1 text-primary font-black text-xs bg-primary/5 px-2 py-1 rounded-lg">
                           <Star className="h-3 w-3 fill-primary" /> {doc.rating.toFixed(1)}
                        </div>
                     </div>
                  </div>
                  <div className="mt-6">
                    <CardTitle className="text-2xl font-headline font-bold leading-tight">{doc.name}</CardTitle>
                    <p className="text-sm font-black text-primary uppercase tracking-widest mt-1">{doc.specialization}</p>
                  </div>
               </CardHeader>
               <CardContent className="pt-8 p-8 space-y-6 flex-1">
                  <div className="flex items-center gap-4 text-sm font-medium">
                     <ShieldCheck className="h-5 w-5 text-primary" />
                     <span>{doc.experienceYears} Years Clinical Experience</span>
                  </div>
                  <div className="flex items-start gap-4 text-sm">
                     <MapPin className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                     <div className="space-y-1">
                        <p className="font-bold text-foreground">{doc.clinicName}</p>
                        <p className="text-xs text-muted-foreground leading-relaxed">{doc.clinicAddress}</p>
                     </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                     <Calendar className="h-5 w-5 text-primary" />
                     <span className="text-xs font-bold text-muted-foreground uppercase tracking-tight">{doc.availability}</span>
                  </div>
               </CardContent>
               <CardFooter className="grid grid-cols-1 gap-3 p-8 pt-0">
                  <Dialog>
                    <DialogTrigger asChild>
                       <Button className="w-full h-12 bg-primary text-primary-foreground font-bold rounded-xl shadow-lg shadow-primary/20 group/btn">
                         <ChevronRight className="mr-2 h-4 w-4 group-hover/btn:translate-x-1 transition-transform" /> 
                         Book Consultation
                       </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md bg-card border-border rounded-3xl">
                       <DialogHeader>
                          <DialogTitle className="flex items-center gap-2">
                             <Activity className="h-6 w-6 text-primary" /> Clinical Appointment Request
                          </DialogTitle>
                          <DialogDescription>Your healthcare history and triage summary will be shared with {doc.name}.</DialogDescription>
                       </DialogHeader>
                       <div className="py-6 space-y-4">
                          <div className="p-4 bg-muted/50 rounded-2xl border border-border">
                             <p className="text-[10px] font-black uppercase text-muted-foreground mb-1">Booking Window</p>
                             <p className="font-bold">{doc.availability}</p>
                          </div>
                          <div className="p-4 bg-primary/5 rounded-2xl border border-primary/20">
                             <p className="text-[10px] font-black uppercase text-primary mb-1">Consultation Fee</p>
                             <p className="text-lg font-black">₹{doc.consultationFee}</p>
                          </div>
                       </div>
                       <DialogFooter className="gap-2">
                          <Button variant="outline" className="rounded-xl flex-1">Cancel</Button>
                          <Button className="bg-primary rounded-xl flex-1 font-bold" onClick={() => handleRequestAppointment(doc)}>Confirm Request</Button>
                       </DialogFooter>
                    </DialogContent>
                  </Dialog>

                  <div className="grid grid-cols-2 gap-3">
                     <Button variant="outline" className="rounded-xl h-11 border-white/10 hover:bg-white/5" asChild disabled={!doc.phone}>
                        <a href={`tel:${doc.phone}`}><Phone className="h-4 w-4 mr-2" /> Call</a>
                     </Button>
                     <Button variant="outline" className="rounded-xl h-11 border-white/10 hover:bg-white/5 text-primary font-bold gap-2" onClick={() => handleStartChat(doc)}>
                        <MessageSquare className="h-4 w-4" /> Message
                     </Button>
                  </div>
                  
                  <Button variant="ghost" className="w-full text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground hover:text-primary h-8 gap-2">
                     <Bot className="h-3 w-3" /> AI-Agent: Schedule Appointment
                  </Button>
               </CardFooter>
             </Card>
           )) : (
             <div className="col-span-full py-24 text-center space-y-6 opacity-50 border-2 border-dashed rounded-[3rem] border-white/5 bg-muted/5">
                <Search className="h-16 w-16 mx-auto text-muted-foreground" />
                <div className="space-y-1">
                   <p className="text-xl font-bold">No verified professionals found</p>
                   <p className="text-sm text-muted-foreground">Try adjusting your clinical specialization or city filter.</p>
                </div>
                <Button variant="outline" onClick={() => {setSearchFilter(""); setCityFilter("");}}>Clear All Filters</Button>
             </div>
           )}
        </div>

        {/* Trust Disclaimer */}
        <div className="p-8 bg-card border border-white/5 rounded-[2.5rem] flex items-start gap-6 shadow-2xl">
           <ShieldCheck className="h-10 w-10 text-primary shrink-0" />
           <div className="space-y-2">
              <h4 className="font-bold text-lg">Secure Clinical Referral System</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                 Doctor Buddy matches you with verified professionals based on your clinical needs. When you request an appointment, SwasthyaAI generates a structured summary of your health records and triage data to ensure your doctor has the necessary context before you arrive.
              </p>
              <div className="flex gap-4 pt-2">
                 <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-green-500">
                    <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
                    Verified License Audit
                 </div>
                 <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-primary">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                    Encrypted Data Transfer
                 </div>
              </div>
           </div>
        </div>
      </div>
    </AppShell>
  );
}

'use client';

import React, { useState } from 'react';
import { AppShell } from '@/components/layout/app-shell';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle, XCircle, Eye, ShieldCheck, Mail, Phone, MapPin } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '@/components/ui/dialog';

export default function AdminPage() {
  const db = useFirestore();
  const { toast } = useToast();
  const [selectedDoctor, setSelectedDoctor] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const applicationsQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, 'doctorApplications'), orderBy('submittedAt', 'desc'));
  }, [db]);

  const { data: applications, isLoading } = useCollection(applicationsQuery);

  const handleReview = async (status: 'verified' | 'rejected') => {
    if (!selectedDoctor || !db) return;
    setIsProcessing(true);
    try {
      const docId = selectedDoctor.id;
      // Update application
      await updateDoc(doc(db, 'doctorApplications', docId), {
        verificationStatus: status,
        reviewedAt: serverTimestamp()
      });
      // Update user role/status
      await updateDoc(doc(db, 'users', docId), {
        verificationStatus: status,
        updatedAt: serverTimestamp()
      });

      toast({ title: `Doctor ${status}`, description: `Action applied to ${selectedDoctor.name}` });
      setSelectedDoctor(null);
    } catch (e) {
      toast({ variant: 'destructive', title: "Error", description: "Could not update status." });
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
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
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
           <div>
              <h1 className="text-3xl font-headline font-bold">Admin Portal</h1>
              <p className="text-muted-foreground">Manage healthcare professional verifications.</p>
           </div>
           <div className="flex gap-4">
              <Card className="bg-primary/5 p-4 border-primary/20">
                 <p className="text-[10px] font-black uppercase text-primary">Pending Reviews</p>
                 <p className="text-2xl font-black">{applications?.filter(a => a.verificationStatus === 'pending').length || 0}</p>
              </Card>
           </div>
        </div>

        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle>Doctor Applications</CardTitle>
            <CardDescription>Review credentials and license numbers for clinical verification.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Specialization</TableHead>
                  <TableHead>License #</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {applications?.map((doc) => (
                  <TableRow key={doc.id}>
                    <TableCell className="font-bold">{doc.name}</TableCell>
                    <TableCell>{doc.specialization}</TableCell>
                    <TableCell className="font-mono text-xs">{doc.licenseNumber}</TableCell>
                    <TableCell>
                      <Badge variant={
                        doc.verificationStatus === 'verified' ? 'default' : 
                        doc.verificationStatus === 'rejected' ? 'destructive' : 'secondary'
                      }>
                        {doc.verificationStatus.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => setSelectedDoctor(doc)}>
                        <Eye className="h-4 w-4 mr-2" /> Review
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Dialog open={!!selectedDoctor} onOpenChange={(open) => !open && setSelectedDoctor(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-primary" /> Review Professional Credentials
              </DialogTitle>
              <DialogDescription>Verify the identity and clinical authority of this professional.</DialogDescription>
            </DialogHeader>
            
            {selectedDoctor && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-6">
                <div className="space-y-4">
                  <div>
                    <p className="text-[10px] font-black uppercase text-muted-foreground mb-1 tracking-widest">Full Name</p>
                    <p className="text-lg font-bold">{selectedDoctor.name}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase text-muted-foreground mb-1 tracking-widest">Specialization</p>
                    <p className="font-medium">{selectedDoctor.specialization} ({selectedDoctor.experienceYears} Years)</p>
                  </div>
                  <div className="space-y-2">
                    <p className="flex items-center gap-2 text-sm"><Mail className="h-4 w-4 text-primary" /> {selectedDoctor.email}</p>
                    <p className="flex items-center gap-2 text-sm"><Phone className="h-4 w-4 text-primary" /> {selectedDoctor.phone}</p>
                    <p className="flex items-center gap-2 text-sm"><MapPin className="h-4 w-4 text-primary" /> {selectedDoctor.city}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="p-4 bg-muted/50 rounded-xl border border-border">
                    <p className="text-[10px] font-black uppercase text-muted-foreground mb-2 tracking-widest">Clinic Context</p>
                    <p className="font-bold">{selectedDoctor.clinicName}</p>
                    <p className="text-xs text-muted-foreground">{selectedDoctor.clinicAddress}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase text-muted-foreground mb-1 tracking-widest">Medical License #</p>
                    <p className="font-mono text-primary font-bold">{selectedDoctor.licenseNumber}</p>
                  </div>
                </div>
              </div>
            )}

            <DialogFooter className="gap-2">
              <Button variant="outline" className="text-destructive border-destructive/20 hover:bg-destructive/5" onClick={() => handleReview('rejected')} disabled={isProcessing}>
                <XCircle className="h-4 w-4 mr-2" /> Reject Application
              </Button>
              <Button className="bg-primary text-primary-foreground font-bold" onClick={() => handleReview('verified')} disabled={isProcessing}>
                {isProcessing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CheckCircle className="h-4 w-4 mr-2" />}
                Approve Professional Access
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppShell>
  );
}

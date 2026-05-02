'use client';

import React, { useState } from 'react';
import { AppShell } from '@/components/layout/app-shell';
import { useFirestore, useCollection, useMemoFirebase, useUser, useDoc } from '@/firebase';
import { collection, query, orderBy, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  Loader2, 
  CheckCircle, 
  XCircle, 
  Eye, 
  ShieldCheck, 
  Mail, 
  Phone, 
  MapPin, 
  FileText, 
  ExternalLink,
  ClipboardCheck,
  Briefcase,
  AlertTriangle,
  LogOut,
  Lock
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { useRouter } from 'next/navigation';

export default function AdminPage() {
  const db = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();
  const router = useRouter();
  
  const [selectedDoctor, setSelectedDoctor] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  const userDocRef = useMemoFirebase(() => {
    if (!db || !user?.uid) return null;
    return doc(db, 'users', user.uid);
  }, [db, user?.uid]);

  const { data: profile, isLoading: isProfileLoading } = useDoc(userDocRef);

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
      const updateData = {
        verificationStatus: status,
        reviewedAt: serverTimestamp(),
        reviewedBy: user?.uid,
        rejectionReason: status === 'rejected' ? rejectionReason : null
      };

      // Update application
      await updateDoc(doc(db, 'doctorApplications', docId), updateData);
      // Update user role/status
      await updateDoc(doc(db, 'users', docId), {
        verificationStatus: status,
        updatedAt: serverTimestamp()
      });

      toast({ title: `Doctor ${status}`, description: `Action applied to ${selectedDoctor.name}` });
      setSelectedDoctor(null);
      setRejectionReason('');
    } catch (e) {
      toast({ variant: 'destructive', title: "Error", description: "Could not update status." });
    } finally {
      setIsProcessing(false);
    }
  };

  if (isProfileLoading || isLoading) {
    return (
      <AppShell>
        <div className="flex h-[60vh] w-full items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AppShell>
    );
  }

  // Double-check real admin status
  if (profile?.role !== 'admin') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-8">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="bg-destructive/10 p-8 rounded-full w-fit mx-auto shadow-2xl">
            <Lock className="h-16 w-16 text-destructive" />
          </div>
          <h1 className="text-3xl font-headline font-bold">Access Restricted</h1>
          <p className="text-muted-foreground leading-relaxed">
            You must have administrator privileges to access this area.
          </p>
          <Button onClick={() => router.push('/')} className="rounded-xl px-8 bg-primary">Back to Safety</Button>
        </div>
      </div>
    );
  }

  return (
    <AppShell>
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
           <div>
              <h1 className="text-3xl font-headline font-bold">Admin Portal</h1>
              <p className="text-muted-foreground">Manage healthcare professional verifications and proofs.</p>
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
            <CardTitle>Professional Applications</CardTitle>
            <CardDescription>Review clinical credentials, medical licenses, and degree certificates.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Full Name</TableHead>
                  <TableHead>Specialization</TableHead>
                  <TableHead>License #</TableHead>
                  <TableHead>Documents</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {applications?.map((doc) => (
                  <TableRow key={doc.id}>
                    <TableCell className="font-bold">{doc.name}</TableCell>
                    <TableCell>{doc.specialization}</TableCell>
                    <TableCell className="font-mono text-xs text-primary">{doc.licenseNumber}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {doc.degreeUrl && <Badge variant="outline" className="text-[9px]"><FileText className="h-2 w-2 mr-1" /> Degree</Badge>}
                        {doc.licenseUrl && <Badge variant="outline" className="text-[9px]"><ClipboardCheck className="h-2 w-2 mr-1" /> License</Badge>}
                      </div>
                    </TableCell>
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
                        <Eye className="h-4 w-4 mr-2" /> Audit
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {(!applications || applications.length === 0) && !isLoading && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-10 text-muted-foreground italic">
                      No clinical applications found in records.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Dialog open={!!selectedDoctor} onOpenChange={(open) => !open && setSelectedDoctor(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-xl">
                <ShieldCheck className="h-6 w-6 text-primary" /> Professional Credential Audit
              </DialogTitle>
              <DialogDescription>Verify the identity and clinical authority of this professional against uploaded proofs.</DialogDescription>
            </DialogHeader>
            
            {selectedDoctor && (
              <div className="space-y-8 py-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-4 md:col-span-2">
                    <div className="grid grid-cols-2 gap-6">
                       <div>
                          <p className="text-[10px] font-black uppercase text-muted-foreground mb-1 tracking-widest">Full Name</p>
                          <p className="text-lg font-bold">{selectedDoctor.name}</p>
                       </div>
                       <div>
                          <p className="text-[10px] font-black uppercase text-muted-foreground mb-1 tracking-widest">Experience</p>
                          <p className="font-medium flex items-center gap-2"><Briefcase className="h-4 w-4 text-primary" /> {selectedDoctor.experienceYears} Years</p>
                       </div>
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                       <div>
                          <p className="text-[10px] font-black uppercase text-muted-foreground mb-1 tracking-widest">Medical License #</p>
                          <p className="font-mono text-primary font-bold">{selectedDoctor.licenseNumber}</p>
                       </div>
                       <div>
                          <p className="text-[10px] font-black uppercase text-muted-foreground mb-1 tracking-widest">Registration Council</p>
                          <p className="font-bold">{selectedDoctor.registrationCouncil}</p>
                       </div>
                    </div>
                    <div className="space-y-2 border-t border-border pt-4">
                       <p className="flex items-center gap-2 text-sm"><Mail className="h-4 w-4 text-primary" /> {selectedDoctor.email}</p>
                       <p className="flex items-center gap-2 text-sm"><Phone className="h-4 w-4 text-primary" /> {selectedDoctor.phone}</p>
                       <p className="flex items-center gap-2 text-sm"><MapPin className="h-4 w-4 text-primary" /> {selectedDoctor.city}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="p-4 bg-muted/50 rounded-xl border border-border">
                      <p className="text-[10px] font-black uppercase text-muted-foreground mb-2 tracking-widest">Clinical Workplace</p>
                      <p className="font-bold text-sm">{selectedDoctor.clinicName}</p>
                      <p className="text-xs text-muted-foreground leading-snug">{selectedDoctor.clinicAddress || 'Address not provided'}</p>
                    </div>

                    <div className="space-y-3">
                       <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Verification Proofs</p>
                       {selectedDoctor.degreeUrl && (
                         <Button variant="outline" className="w-full justify-start h-11" asChild>
                           <a href={selectedDoctor.degreeUrl} target="_blank" rel="noopener noreferrer">
                              <FileText className="h-4 w-4 mr-2 text-primary" /> Degree Certificate <ExternalLink className="h-3 w-3 ml-auto opacity-50" />
                           </a>
                         </Button>
                       )}
                       {selectedDoctor.licenseUrl && (
                         <Button variant="outline" className="w-full justify-start h-11" asChild>
                           <a href={selectedDoctor.licenseUrl} target="_blank" rel="noopener noreferrer">
                              <ClipboardCheck className="h-4 w-4 mr-2 text-primary" /> License Proof <ExternalLink className="h-3 w-3 ml-auto opacity-50" />
                           </a>
                         </Button>
                       )}
                    </div>
                  </div>
                </div>

                {selectedDoctor.verificationStatus === 'pending' && (
                  <div className="space-y-4 border-t border-border pt-6">
                    <Label className="text-xs font-bold uppercase">Decision Context / Rejection Reason</Label>
                    <Textarea 
                      placeholder="Enter reason if rejecting (e.g. License proof unclear, Registration Council mismatch)..."
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      className="bg-muted/30"
                    />
                  </div>
                )}
              </div>
            )}

            <DialogFooter className="gap-3 border-t border-border pt-6">
              <Button 
                variant="outline" 
                className="text-destructive border-destructive/20 hover:bg-destructive/5 font-bold" 
                onClick={() => handleReview('rejected')} 
                disabled={isProcessing || (selectedDoctor?.verificationStatus === 'pending' && !rejectionReason.trim())}
              >
                <XCircle className="h-4 w-4 mr-2" /> Reject Credentials
              </Button>
              <Button 
                className="bg-primary text-primary-foreground font-black px-8" 
                onClick={() => handleReview('verified')} 
                disabled={isProcessing}
              >
                {isProcessing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CheckCircle className="h-4 w-4 mr-2" />}
                APPROVE PROFESSIONAL ACCESS
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppShell>
  );
}

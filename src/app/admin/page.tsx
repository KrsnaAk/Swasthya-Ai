'use client';

import React, { useState, useEffect } from 'react';
import { AppShell } from '@/components/layout/app-shell';
import { useFirestore, useUser, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
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
  Lock,
  Database,
  RefreshCcw
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { useRouter } from 'next/navigation';
import { firebaseConfig } from '@/firebase/config';

export default function AdminPage() {
  const db = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();
  const router = useRouter();
  
  const [applications, setApplications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);
  const [selectedDoctor, setSelectedDoctor] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  const userDocRef = useMemoFirebase(() => {
    if (!db || !user?.uid) return null;
    return doc(db, 'users', user.uid);
  }, [db, user?.uid]);

  const { data: profile, isLoading: isProfileLoading } = useDoc(userDocRef);

  const fetchApplications = async () => {
    if (!user) return;
    setIsLoading(true);
    setApiError(null);
    try {
      const token = await user.getIdToken();
      const response = await fetch('/api/admin/doctor-applications', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setApplications(data.applications || []);
      } else {
        setApiError(data.error || 'Failed to load applications');
      }
    } catch (e: any) {
      setApiError(e.message || 'Network error fetching applications');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchApplications();
    }
  }, [user]);

  const handleReview = async (status: 'verified' | 'rejected') => {
    if (!selectedDoctor || !user) return;
    setIsProcessing(true);
    try {
      const token = await user.getIdToken();
      const endpoint = status === 'verified' ? '/api/admin/verify-doctor' : '/api/admin/reject-doctor';
      const body = {
        doctorUid: selectedDoctor.id,
        rejectionReason: status === 'rejected' ? rejectionReason : null
      };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(body)
      });

      const data = await response.json();

      if (data.success) {
        toast({ title: `Doctor ${status}`, description: `Action applied to ${selectedDoctor.name}` });
        setSelectedDoctor(null);
        setRejectionReason('');
        fetchApplications();
      } else {
        toast({ variant: 'destructive', title: "Error", description: data.error || "Could not update status." });
      }
    } catch (e: any) {
      toast({ variant: 'destructive', title: "Error", description: e.message || "Failed to process review." });
    } finally {
      setIsProcessing(false);
    }
  };

  if (isProfileLoading) {
    return (
      <AppShell>
        <div className="flex h-[60vh] w-full items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AppShell>
    );
  }

  const isAuthorized = profile?.role === 'admin' || user?.uid === "Zn1wDP2cfzNglUFfGyVQAi64qSk2";

  if (!isAuthorized) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-8">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="bg-destructive/10 p-8 rounded-full w-fit mx-auto shadow-2xl">
            <Lock className="h-16 w-16 text-destructive" />
          </div>
          <h1 className="text-3xl font-headline font-bold">Access Restricted</h1>
          <p className="text-muted-foreground leading-relaxed">
            Administrative privileges required. Please verify your role with the clinical data architect.
          </p>
          <Button onClick={() => router.push('/')} className="rounded-xl px-8 bg-primary">Back to Safety</Button>
        </div>
      </div>
    );
  }

  return (
    <AppShell>
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="p-4 bg-muted/40 border border-white/5 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4 text-[10px] font-mono">
           <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                 <Database className="h-3 w-3 text-primary" />
                 <span className="text-muted-foreground uppercase font-black">Project:</span> 
                 <span className="text-primary font-bold">{firebaseConfig.projectId}</span>
              </div>
              <div className="flex items-center gap-2">
                 <ShieldCheck className="h-3 w-3 text-primary" />
                 <span className="text-muted-foreground uppercase font-black">UID:</span> 
                 <span className="text-foreground">{user?.uid}</span>
              </div>
           </div>
           {apiError && (
             <div className="flex items-center gap-2 text-destructive font-bold animate-pulse">
                <AlertTriangle className="h-3 w-3" />
                <span>API ERROR: {apiError}</span>
             </div>
           )}
        </div>

        <div className="flex justify-between items-center">
           <div>
              <h1 className="text-3xl font-headline font-bold">Admin Portal</h1>
              <p className="text-muted-foreground">Manage healthcare professional verifications.</p>
           </div>
           <div className="flex gap-4">
              <Button variant="outline" size="sm" onClick={fetchApplications} disabled={isLoading}>
                 {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <RefreshCcw className="h-4 w-4 mr-2" />}
                 Refresh List
              </Button>
              <Card className="bg-primary/5 px-4 py-2 border-primary/20 flex flex-col justify-center">
                 <p className="text-[9px] font-black uppercase text-primary leading-none mb-1">Pending Reviews</p>
                 <p className="text-xl font-black leading-none">{applications?.filter(a => a.verificationStatus === 'pending').length || 0}</p>
              </Card>
           </div>
        </div>

        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle>Professional Applications</CardTitle>
            <CardDescription>Review clinical credentials and medical licenses.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Full Name</TableHead>
                  <TableHead>Specialization</TableHead>
                  <TableHead>License #</TableHead>
                  <TableHead>Proofs</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-20">
                      <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-2" />
                      <p className="text-muted-foreground font-medium">Fetching clinical records...</p>
                    </TableCell>
                  </TableRow>
                ) : applications.length > 0 ? (
                  applications.map((doc) => (
                    <TableRow key={doc.id}>
                      <TableCell className="font-bold">{doc.name}</TableCell>
                      <TableCell>{doc.specialization}</TableCell>
                      <TableCell className="font-mono text-xs text-primary">{doc.licenseNumber || doc.medicalLicenseNumber}</TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <div className="flex gap-2">
                            {(doc.degreeUrl || doc.degreeFileName) && <Badge variant="outline" className="text-[9px] bg-primary/5">Degree</Badge>}
                            {(doc.licenseUrl || doc.licenseFileName) && <Badge variant="outline" className="text-[9px] bg-primary/5">License</Badge>}
                          </div>
                          {doc.documentUploadStatus === 'pending_storage_setup' && (
                            <span className="text-[8px] text-amber-500 font-bold uppercase tracking-tighter">Storage Pending</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={
                          doc.verificationStatus === 'verified' ? 'default' : 
                          doc.verificationStatus === 'rejected' ? 'destructive' : 'secondary'
                        }>
                          {doc.verificationStatus?.toUpperCase() || 'UNKNOWN'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" onClick={() => setSelectedDoctor(doc)}>
                          <Eye className="h-4 w-4 mr-2" /> Audit
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-20 text-muted-foreground italic">
                      No clinical applications found in backend records.
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
              <DialogDescription>Verify the identity and clinical authority of this professional.</DialogDescription>
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
                          <p className="font-mono text-primary font-bold">{selectedDoctor.licenseNumber || selectedDoctor.medicalLicenseNumber}</p>
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
                       {selectedDoctor.documentUploadStatus === 'pending_storage_setup' && (
                         <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl space-y-2">
                           <div className="flex items-center gap-2 text-amber-500">
                             <AlertTriangle className="h-4 w-4" />
                             <p className="text-[10px] font-black uppercase">Upload Pending</p>
                           </div>
                           <p className="text-[10px] text-muted-foreground leading-tight">
                             The following files were selected but couldn't be uploaded (Storage not configured):
                           </p>
                           <ul className="text-[9px] font-mono text-foreground space-y-1">
                             {selectedDoctor.degreeFileName && <li>• {selectedDoctor.degreeFileName} (Degree)</li>}
                             {selectedDoctor.licenseFileName && <li>• {selectedDoctor.licenseFileName} (License)</li>}
                           </ul>
                         </div>
                       )}
                       {(!selectedDoctor.degreeUrl && !selectedDoctor.licenseUrl && selectedDoctor.documentUploadStatus !== 'pending_storage_setup') && (
                         <p className="text-[10px] text-muted-foreground italic bg-muted/30 p-3 rounded-lg">No digital documents attached to this record.</p>
                       )}
                    </div>
                  </div>
                </div>

                {selectedDoctor.verificationStatus === 'pending' && (
                  <div className="space-y-4 border-t border-border pt-6">
                    <Label className="text-xs font-bold uppercase tracking-widest text-primary flex items-center gap-2">
                       Decision Context / Rejection Reason
                    </Label>
                    <Textarea 
                      placeholder="Enter reason if rejecting..."
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      className="bg-muted/30 rounded-2xl min-h-[100px]"
                    />
                  </div>
                )}
              </div>
            )}

            <DialogFooter className="gap-3 border-t border-border pt-6">
              <Button 
                variant="outline" 
                className="text-destructive border-destructive/20 hover:bg-destructive/5 font-bold rounded-xl px-6" 
                onClick={() => handleReview('rejected')} 
                disabled={isProcessing || (selectedDoctor?.verificationStatus === 'pending' && !rejectionReason.trim())}
              >
                {isProcessing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <XCircle className="h-4 w-4 mr-2" />}
                REJECT
              </Button>
              <Button 
                className="bg-primary text-primary-foreground font-black px-10 rounded-xl shadow-xl shadow-primary/20" 
                onClick={() => handleReview('verified')} 
                disabled={isProcessing || selectedDoctor?.verificationStatus === 'verified'}
              >
                {isProcessing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CheckCircle className="h-4 w-4 mr-2" />}
                APPROVE DOCTOR
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppShell>
  );
}

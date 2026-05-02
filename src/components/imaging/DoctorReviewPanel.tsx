'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Stethoscope, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  MessageSquare,
  ShieldAlert
} from 'lucide-react';
import { useFirestore } from '@/firebase';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

interface DoctorReviewPanelProps {
  reportId: string;
  currentStatus: string;
  onUpdate: (data: any) => void;
}

export function DoctorReviewPanel({ reportId, currentStatus, onUpdate }: DoctorReviewPanelProps) {
  const [status, setStatus] = useState(currentStatus);
  const [notes, setDoctorNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const db = useFirestore();
  const { toast } = useToast();

  const handleUpdate = async () => {
    if (!db) return;
    setSaving(true);
    try {
      const reportRef = doc(db, 'medical_imaging_reports', reportId);
      await updateDoc(reportRef, {
        reviewStatus: status,
        doctorNotes: notes,
        reviewedAt: serverTimestamp(),
        isDoctor: true // Mock authorization flag for demo
      });
      
      onUpdate({ reviewStatus: status, doctorNotes: notes });
      toast({ title: "Report Finalized", description: "Review workflow updated successfully." });
    } catch (e) {
      console.error(e);
      toast({ title: "Error", description: "Could not save review data.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest flex items-center gap-2">
           <Stethoscope className="h-3 w-3" /> Review Action
        </Label>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="h-12 bg-background/50 border-white/10 rounded-xl font-bold">
            <SelectValue placeholder="Select Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pending">Stay Pending</SelectItem>
            <SelectItem value="reviewed">Approve Report</SelectItem>
            <SelectItem value="needs_recheck">Request Recheck</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest flex items-center gap-2">
           <MessageSquare className="h-3 w-3" /> Clinical Validation Notes
        </Label>
        <Textarea 
          placeholder="Add findings confirmation or follow-up instructions..."
          className="min-h-[120px] bg-background/50 rounded-2xl border-white/10"
          value={notes}
          onChange={e => setDoctorNotes(e.target.value)}
        />
      </div>

      <Button 
        className="w-full h-14 bg-primary text-primary-foreground font-black text-base shadow-xl shadow-primary/20 rounded-2xl transition-all active:scale-95"
        onClick={handleUpdate}
        disabled={saving}
      >
        {saving ? (
          <><Loader2 className="h-5 w-5 animate-spin mr-2" /> PROCESSING...</>
        ) : (
          <><CheckCircle2 className="h-5 w-5 mr-2" /> SUBMIT CLINICAL REVIEW</>
        )}
      </Button>

      <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-xl flex items-start gap-3">
         <ShieldAlert className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
         <p className="text-[9px] text-destructive-foreground/80 leading-relaxed font-bold uppercase tracking-tight">
            Final submission creates a permanent legal clinical record. ensure all observations are verified.
         </p>
      </div>
    </div>
  );
}

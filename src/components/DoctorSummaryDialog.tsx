
'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/card"; // Using card since basic shadcn dialog was missing in provided files but I will use standard Dialog from radix/shadcn if available
import { 
  Dialog as ShadcnDialog, 
  DialogContent as ShadcnDialogContent, 
  DialogHeader as ShadcnDialogHeader, 
  DialogTitle as ShadcnDialogTitle, 
  DialogDescription as ShadcnDialogDescription,
  DialogFooter as ShadcnDialogFooter,
  DialogTrigger as ShadcnDialogTrigger
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FileText, Loader2, Copy, Check, Share2 } from 'lucide-react';
import { generateDoctorSummary, type DoctorSummaryInput } from '@/ai/flows/doctor-summary-flow';
import { useToast } from '@/hooks/use-toast';
import { useFirestore } from '@/firebase';
import { collection, serverTimestamp } from 'firebase/firestore';
import { addDocumentNonBlocking } from '@/firebase/non-blocking-updates';

interface DoctorSummaryDialogProps {
  input: DoctorSummaryInput;
  userId: string;
  trigger?: React.ReactNode;
}

export function DoctorSummaryDialog({ input, userId, trigger }: DoctorSummaryDialogProps) {
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  const db = useFirestore();

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const result = await generateDoctorSummary(input);
      setSummary(result.formattedSummary);
      
      // Save to Firestore
      if (db) {
        const summariesRef = collection(db, 'users', userId, 'doctorSummaries');
        addDocumentNonBlocking(summariesRef, {
          userId,
          summaryText: result.formattedSummary,
          createdAt: serverTimestamp(),
          triageRef: input.currentTriage ? 'active_session' : null
        });
      }
    } catch (e) {
      toast({
        title: "Error",
        description: "Could not generate clinical summary.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (summary) {
      navigator.clipboard.writeText(summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({ title: "Copied", description: "Summary copied to clipboard." });
    }
  };

  return (
    <ShadcnDialog onOpenChange={(open) => !open && setSummary(null)}>
      <ShadcnDialogTrigger asChild>
        {trigger || (
          <Button variant="outline" className="gap-2">
            <FileText className="h-4 w-4" /> Generate Doctor Summary
          </Button>
        )}
      </ShadcnDialogTrigger>
      <ShadcnDialogContent className="max-w-2xl bg-card border-border">
        <ShadcnDialogHeader>
          <ShadcnDialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Clinical Consultation Summary
          </ShadcnDialogTitle>
          <ShadcnDialogDescription>
            A professional summary of your current health state and history for your doctor.
          </ShadcnDialogDescription>
        </ShadcnDialogHeader>

        <div className="py-4">
          {!summary ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <div className="p-4 bg-primary/10 rounded-full">
                <FileText className="h-12 w-12 text-primary" />
              </div>
              <p className="text-sm text-muted-foreground text-center max-w-xs">
                AI will process your health records and current symptoms to create a clinical summary.
              </p>
              <Button onClick={handleGenerate} disabled={loading} className="font-bold">
                {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Preparing Summary...</> : "Generate Summary Now"}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <ScrollArea className="h-[350px] w-full rounded-md border border-border p-4 bg-muted/30">
                <div className="whitespace-pre-wrap text-sm leading-relaxed font-mono">
                  {summary}
                </div>
              </ScrollArea>
              <div className="flex gap-2">
                <Button onClick={handleCopy} variant="secondary" className="flex-1 gap-2">
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  {copied ? "Copied" : "Copy to Clipboard"}
                </Button>
                <Button variant="outline" className="gap-2" onClick={() => {
                   if (navigator.share) {
                    navigator.share({
                      title: 'My Clinical Summary - SwasthyaAI',
                      text: summary
                    });
                  } else {
                    handleCopy();
                  }
                }}>
                  <Share2 className="h-4 w-4" /> Share
                </Button>
              </div>
            </div>
          )}
        </div>

        <ShadcnDialogFooter className="text-[10px] text-muted-foreground italic border-t border-border pt-4">
          This summary is based strictly on your provided data. It is intended for informational use only and does not constitute a medical diagnosis.
        </ShadcnDialogFooter>
      </ShadcnDialogContent>
    </ShadcnDialog>
  );
}

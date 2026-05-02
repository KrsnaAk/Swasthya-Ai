'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Activity, 
  AlertCircle, 
  CheckCircle2, 
  ExternalLink, 
  ShieldCheck, 
  Info,
  Clock,
  ChevronRight,
  Search,
  ShieldAlert
} from 'lucide-react';
import { ImagingAnalysisReport } from '@/types/imaging';
import { cn } from '@/lib/utils';

export function ImagingReport({ report }: { report: ImagingAnalysisReport }) {
  const { aiOutput, reviewStatus } = report;

  // Defensive array mapping
  const keyFindings = Array.isArray(aiOutput?.key_findings) ? aiOutput.key_findings : [];
  const possibleConcerns = Array.isArray(aiOutput?.possible_concerns) ? aiOutput.possible_concerns : [];
  const recommendations = Array.isArray(aiOutput?.recommendations) ? aiOutput.recommendations : [];
  const researchContext = Array.isArray(aiOutput?.research_context) ? aiOutput.research_context : [];
  const urgentFlags = Array.isArray(aiOutput?.urgent_flags) ? aiOutput.urgent_flags : [];

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 bg-card border border-border p-8 rounded-[2rem] shadow-xl">
        <div className="flex items-center gap-4">
          <div className={cn(
            "p-3 rounded-2xl shadow-lg",
            reviewStatus === 'pending' ? "bg-amber-500/10 text-amber-500" : "bg-green-500/10 text-green-500"
          )}>
            <FileText className="h-8 w-8" />
          </div>
          <div>
            <h2 className="text-2xl font-bold font-headline">Clinical Imaging Report</h2>
            <div className="flex items-center gap-3 mt-1">
              <Badge variant="outline" className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5">
                Ref: {report.id}
              </Badge>
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="h-3 w-3" /> {new Date(report.createdAt?.seconds * 1000 || report.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <Badge 
            variant={reviewStatus === 'pending' ? 'secondary' : 'default'}
            className={cn(
              "h-10 px-6 rounded-xl font-bold uppercase tracking-tighter",
              reviewStatus === 'pending' && "bg-amber-500/20 text-amber-600 border-amber-500/30"
            )}
          >
            {reviewStatus === 'pending' ? 'Pending Review' : 'Clinically Validated'}
          </Badge>
          <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
            AI Confidence: {aiOutput?.confidence_score}%
          </div>
        </div>
      </div>

      {urgentFlags.length > 0 && (
        <div className="bg-destructive/10 border-2 border-destructive/20 p-6 rounded-3xl flex items-start gap-4">
          <ShieldAlert className="h-6 w-6 text-destructive shrink-0" />
          <div>
            <h4 className="text-destructive font-black uppercase text-xs tracking-widest mb-1">Urgent Clinical Markers</h4>
            <div className="flex flex-wrap gap-2">
              {urgentFlags.map((flag, i) => (
                <Badge key={i} variant="destructive" className="text-[9px] uppercase font-bold">{flag}</Badge>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Core Findings */}
        <Card className="border-border bg-card shadow-lg">
          <CardHeader className="bg-muted/20 border-b border-border">
            <CardTitle className="text-lg flex items-center gap-2">
              <Search className="h-5 w-5 text-primary" />
              Direct Observations
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
             <div className="flex justify-between items-center text-sm border-b border-border pb-3">
               <span className="text-muted-foreground font-medium uppercase text-[10px] tracking-widest">Modality</span>
               <span className="font-bold text-primary">{aiOutput?.image_type || "N/A"}</span>
             </div>
             <div className="flex justify-between items-center text-sm border-b border-border pb-3">
               <span className="text-muted-foreground font-medium uppercase text-[10px] tracking-widest">Technical Quality</span>
               <span className="font-bold">{aiOutput?.image_quality || "N/A"}</span>
             </div>
             <div className="space-y-3 pt-2">
                <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Key Findings</p>
                {keyFindings.length > 0 ? (
                  <ul className="space-y-2">
                    {keyFindings.map((f, i) => (
                      <li key={i} className="text-sm flex items-start gap-2 bg-muted/30 p-3 rounded-xl border border-white/5">
                        <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-muted-foreground italic">No specific clinical findings reported.</p>
                )}
             </div>
          </CardContent>
        </Card>

        {/* Clinical Impression */}
        <Card className="border-border bg-card shadow-lg">
          <CardHeader className="bg-muted/20 border-b border-border">
            <CardTitle className="text-lg flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              Impression & Concerns
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
             <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10">
                <p className="text-sm leading-relaxed font-medium text-foreground/90 italic">"{aiOutput?.summary || "Clinical impression unavailable."}"</p>
             </div>
             <div className="space-y-3">
                <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Potential Pathologies</p>
                {possibleConcerns.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {possibleConcerns.map((c, i) => (
                      <Badge key={i} variant="outline" className="bg-destructive/5 text-destructive border-destructive/20 font-bold uppercase text-[9px] py-1">
                          {c}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground italic">No specific potential concerns identified.</p>
                )}
             </div>
             <div className="p-4 bg-muted/40 rounded-2xl border border-border">
                <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mb-2">Uncertainty & Limitations</p>
                <p className="text-xs text-muted-foreground leading-relaxed">{aiOutput?.uncertainty || "Standard limitations apply."}</p>
             </div>
          </CardContent>
        </Card>
      </div>

      {/* Patient Friendly Section */}
      <Card className="border-primary/20 bg-primary/5 shadow-xl border-l-4 border-l-primary rounded-[2rem] overflow-hidden">
        <CardHeader className="bg-primary/5 border-b border-primary/10 p-8">
           <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-primary/20 flex items-center justify-center text-primary shadow-inner">
                 <ShieldCheck className="h-6 w-6" />
              </div>
              <div>
                 <CardTitle className="text-xl font-bold">What this means for you</CardTitle>
                 <CardDescription className="uppercase text-[9px] font-black tracking-[0.2em] mt-1 text-primary">Accessible Clinical Guidance</CardDescription>
              </div>
           </div>
        </CardHeader>
        <CardContent className="p-8 space-y-8">
           <p className="text-xl leading-relaxed font-medium text-foreground/90">{aiOutput?.patient_explanation || aiOutput?.summary}</p>
           
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                 <h4 className="text-[10px] font-black uppercase text-primary tracking-widest flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4" /> Recommended Steps
                 </h4>
                 {recommendations.length > 0 ? (
                    <ul className="space-y-3">
                      {recommendations.map((step, i) => (
                        <li key={i} className="text-sm font-bold bg-background/50 p-4 rounded-2xl border border-primary/10 flex items-center gap-3 group hover:border-primary/30 transition-colors">
                          <ChevronRight className="h-4 w-4 text-primary group-hover:translate-x-1 transition-transform" />
                          {step}
                        </li>
                      ))}
                    </ul>
                 ) : (
                    <p className="text-xs text-muted-foreground italic">Follow professional clinical advice.</p>
                 )}
              </div>
              <div className="space-y-4">
                 <h4 className="text-[10px] font-black uppercase text-primary tracking-widest flex items-center gap-2">
                    <Info className="h-4 w-4" /> Medical Research Context
                 </h4>
                 {researchContext.length > 0 ? (
                    <div className="space-y-3">
                      {researchContext.map((res, i) => (
                        <div key={i} className="p-4 bg-background/50 rounded-2xl border border-border group cursor-help transition-all hover:bg-background">
                          <h5 className="text-xs font-bold flex items-center justify-between">
                              {res.title}
                              <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </h5>
                          <p className="text-[10px] text-muted-foreground mt-1 leading-relaxed line-clamp-2">{res.snippet}</p>
                        </div>
                      ))}
                    </div>
                 ) : (
                    <p className="text-xs text-muted-foreground italic">No research citations available.</p>
                 )}
              </div>
           </div>
        </CardContent>
      </Card>

      <div className="p-8 bg-card border border-border rounded-[2rem] text-center space-y-4">
         <AlertCircle className="h-10 w-10 text-muted-foreground/30 mx-auto" />
         <div className="max-w-2xl mx-auto space-y-2">
            <h4 className="font-bold text-sm">Regulatory Disclosure</h4>
            <p className="text-xs text-muted-foreground leading-relaxed italic">
              {aiOutput?.disclaimer || "This summary is based strictly on your provided data. It is intended for informational use only and does not constitute a medical diagnosis."}
            </p>
         </div>
      </div>
    </div>
  );
}

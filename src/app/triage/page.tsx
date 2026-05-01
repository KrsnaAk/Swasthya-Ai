"use client";

import React, { useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Mic, Send, Info, RefreshCcw, AlertTriangle, ShieldAlert, Home, Building2, HelpCircle, Stethoscope } from "lucide-react";
import { aiSymptomTriage, type AiSymptomTriageOutput } from "@/ai/flows/ai-symptom-triage-flow";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

export default function TriagePage() {
  const [symptoms, setSymptoms] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AiSymptomTriageOutput | null>(null);
  const [recording, setRecording] = useState(false);
  const { toast } = useToast();

  const handleTriage = async () => {
    if (!symptoms.trim()) {
      toast({
        title: "Empty Symptoms",
        description: "Please describe how you are feeling.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const output = await aiSymptomTriage({ symptoms });
      setResult(output);
    } catch (error) {
      toast({
        title: "Analysis Failed",
        description: "We couldn't process your request. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const resetTriage = () => {
    setSymptoms("");
    setResult(null);
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'emergency': return <ShieldAlert className="h-10 w-10 text-destructive" />;
      case 'hospital': return <Building2 className="h-10 w-10 text-accent" />;
      case 'clinic visit': return <Building2 className="h-10 w-10 text-primary" />;
      case 'home care': return <Home className="h-10 w-10 text-green-500" />;
      default: return <HelpCircle className="h-10 w-10 text-muted-foreground" />;
    }
  };

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto space-y-6">
        {!result ? (
          <Card className="border-border bg-card shadow-xl overflow-hidden">
            <CardHeader className="bg-primary/5 border-b border-border pb-8">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-primary rounded-lg">
                  <Stethoscope className="h-6 w-6 text-primary-foreground" />
                </div>
                <CardTitle className="text-2xl font-headline">AI Symptom Triage</CardTitle>
              </div>
              <CardDescription className="text-base">
                Describe your symptoms in detail. You can use text or voice input. Our AI will guide you on the next steps.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <div className="relative">
                <Textarea 
                  placeholder="e.g., I have a persistent headache and feel nauseous since this morning..."
                  className="min-h-[200px] text-lg p-6 bg-background/50 border-2 border-border focus:border-primary transition-all resize-none"
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                  disabled={loading}
                />
                <div className="absolute bottom-4 right-4 flex items-center gap-2">
                  <Button 
                    variant={recording ? "destructive" : "secondary"}
                    size="icon" 
                    className={cn("rounded-full h-12 w-12", recording && "animate-pulse")}
                    onClick={() => {
                      setRecording(!recording);
                      if (!recording) {
                        toast({ title: "Voice Input", description: "Listening... (Simulated)" });
                      }
                    }}
                    disabled={loading}
                  >
                    <Mic className="h-6 w-6" />
                  </Button>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-4 bg-muted rounded-xl text-sm text-muted-foreground border border-border">
                <Info className="h-5 w-5 shrink-0 text-primary" />
                <p>
                  <strong>Disclaimer:</strong> This tool provides preliminary guidance only and is <strong>not a medical diagnosis</strong>. In case of severe chest pain, difficulty breathing, or other life-threatening symptoms, call emergency services immediately.
                </p>
              </div>
            </CardContent>
            <CardFooter className="p-8 pt-0 flex justify-end">
              <Button 
                onClick={handleTriage} 
                disabled={loading} 
                size="lg"
                className="w-full md:w-auto px-12 py-6 text-lg font-bold bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                {loading ? (
                  <span className="flex items-center gap-3">
                    <RefreshCcw className="h-5 w-5 animate-spin" />
                    Analyzing Symptoms...
                  </span>
                ) : (
                  <span className="flex items-center gap-3">
                    <Send className="h-5 w-5" />
                    Analyze Now
                  </span>
                )}
              </Button>
            </CardFooter>
          </Card>
        ) : (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Card className="border-border overflow-hidden">
              <div className={cn(
                "h-2 w-full",
                result.severity === 'emergency' ? "bg-destructive" : 
                result.severity === 'hospital' ? "bg-accent" : 
                result.severity === 'clinic visit' ? "bg-primary" : "bg-green-500"
              )} />
              <CardHeader className="flex flex-row items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-3xl font-headline">Assessment Results</CardTitle>
                  <CardDescription>Based on your reported symptoms</CardDescription>
                </div>
                <div className="bg-muted p-3 rounded-2xl">
                  {getSeverityIcon(result.severity)}
                </div>
              </CardHeader>
              <CardContent className="p-8 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h4 className="font-headline font-semibold text-xl flex items-center gap-2">
                      <AlertTriangle className="h-6 w-6 text-primary" />
                      Perceived Severity
                    </h4>
                    <div className="p-4 rounded-xl bg-muted border border-border">
                      <span className="text-2xl font-bold uppercase tracking-wider text-foreground">
                        {result.severity}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h4 className="font-headline font-semibold text-xl">What you should do:</h4>
                    <p className="text-lg text-muted-foreground leading-relaxed">
                      {result.nextSteps}
                    </p>
                  </div>
                </div>

                <div className="p-6 bg-destructive/10 border border-destructive/20 rounded-xl space-y-2">
                  <p className="text-sm font-semibold text-accent flex items-center gap-2">
                    <ShieldAlert className="h-5 w-5" />
                    Medical Disclaimer
                  </p>
                  <p className="text-sm text-muted-foreground italic">
                    {result.disclaimer}
                  </p>
                </div>
              </CardContent>
              <CardFooter className="bg-muted p-6 flex flex-col md:flex-row gap-4 items-center justify-between border-t border-border">
                <Button variant="outline" onClick={resetTriage} className="w-full md:w-auto">
                  <RefreshCcw className="mr-2 h-4 w-4" /> Start New Assessment
                </Button>
                <div className="flex gap-4 w-full md:w-auto">
                  <Button asChild variant="secondary" className="flex-1 md:flex-none">
                    <Link href="/history">Save to History</Link>
                  </Button>
                  <Button asChild className="bg-primary text-primary-foreground flex-1 md:flex-none">
                    <Link href="/facilities">Find Nearest Help</Link>
                  </Button>
                </div>
              </CardFooter>
            </Card>
          </div>
        )}
      </div>
    </AppShell>
  );
}

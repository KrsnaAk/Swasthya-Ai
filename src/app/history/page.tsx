
import React from "react";
import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Download, Eye, FileText, Filter } from "lucide-react";

export default function HistoryPage() {
  const historyData = [
    {
      id: "TR-1290",
      date: "2023-11-15",
      symptoms: "Mild chest discomfort, sweating",
      severity: "emergency",
      outcome: "Hospital Admission",
    },
    {
      id: "TR-1285",
      date: "2023-11-12",
      symptoms: "Persistent dry cough, mild fever",
      severity: "clinic visit",
      outcome: "Prescription Given",
    },
    {
      id: "TR-1277",
      date: "2023-10-28",
      symptoms: "Slight headache, fatigue",
      severity: "home care",
      outcome: "Rest Recommended",
    },
    {
      id: "TR-1260",
      date: "2023-10-15",
      symptoms: "Severe abdominal pain, vomiting",
      severity: "hospital",
      outcome: "Observation",
    }
  ];

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'emergency': return <Badge variant="destructive" className="uppercase text-[10px] px-3">Emergency</Badge>;
      case 'hospital': return <Badge className="bg-accent text-white uppercase text-[10px] px-3">Hospital</Badge>;
      case 'clinic visit': return <Badge variant="secondary" className="bg-primary text-primary-foreground uppercase text-[10px] px-3">Clinic</Badge>;
      default: return <Badge variant="outline" className="uppercase text-[10px] px-3">Home Care</Badge>;
    }
  };

  return (
    <AppShell>
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-headline font-bold">Health History</h1>
            <p className="text-muted-foreground">Detailed summary of your past triage assessments and healthcare interactions.</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" /> Filter
            </Button>
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" /> Export All
            </Button>
          </div>
        </div>

        <Card className="border-border">
          <CardHeader className="p-0"></CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="w-[100px]">ID</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="max-w-md">Symptoms Reported</TableHead>
                  <TableHead>Severity</TableHead>
                  <TableHead>Outcome</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {historyData.map((item) => (
                  <TableRow key={item.id} className="hover:bg-muted/30 transition-colors">
                    <TableCell className="font-mono text-xs font-semibold">{item.id}</TableCell>
                    <TableCell className="whitespace-nowrap">{item.date}</TableCell>
                    <TableCell className="max-w-md truncate font-medium">{item.symptoms}</TableCell>
                    <TableCell>{getSeverityBadge(item.severity)}</TableCell>
                    <TableCell className="text-muted-foreground">{item.outcome}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" title="View Details">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" title="Download Record">
                          <FileText className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
          <Card className="bg-primary/5 border-primary/20">
            <CardHeader>
              <CardTitle className="text-lg">ABHA Integration</CardTitle>
              <CardDescription>Your history here is synchronized with your digital health ID.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">You have 4 records linked from external providers in the last 3 months.</p>
              <Button variant="link" className="p-0 text-primary h-auto">Sync Now</Button>
            </CardContent>
          </Card>
          <Card className="bg-accent/5 border-accent/20">
            <CardHeader>
              <CardTitle className="text-lg">Secure Data</CardTitle>
              <CardDescription>All triage sessions are end-to-end encrypted.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">Records are stored in Firebase Cloud Firestore with strict access controls.</p>
              <Button variant="link" className="p-0 text-accent h-auto">Security Settings</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}

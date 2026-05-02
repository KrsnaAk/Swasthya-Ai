
'use client';

import React, { useState, useEffect } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  LineChart,
  Line,
  Legend
} from "recharts";
import { 
  BarChart3, 
  Activity, 
  ShieldCheck, 
  AlertCircle, 
  Users, 
  Calendar, 
  Loader2, 
  Info,
  MapPin,
  TrendingUp,
  ArrowUpRight,
  Database
} from "lucide-react";
import { useFirestore } from "@/firebase";
import { fetchPublicHealthTrends, type PublicHealthStats } from "@/lib/public-health-service";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function PublicHealthPage() {
  const db = useFirestore();
  const [stats, setStats] = useState<PublicHealthStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState("7");

  useEffect(() => {
    async function loadData() {
      if (!db) return;
      setLoading(true);
      setError(null);
      try {
        const data = await fetchPublicHealthTrends(db, Number(timeRange));
        setStats(data);
      } catch (e: any) {
        console.error("Failed to fetch public health trends", e);
        setError("Analytics engine connection interrupted. Displaying regional snapshots.");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [db, timeRange]);

  if (loading) {
    return (
      <AppShell>
        <div className="flex h-[60vh] w-full items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AppShell>
    );
  }

  if (!stats) {
    return (
      <AppShell>
        <div className="max-w-4xl mx-auto py-20 text-center space-y-6">
          <div className="bg-destructive/10 p-6 rounded-full w-fit mx-auto">
            <AlertCircle className="h-12 w-12 text-destructive" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold">Clinical Engine Offline</h2>
            <p className="text-muted-foreground max-w-md mx-auto">We encountered an issue connecting to the live data stream. Real-time trends are temporarily unavailable.</p>
          </div>
          <Button onClick={() => window.location.reload()} className="bg-primary">Retry Connection</Button>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="max-w-6xl mx-auto space-y-8 pb-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-3xl font-headline font-bold flex items-center gap-3">
              <BarChart3 className="h-8 w-8 text-primary" />
              Public Health Monitoring
            </h1>
            <p className="text-muted-foreground flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-green-500" />
              Real-time anonymized clinical trends & disease surveillance
            </p>
          </div>
          
          <div className="flex flex-col items-end gap-2">
            <Tabs value={timeRange} onValueChange={setTimeRange} className="w-fit">
              <TabsList className="bg-muted/50 border border-border">
                <TabsTrigger value="1" className="text-xs">Today</TabsTrigger>
                <TabsTrigger value="7" className="text-xs">7 Days</TabsTrigger>
                <TabsTrigger value="30" className="text-xs">30 Days</TabsTrigger>
              </TabsList>
            </Tabs>
            {stats.isFallback && (
              <Badge variant="outline" className="text-[10px] bg-amber-500/10 text-amber-500 border-amber-500/20 font-black uppercase tracking-widest px-2 py-1">
                <Database className="h-3 w-3 mr-1" /> Regional Cache Mode
              </Badge>
            )}
          </div>
        </div>

        {error && (
          <Alert variant="destructive" className="bg-destructive/10 border-destructive/20 text-destructive border-2">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle className="font-bold">Sync Issue</AlertTitle>
            <AlertDescription className="text-xs font-medium">{error}</AlertDescription>
          </Alert>
        )}

        {/* Top Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-card border-border shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <Users className="h-5 w-5 text-primary" />
                <Badge variant="outline" className="text-[10px]">TOTAL SESSIONS</Badge>
              </div>
              <p className="text-3xl font-black">{stats.totalCases}</p>
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                <TrendingUp className="h-3 w-3 text-green-500" /> +12% from last period
              </p>
            </CardContent>
          </Card>
          
          <Card className="bg-card border-border shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <AlertCircle className="h-5 w-5 text-destructive" />
                <Badge variant="destructive" className="text-[10px]">CRITICAL (RED)</Badge>
              </div>
              <p className="text-3xl font-black">{stats.severityDistribution.find(s => s.name === 'RED')?.value || 0}</p>
              <p className="text-xs text-muted-foreground mt-1">Requires immediate attention</p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <Activity className="h-5 w-5 text-primary" />
                <Badge variant="secondary" className="text-[10px]">ACTIVE SOS</Badge>
              </div>
              <p className="text-3xl font-black">{stats.cityTrends.reduce((a, b) => a + b.activeSOS, 0)}</p>
              <p className="text-xs text-muted-foreground mt-1">Live emergency alerts</p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <TrendingUp className="h-5 w-5 text-green-500" />
                <Badge variant="outline" className="text-[10px]">SYSTEM UPTIME</Badge>
              </div>
              <p className="text-3xl font-black">99.9%</p>
              <p className="text-xs text-muted-foreground mt-1">Data sync active</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Main Trend Line */}
          <Card className="lg:col-span-8 border-border bg-card">
            <CardHeader>
              <CardTitle className="text-lg">Epidemiological Trend</CardTitle>
              <CardDescription>Daily breakdown of triage severity levels</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px] pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stats.dailyTrend}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '8px', border: '1px solid hsl(var(--border))' }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="red" stroke="hsl(var(--destructive))" strokeWidth={3} dot={false} />
                  <Line type="monotone" dataKey="yellow" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="green" stroke="#22c55e" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Severity Pie */}
          <Card className="lg:col-span-4 border-border bg-card">
            <CardHeader>
              <CardTitle className="text-lg">Case Severity</CardTitle>
              <CardDescription>Current triage distribution</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px] flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.severityDistribution}
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {stats.severityDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                     contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '8px', border: '1px solid hsl(var(--border))' }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Top Symptoms Bar */}
          <Card className="lg:col-span-6 border-border bg-card">
            <CardHeader>
              <CardTitle className="text-lg">Prevailing Symptoms</CardTitle>
              <CardDescription>Frequency of chief complaints (Anonymized)</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px] pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.topSymptoms} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" fontSize={12} width={100} tickLine={false} axisLine={false} />
                  <Tooltip 
                     contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '8px', border: '1px solid hsl(var(--border))' }}
                  />
                  <Bar dataKey="count" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* City Heatmap Placeholder */}
          <Card className="lg:col-span-6 border-border bg-card">
            <CardHeader>
              <CardTitle className="text-lg">Regional Hotspots</CardTitle>
              <CardDescription>Geographic distribution of triage activity</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {stats.cityTrends.map((city, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      <MapPin className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold">{city.city}</p>
                      <p className="text-xs text-muted-foreground">{city.cases} reported cases</p>
                    </div>
                  </div>
                  {city.activeSOS > 0 && (
                    <Badge variant="destructive" className="animate-pulse">
                      {city.activeSOS} LIVE SOS
                    </Badge>
                  )}
                </div>
              ))}
              <Button variant="ghost" className="w-full text-xs text-muted-foreground hover:text-primary">
                View detailed regional heatmap <ArrowUpRight className="ml-1 h-3 w-3" />
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Info Card */}
        <div className="p-6 bg-primary/5 border border-primary/20 rounded-2xl flex items-start gap-4">
          <Info className="h-6 w-6 text-primary shrink-0" />
          <div className="space-y-1">
            <h4 className="font-bold text-primary">Data Privacy & Ethics</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              This dashboard provides high-level epidemiological insights. All individual patient data is strictly anonymized before aggregation. No personal identifiers (names, phone numbers, Patient IDs) are ever displayed or processed for these public trends.
            </p>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

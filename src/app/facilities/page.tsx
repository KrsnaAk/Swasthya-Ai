"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Search, 
  MapPin, 
  Navigation, 
  Phone, 
  Clock, 
  Star, 
  Loader2, 
  Filter, 
  AlertCircle,
  Stethoscope,
  Building2,
  Activity,
  Siren,
  ShieldAlert
} from "lucide-react";
import Image from "next/image";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Badge } from "@/components/ui/badge";
import { getNearbyHospitals, getGoogleMapsUrl, type Hospital, type FacilityType } from "@/lib/hospital-service";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

function FacilitiesContent() {
  const searchParams = useSearchParams();
  const initialFilter = searchParams.get('type') || 'all';
  
  const mapImage = PlaceHolderImages.find(img => img.id === 'hospital-map');
  const [searchQuery, setSearchQuery] = useState("");
  const [mode, setMode] = useState<"sos" | "search">("search");
  const [activeFilter, setActiveFilter] = useState(initialFilter);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [locationStatus, setLocationStatus] = useState<"idle" | "requesting" | "denied" | "ready">("idle");

  useEffect(() => {
    if (mode === 'sos') {
      handleRequestLocation();
    } else {
      loadHospitals();
    }
  }, [mode, activeFilter]);

  const loadHospitals = async (query?: string) => {
    setLoading(true);
    try {
      const data = await getNearbyHospitals(query || searchQuery, activeFilter);
      setHospitals(data);
    } catch (e) {
      console.error("Failed to load facilities", e);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestLocation = () => {
    setLocationStatus("requesting");
    if (typeof window !== "undefined" && "geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          setLocationStatus("ready");
          setActiveFilter("emergency");
          loadHospitals(); // In real app, this would use lat/lng
        },
        () => {
          setLocationStatus("denied");
          setMode("search");
          loadHospitals();
        }
      );
    } else {
      setLocationStatus("denied");
      setMode("search");
    }
  };

  const handleManualSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadHospitals();
  };

  const getBadgeVariant = (type: FacilityType) => {
    switch (type) {
      case 'Specialized Emergency': return 'destructive';
      case 'Public Hospital': return 'secondary';
      case 'Private Hospital': return 'default';
      default: return 'outline';
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full max-w-7xl mx-auto">
      {/* Sidebar List */}
      <div className="lg:col-span-4 flex flex-col gap-6 overflow-hidden">
        <div className="space-y-4">
          {/* Mode Selector */}
          <div className="bg-muted/50 p-1 rounded-xl flex">
            <button 
              onClick={() => setMode('search')}
              className={cn(
                "flex-1 py-2 text-xs font-black uppercase tracking-widest rounded-lg transition-all flex items-center justify-center gap-2",
                mode === 'search' ? "bg-card text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Search className="h-3.5 w-3.5" /> Search Mode
            </button>
            <button 
              onClick={() => setMode('sos')}
              className={cn(
                "flex-1 py-2 text-xs font-black uppercase tracking-widest rounded-lg transition-all flex items-center justify-center gap-2",
                mode === 'sos' ? "bg-destructive text-white shadow-lg" : "text-muted-foreground hover:text-destructive"
              )}
            >
              <Siren className="h-3.5 w-3.5" /> SOS Mode
            </button>
          </div>

          {mode === 'search' ? (
            <form onSubmit={handleManualSearch} className="flex gap-2">
              <div className="relative flex-1">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Enter city, state or facility..." 
                  className="pl-9 bg-card border-border h-11"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button type="submit" size="icon" className="h-11 w-11 bg-primary text-primary-foreground">
                <Search className="h-4 w-4" />
              </Button>
            </form>
          ) : (
            <div className="p-4 rounded-2xl bg-destructive/10 border border-destructive/20 space-y-3">
              <div className="flex items-center gap-3">
                <ShieldAlert className="h-5 w-5 text-destructive" />
                <p className="text-xs font-black text-destructive uppercase tracking-widest leading-none">Emergency Proximity Activation</p>
              </div>
              <p className="text-[10px] text-muted-foreground leading-tight">
                SOS mode automatically identifies the nearest emergency centers based on your current live location.
              </p>
              <Button variant="destructive" className="w-full h-9 text-xs font-bold gap-2" asChild>
                <a href="tel:108"><Phone className="h-3.5 w-3.5" /> Call 108 Immediately</a>
              </Button>
            </div>
          )}

          <div className="overflow-x-auto no-scrollbar pb-1">
            <div className="flex gap-2">
              {['all', 'emergency', 'hospital', 'clinic', 'government', 'private'].map((f) => (
                <button
                  key={f}
                  onClick={() => setActiveFilter(f)}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest whitespace-nowrap border transition-all",
                    activeFilter === f 
                      ? "bg-primary border-primary text-primary-foreground" 
                      : "bg-muted/50 border-white/5 text-muted-foreground hover:text-foreground"
                  )}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto pr-2 space-y-4">
          {loading ? (
            <div className="flex flex-col h-40 items-center justify-center gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Scanning Healthcare Network...</p>
            </div>
          ) : hospitals.length > 0 ? (
            hospitals.map((h) => (
              <Card key={h.id} className="cursor-pointer hover:border-primary/50 transition-all group overflow-hidden border-white/5 bg-card/40 backdrop-blur-sm">
                <CardHeader className="p-4 pb-2">
                  <div className="flex justify-between items-start">
                    <Badge variant={getBadgeVariant(h.type)} className="mb-2 text-[9px] uppercase tracking-[0.2em] font-black">
                      {h.type}
                    </Badge>
                    <div className="flex items-center gap-1 text-sm font-semibold text-primary">
                      <Star className="h-3.5 w-3.5 fill-primary" /> {h.rating}
                    </div>
                  </div>
                  <CardTitle className="text-lg group-hover:text-primary transition-colors leading-tight font-headline">
                    {h.name}
                  </CardTitle>
                  <CardDescription className="flex items-center gap-1 text-[11px] mt-1 line-clamp-1">
                    <MapPin className="h-3 w-3 shrink-0" /> {h.address}
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4 pt-0 space-y-3">
                  <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <Navigation className="h-3 w-3" /> {h.distance} away
                    </span>
                    <span className={h.status.includes('Open 24/7') ? "text-green-500" : "text-amber-500"}>
                      <Clock className="h-3 w-3 inline mr-1" /> {h.status}
                    </span>
                  </div>
                  <div className="flex gap-2 pt-1">
                    <Button variant="outline" size="sm" className="flex-1 h-10 rounded-xl border-white/10 hover:bg-white/5" asChild>
                      <a href={`tel:${h.phone.replace(/\s/g, '')}`}>
                        <Phone className="mr-2 h-3.5 w-3.5" /> Call
                      </a>
                    </Button>
                    <Button size="sm" className="flex-1 h-10 rounded-xl bg-primary text-primary-foreground font-black uppercase text-[10px] tracking-widest shadow-lg shadow-primary/20" asChild>
                      <a href={getGoogleMapsUrl(h)} target="_blank" rel="noopener noreferrer">
                        Navigate
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center py-20 px-4 border border-dashed border-white/10 rounded-3xl">
              <AlertCircle className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground">No facilities found</p>
              <p className="text-[11px] text-muted-foreground/60 mt-2 leading-relaxed">Try adjusting your filters, searching for a larger city (like Bhopal or Mumbai), or enabling location services.</p>
            </div>
          )}
        </div>
      </div>

      {/* Map View */}
      <div className="lg:col-span-8 min-h-[400px] h-full relative">
        <Card className="h-full border-white/5 bg-muted/20 overflow-hidden relative shadow-2xl rounded-3xl">
          {mapImage && (
            <div className="absolute inset-0 grayscale contrast-125 opacity-40">
              <Image 
                src={mapImage.imageUrl} 
                alt={mapImage.description} 
                fill 
                className="object-cover"
                data-ai-hint={mapImage.imageHint}
              />
            </div>
          )}
          
          {/* Simulated Map Markers */}
          <div className="absolute inset-0 p-8 pointer-events-none">
            {hospitals.slice(0, 4).map((h, i) => (
              <div 
                key={h.id}
                className="absolute animate-in zoom-in duration-500"
                style={{ 
                  top: `${20 + (i * 15)}%`, 
                  left: `${15 + (i * 20)}%` 
                }}
              >
                <div className="relative group pointer-events-auto cursor-pointer">
                  <div className={cn(
                    "h-10 w-10 rounded-full flex items-center justify-center shadow-2xl border-2 border-white",
                    h.isEmergencyReady ? "bg-destructive" : "bg-primary"
                  )}>
                    <Building2 className="h-5 w-5 text-white" />
                  </div>
                  <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap bg-card/90 backdrop-blur-md px-2 py-0.5 rounded text-[10px] font-bold border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity">
                    {h.name}
                  </ts>
                </div>
              </div>
            ))}
          </div>

          <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent pointer-events-none" />
          
          <div className="absolute top-6 right-6 flex flex-col gap-3">
            <Button variant="secondary" size="icon" className="rounded-2xl shadow-2xl bg-card/60 backdrop-blur-xl border border-white/10 h-12 w-12 hover:scale-110 transition-transform">
              <Navigation className="h-6 w-6 text-primary" />
            </Button>
            <div className="bg-card/60 backdrop-blur-xl border border-white/10 rounded-2xl p-2 flex flex-col gap-2">
              <div className="h-3 w-3 rounded-full bg-primary" />
              <div className="h-3 w-3 rounded-full bg-destructive" />
            </div>
          </div>

          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-full max-w-lg px-6">
            <div className="bg-card/40 backdrop-blur-3xl p-6 rounded-[2rem] shadow-2xl border border-white/10 flex items-center gap-6 animate-in slide-in-from-bottom-8 duration-700">
              <div className="h-16 w-16 rounded-[1.25rem] bg-primary/20 flex items-center justify-center text-primary shrink-0 heartbeat">
                <Activity className="h-8 w-8" />
              </div>
              <div className="space-y-1">
                <p className="text-base font-black uppercase tracking-widest medical-gradient-text">Live Clinical Network</p>
                <p className="text-[11px] text-muted-foreground leading-relaxed font-medium">
                  {locationStatus === 'ready' 
                    ? "Your location is active. High-priority trauma centers have been highlighted for immediate intervention."
                    : "Enter a city to explore local facility capacity and clinical triage status."}
                </p>
                {locationStatus === 'denied' && (
                  <p className="text-[9px] text-destructive font-bold uppercase tracking-tighter mt-1">Location permission denied. Using manual search.</p>
                )}
              </div>
            </div>
          </div>

          {/* Demo Badge */}
          <div className="absolute top-6 left-6">
            <Badge variant="outline" className="bg-background/40 backdrop-blur-md border-white/10 text-[9px] uppercase tracking-widest font-black py-1 px-3 rounded-full">
              Demo Data Interface
            </Badge>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default function FacilitiesPage() {
  return (
    <AppShell>
      <Suspense fallback={
        <div className="flex h-[60vh] w-full items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }>
        <div className="h-full space-y-6">
          <div className="flex flex-col gap-1">
            <h1 className="text-3xl font-headline font-black text-foreground">Facility Finder</h1>
            <p className="text-sm text-muted-foreground font-medium">Navigate to high-priority emergency centers or search for local clinics.</p>
          </div>
          <FacilitiesContent />
        </div>
      </Suspense>
    </AppShell>
  );
}

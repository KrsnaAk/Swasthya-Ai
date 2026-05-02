"use client";

import React, { useState, useEffect, Suspense, useRef } from "react";
import { useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Search, 
  MapPin, 
  Phone, 
  Clock, 
  Star, 
  Loader2, 
  AlertCircle,
  Siren,
  Crosshair,
  AlertTriangle
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getNearbyHospitals, getGoogleMapsUrl, type Hospital, type FacilityType } from "@/lib/hospital-service";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

// Dynamically import the map component
const FacilityMap = dynamic(() => import("./FacilityMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full rounded-3xl bg-muted/20 flex flex-col items-center justify-center gap-4 border border-white/5 shadow-2xl">
      <Loader2 className="h-10 w-10 animate-spin text-primary" />
      <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">Initializing Live Network...</p>
    </div>
  ),
});

const DEFAULT_CENTER = { lat: 23.2599, lng: 77.4126 }; // Bhopal

function FacilitiesContent() {
  const searchParams = useSearchParams();
  const initialFilter = searchParams.get('type') || 'all';
  const { toast } = useToast();
  const searchInputRef = useRef<HTMLInputElement>(null);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [mode, setMode] = useState<"sos" | "search">("search");
  const [activeFilter, setActiveFilter] = useState(initialFilter);
  const [radius, setRadius] = useState("5000");
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [mapCenter, setMapCenter] = useState<{lat: number, lng: number}>(DEFAULT_CENTER);
  const [isLive, setIsLive] = useState(false);
  const [locationDenied, setLocationDenied] = useState(false);

  useEffect(() => {
    if (mode === 'sos') {
      setActiveFilter('emergency');
      handleRequestLocation();
    } else {
      loadHospitals();
    }
  }, [mode, activeFilter, radius]);

  const loadHospitals = async (loc?: {lat: number, lng: number}) => {
    setLoading(true);
    try {
      const currentFilter = mode === 'sos' ? 'emergency' : activeFilter;
      const data = await getNearbyHospitals(searchQuery, currentFilter, loc || userLocation || mapCenter, parseInt(radius));
      setHospitals(data);
      
      setIsLive(data.length > 3 || (searchQuery.length > 0 && data.length > 0));

      if (data.length > 0 && !loc && !userLocation && mapCenter.lat === DEFAULT_CENTER.lat) {
        setMapCenter(data[0].coordinates);
      }
    } catch (e) {
      console.error("Failed to load facilities", e);
      toast({ title: "Sync Error", description: "Could not fetch live data. Showing fallback results.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleRequestLocation = () => {
    setLocationDenied(false);
    if (typeof window !== "undefined" && "geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setUserLocation(loc);
          setMapCenter(loc);
          loadHospitals(loc);
          toast({ title: "Location Active", description: "Showing nearest clinical facilities." });
        },
        (error) => {
          console.warn("Geolocation error", error);
          setLocationDenied(true);
          if (mapCenter.lat !== DEFAULT_CENTER.lat) {
            loadHospitals(mapCenter);
          } else {
            loadHospitals();
          }
        },
        { timeout: 10000 }
      );
    } else {
      setLocationDenied(true);
      loadHospitals();
    }
  };

  const handleManualSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadHospitals();
  };

  const focusSearch = () => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
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
      <div className="lg:col-span-4 flex flex-col gap-4 overflow-hidden">
        <div className="space-y-4">
          <div className="bg-muted/50 p-1 rounded-xl flex">
            <button 
              onClick={() => setMode('search')}
              className={cn(
                "flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all flex items-center justify-center gap-2",
                mode === 'search' ? "bg-card text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Search className="h-3 w-3" /> Search Mode
            </button>
            <button 
              onClick={() => setMode('sos')}
              className={cn(
                "flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all flex items-center justify-center gap-2",
                mode === 'sos' ? "bg-destructive text-white shadow-lg" : "text-muted-foreground hover:text-destructive"
              )}
            >
              <Siren className="h-3 w-3" /> SOS Mode
            </button>
          </div>

          <div className="flex flex-col gap-2">
            {mode === 'search' ? (
              <form onSubmit={handleManualSearch} className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    ref={searchInputRef}
                    placeholder="Search city, area or hospital..." 
                    className="pl-9 bg-card border-border h-10 text-sm"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Button type="submit" size="icon" className="h-10 w-10 bg-primary">
                  <Search className="h-4 w-4" />
                </Button>
              </form>
            ) : (
              <div className="space-y-3">
                <Button variant="destructive" className="w-full h-10 font-bold gap-2" onClick={handleRequestLocation}>
                  <Crosshair className="h-4 w-4" /> Use Current Location
                </Button>
                
                {locationDenied && (
                  <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest">Location access is off</p>
                        <p className="text-[10px] text-muted-foreground leading-relaxed">Search your area manually to find emergency centers.</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="flex-1 h-8 text-[9px] font-black uppercase bg-card/50" onClick={focusSearch}>Search Manually</Button>
                      <Button size="sm" className="flex-1 h-8 text-[9px] font-black uppercase bg-amber-500 text-white" onClick={handleRequestLocation}>Try GPS Again</Button>
                    </div>
                  </div>
                )}
                
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    ref={searchInputRef}
                    placeholder="Search city manually..." 
                    className="pl-9 bg-card border-border h-10 text-sm"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && loadHospitals()}
                  />
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-2">
               <Select value={radius} onValueChange={setRadius}>
                  <SelectTrigger className="h-9 text-[10px] font-bold uppercase tracking-widest bg-card border-white/5">
                    <SelectValue placeholder="Radius" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2000">2 KM Radius</SelectItem>
                    <SelectItem value="5000">5 KM Radius</SelectItem>
                    <SelectItem value="10000">10 KM Radius</SelectItem>
                    <SelectItem value="20000">20 KM Radius</SelectItem>
                  </SelectContent>
               </Select>
               <Select value={activeFilter} onValueChange={setActiveFilter}>
                  <SelectTrigger className="h-9 text-[10px] font-bold uppercase tracking-widest bg-card border-white/5">
                    <SelectValue placeholder="Filter Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="hospital">Hospitals</SelectItem>
                    <SelectItem value="clinic">Clinics</SelectItem>
                    <SelectItem value="doctor">Doctors</SelectItem>
                    <SelectItem value="emergency">Emergency Only</SelectItem>
                    <SelectItem value="pharmacy">Pharmacies</SelectItem>
                  </SelectContent>
               </Select>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto pr-2 space-y-4 no-scrollbar">
          {loading ? (
            <div className="flex flex-col h-40 items-center justify-center gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Scanning Network...</p>
            </div>
          ) : hospitals.length > 0 ? (
            hospitals.map((h) => (
              <Card key={h.id} className="cursor-pointer hover:border-primary/50 transition-all border-white/5 bg-card/40 backdrop-blur-sm group" onClick={() => setMapCenter(h.coordinates)}>
                <CardHeader className="p-4 pb-2">
                  <div className="flex justify-between items-start">
                    <Badge variant={getBadgeVariant(h.type)} className="text-[8px] uppercase font-black px-2 py-0.5">
                      {h.type}
                    </Badge>
                    <div className="flex items-center gap-1 text-xs font-bold text-primary">
                      <Star className="h-3 w-3 fill-primary" /> {h.rating.toFixed(1)}
                    </div>
                  </div>
                  <CardTitle className="text-base font-headline leading-tight mt-2 group-hover:text-primary transition-colors">
                    {h.name}
                  </CardTitle>
                  <CardDescription className="text-[10px] line-clamp-1 mt-1 flex items-center gap-1">
                    <MapPin className="h-3 w-3" /> {h.address}
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4 pt-0 space-y-3">
                  <div className="flex items-center justify-between text-[9px] font-black uppercase text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" /> {h.status}
                    </span>
                    {h.phone !== 'N/A' && (
                      <span className="flex items-center gap-1">
                        <Phone className="h-3 w-3" /> {h.phone}
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1 h-8 text-[9px] font-bold uppercase tracking-widest" asChild>
                      <a href={getGoogleMapsUrl(h)} target="_blank" rel="noopener noreferrer">Navigate</a>
                    </Button>
                    <Button size="sm" className="flex-1 h-8 text-[9px] font-bold uppercase tracking-widest bg-primary" onClick={() => setMapCenter(h.coordinates)}>
                      View Map
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center py-20 px-4 border border-dashed border-white/10 rounded-2xl">
              <AlertCircle className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">No facilities found</p>
              <p className="text-[10px] text-muted-foreground/60 mt-1">Try a larger radius or a different city name.</p>
            </div>
          )}
        </div>
      </div>

      {/* Map View */}
      <div className="lg:col-span-8 min-h-[400px] h-full relative group">
        <FacilityMap 
          facilities={hospitals} 
          center={mapCenter} 
          userLocation={userLocation} 
        />
        
        <div className="absolute top-4 right-4 z-[1000]">
          <div className={cn(
            "px-3 py-1.5 rounded-full border text-[9px] font-black uppercase tracking-widest shadow-xl flex items-center gap-2",
            isLive ? "bg-green-50 border-green-200 text-green-700" : "bg-amber-50 border-amber-200 text-amber-700"
          )}>
            <div className={cn("h-1.5 w-1.5 rounded-full", isLive ? "bg-green-500 animate-pulse" : "bg-amber-500")} />
            {isLive ? "Live Clinical Data" : "Regional Demo Cache"}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function FacilitiesPage() {
  return (
    <AppShell>
      <Suspense fallback={<div className="flex h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}>
        <div className="h-full flex flex-col space-y-4">
          <div className="flex flex-col gap-0.5">
            <h1 className="text-2xl font-headline font-black">Facility Finder</h1>
            <p className="text-xs text-muted-foreground font-medium">Identify clinical capacity across the regional healthcare network.</p>
          </div>
          <FacilitiesContent />
        </div>
      </Suspense>
    </AppShell>
  );
}
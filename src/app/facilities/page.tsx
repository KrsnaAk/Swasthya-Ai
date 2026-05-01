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
  Activity
} from "lucide-react";
import Image from "next/image";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Badge } from "@/components/ui/badge";
import { getNearbyHospitals, getGoogleMapsUrl, type Hospital, type FacilityType } from "@/lib/hospital-service";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

function FacilitiesContent() {
  const searchParams = useSearchParams();
  const initialFilter = searchParams.get('type') || 'all';
  
  const mapImage = PlaceHolderImages.find(img => img.id === 'hospital-map');
  const [search, setSearch] = useState("");
  const [city, setCity] = useState("");
  const [activeFilter, setActiveFilter] = useState(initialFilter);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(true);
  const [locationError, setLocationError] = useState<string | null>(null);

  useEffect(() => {
    loadHospitals();
  }, [activeFilter, city]);

  const loadHospitals = async () => {
    setLoading(true);
    try {
      const data = await getNearbyHospitals(city, activeFilter);
      setHospitals(data);
    } catch (e) {
      console.error("Failed to load hospitals", e);
    } finally {
      setLoading(false);
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
          <form onSubmit={handleManualSearch} className="flex gap-2">
            <div className="relative flex-1">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Enter city (e.g. Mumbai)" 
                className="pl-9 bg-card border-border"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
            </div>
            <Button type="submit" size="icon" variant="secondary">
              <Search className="h-4 w-4" />
            </Button>
          </form>

          <Tabs value={activeFilter} onValueChange={setActiveFilter} className="w-full">
            <TabsList className="grid grid-cols-4 w-full h-11 bg-muted/50 p-1">
              <TabsTrigger value="all" className="text-[10px] uppercase font-bold">All</TabsTrigger>
              <TabsTrigger value="emergency" className="text-[10px] uppercase font-bold text-destructive data-[state=active]:bg-destructive data-[state=active]:text-white">SOS</TabsTrigger>
              <TabsTrigger value="hospital" className="text-[10px] uppercase font-bold">Hosp</TabsTrigger>
              <TabsTrigger value="clinic" className="text-[10px] uppercase font-bold">Clinic</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="flex-1 overflow-y-auto pr-2 space-y-4">
          {loading ? (
            <div className="flex h-40 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : hospitals.length > 0 ? (
            hospitals.map((h) => (
              <Card key={h.id} className="cursor-pointer hover:border-primary transition-all group overflow-hidden border-border bg-card">
                <CardHeader className="p-4 pb-2">
                  <div className="flex justify-between items-start">
                    <Badge variant={getBadgeVariant(h.type)} className="mb-2 text-[10px] uppercase tracking-wider">
                      {h.type}
                    </Badge>
                    <div className="flex items-center gap-1 text-sm font-semibold text-primary">
                      <Star className="h-4 w-4 fill-primary" /> {h.rating}
                    </div>
                  </div>
                  <CardTitle className="text-lg group-hover:text-primary transition-colors leading-tight">
                    {h.name}
                  </CardTitle>
                  <CardDescription className="flex items-center gap-1 text-xs mt-1">
                    <MapPin className="h-3 w-3 shrink-0" /> {h.address}
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4 pt-0 space-y-3">
                  <div className="flex items-center justify-between text-xs font-medium">
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <Navigation className="h-3 w-3" /> {h.distance} away
                    </span>
                    <span className={h.status.includes('Open 24/7') ? "text-green-500" : "text-amber-500"}>
                      <Clock className="h-3 w-3 inline mr-1" /> {h.status}
                    </span>
                  </div>
                  <div className="flex gap-2 pt-1">
                    <Button variant="outline" size="sm" className="flex-1 h-9" asChild>
                      <a href={`tel:${h.phone.replace(/\s/g, '')}`}>
                        <Phone className="mr-2 h-3.5 w-3.5" /> Call
                      </a>
                    </Button>
                    <Button size="sm" className="flex-1 h-9 bg-primary text-primary-foreground font-bold" asChild>
                      <a href={getGoogleMapsUrl(h)} target="_blank" rel="noopener noreferrer">
                        Navigate
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center py-12 px-4 border border-dashed border-border rounded-2xl">
              <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-sm font-medium">No facilities found</p>
              <p className="text-xs text-muted-foreground">Try adjusting your filters or location.</p>
            </div>
          )}
        </div>
      </div>

      {/* Map View */}
      <div className="lg:col-span-8 min-h-[400px] h-full relative">
        <Card className="h-full border-border bg-muted overflow-hidden relative shadow-2xl">
          {mapImage && (
            <Image 
              src={mapImage.imageUrl} 
              alt={mapImage.description} 
              fill 
              className="object-cover opacity-50 grayscale contrast-125"
              data-ai-hint={mapImage.imageHint}
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent pointer-events-none" />
          
          <div className="absolute top-4 right-4 flex flex-col gap-2">
            <Button variant="secondary" size="icon" className="rounded-full shadow-lg bg-card border border-border">
              <Navigation className="h-5 w-5" />
            </Button>
          </div>

          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-full max-w-md px-4">
            <div className="bg-card/90 backdrop-blur-xl p-5 rounded-3xl shadow-2xl border border-white/10 flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-primary/20 flex items-center justify-center text-primary shrink-0">
                <Activity className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-bold">Live Traffic Navigation</p>
                <p className="text-[11px] text-muted-foreground leading-snug">
                  Routing is automatically optimized for the quickest arrival time to emergency care.
                </p>
              </div>
            </div>
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
        <FacilitiesContent />
      </Suspense>
    </AppShell>
  );
}

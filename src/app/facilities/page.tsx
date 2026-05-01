"use client";

import React, { useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, MapPin, Navigation, Phone, Clock, Star } from "lucide-react";
import Image from "next/image";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Badge } from "@/components/ui/badge";

export default function FacilitiesPage() {
  const mapImage = PlaceHolderImages.find(img => img.id === 'hospital-map');
  const [search, setSearch] = useState("");

  const hospitals = [
    {
      name: "City General Hospital",
      type: "Public Hospital",
      distance: "1.2 km",
      rating: 4.5,
      address: "123 Medical Drive, Central City",
      status: "Open 24/7",
      phone: "+1 234 567 8900"
    },
    {
      name: "Unity Health Clinic",
      type: "Private Clinic",
      distance: "2.5 km",
      rating: 4.8,
      address: "45 Care Lane, Wellness District",
      status: "Open until 8:00 PM",
      phone: "+1 234 567 8901"
    },
    {
      name: "Emergency Care Center",
      type: "Specialized Emergency",
      distance: "0.8 km",
      rating: 4.2,
      address: "78 Trauma Road, North Point",
      status: "Open 24/7",
      phone: "+1 234 567 8902"
    }
  ];

  return (
    <AppShell>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full max-w-7xl mx-auto">
        {/* Sidebar List */}
        <div className="lg:col-span-4 space-y-6 overflow-y-auto pr-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input 
              placeholder="Search hospitals or clinics..." 
              className="pl-10 h-12 bg-card border-border"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="space-y-4">
            {hospitals.map((h, i) => (
              <Card key={i} className="cursor-pointer hover:border-primary transition-all group overflow-hidden">
                <CardHeader className="p-4 pb-2">
                  <div className="flex justify-between items-start">
                    <Badge variant="secondary" className="mb-2">{h.type}</Badge>
                    <div className="flex items-center gap-1 text-sm font-semibold text-primary">
                      <Star className="h-4 w-4 fill-primary" /> {h.rating}
                    </div>
                  </div>
                  <CardTitle className="text-lg group-hover:text-primary transition-colors">{h.name}</CardTitle>
                  <CardDescription className="flex items-center gap-1 text-xs">
                    <MapPin className="h-3 w-3" /> {h.address}
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4 pt-0 space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <Navigation className="h-4 w-4" /> {h.distance} away
                    </span>
                    <span className="flex items-center gap-1 text-green-500">
                      <Clock className="h-4 w-4" /> {h.status}
                    </span>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Phone className="mr-2 h-4 w-4" /> Call
                    </Button>
                    <Button size="sm" className="flex-1 bg-primary text-primary-foreground">
                      Directions
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Map View */}
        <div className="lg:col-span-8 min-h-[500px] h-full">
          <Card className="h-full border-border bg-muted overflow-hidden relative">
            {mapImage && (
              <Image 
                src={mapImage.imageUrl} 
                alt={mapImage.description} 
                fill 
                className="object-cover opacity-60"
                data-ai-hint={mapImage.imageHint}
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-background/40 to-transparent pointer-events-none" />
            
            <div className="absolute top-4 right-4 flex flex-col gap-2">
              <Button variant="secondary" size="icon" className="rounded-full shadow-lg bg-card">
                <Navigation className="h-5 w-5" />
              </Button>
              <div className="bg-card p-2 rounded-xl shadow-xl border border-border flex flex-col gap-2">
                <Button variant="ghost" size="sm" className="font-bold">+</Button>
                <div className="h-px bg-border mx-2" />
                <Button variant="ghost" size="sm" className="font-bold">-</Button>
              </div>
            </div>

            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-full max-w-sm px-4">
              <div className="bg-card/90 backdrop-blur-md p-4 rounded-2xl shadow-2xl border border-white/10 text-center">
                <p className="text-sm font-medium mb-1">Interactive Map Integration</p>
                <p className="text-xs text-muted-foreground">Google Maps implementation would visualize live hospital locations and traffic-aware routes.</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}

'use client';

import React, { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { type Hospital } from '@/lib/hospital-service';
import { Button } from '@/components/ui/button';
import { Navigation, Phone, MapPin, Building2, User, Activity } from 'lucide-react';

interface FacilityMapProps {
  facilities: Hospital[];
  center: { lat: number; lng: number };
  userLocation: { lat: number; lng: number } | null;
}

function MapUpdater({ center }: { center: { lat: number; lng: number } }) {
  const map = useMap();
  useEffect(() => {
    map.setView([center.lat, center.lng], 14, { animate: true });
  }, [center, map]);
  return null;
}

const createCustomIcon = (color: string, iconHtml: string) => {
  return L.divIcon({
    html: `
      <div style="
        background-color: ${color};
        width: 36px;
        height: 36px;
        border-radius: 10px;
        border: 2px solid rgba(255,255,255,0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 15px rgba(0,0,0,0.4);
        transform: rotate(45deg);
      ">
        <div style="transform: rotate(-45deg)">${iconHtml}</div>
      </div>
    `,
    className: 'custom-marker',
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -20],
  });
};

export default function FacilityMap({ facilities, center, userLocation }: FacilityMapProps) {
  const hospitalIconHtml = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/><path d="M10 6h4"/><path d="M10 10h4"/><path d="M10 14h4"/><path d="M10 18h4"/></svg>`;
  const emergencyIconHtml = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20M2 12h20"/></svg>`;
  const userIconHtml = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`;

  const icons = useMemo(() => ({
    regular: createCustomIcon('hsl(var(--primary))', hospitalIconHtml),
    emergency: createCustomIcon('hsl(var(--destructive))', emergencyIconHtml),
    user: createCustomIcon('hsl(var(--accent))', userIconHtml),
  }), []);

  return (
    <div className="w-full h-full rounded-3xl overflow-hidden border border-white/5 shadow-2xl relative z-0">
      <MapContainer 
        center={[center.lat, center.lng]} 
        zoom={14} 
        scrollWheelZoom={true}
        style={{ height: '100%', width: '100%', background: 'hsl(var(--muted))' }}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          className="map-tiles"
        />
        
        <MapUpdater center={center} />

        {userLocation && (
          <Marker position={[userLocation.lat, userLocation.lng]} icon={icons.user}>
            <Popup className="clinical-popup">
              <div className="text-[10px] font-black uppercase tracking-widest text-accent text-center">Your Live Position</div>
            </Popup>
          </Marker>
        )}

        {facilities.map((f) => (
          <Marker 
            key={f.id} 
            position={[f.coordinates.lat, f.coordinates.lng]} 
            icon={f.isEmergencyReady ? icons.emergency : icons.regular}
          >
            <Popup className="clinical-popup">
              <div className="p-1 min-w-[220px] space-y-4">
                <div className="space-y-1">
                  <div className="flex justify-between items-start gap-2">
                    <h4 className="font-headline font-black text-sm leading-tight">{f.name}</h4>
                    {f.isEmergencyReady && (
                       <Badge variant="destructive" className="text-[7px] h-4 uppercase font-black">SOS</Badge>
                    )}
                  </div>
                  <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                    <MapPin className="h-3 w-3 shrink-0" /> {f.address}
                  </p>
                </div>

                <div className="flex items-center justify-between border-t border-border pt-3">
                  <div className="space-y-0.5">
                    <p className="text-[8px] font-black uppercase text-muted-foreground tracking-tighter">Availability</p>
                    <p className={cn("text-[10px] font-bold uppercase", f.status.includes('Open') ? "text-green-500" : "text-amber-500")}>
                      {f.status}
                    </p>
                  </div>
                  <div className="text-right space-y-0.5">
                     <p className="text-[8px] font-black uppercase text-muted-foreground tracking-tighter">Rating</p>
                     <p className="text-[10px] font-black text-primary">{f.rating.toFixed(1)} / 5.0</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="h-9 text-[10px] font-black uppercase flex-1 border-white/10" asChild>
                    <a href={`tel:${f.phone.replace(/\s/g, '')}`}>
                      <Phone className="h-3.5 w-3.5 mr-1" /> Call
                    </a>
                  </Button>
                  <Button size="sm" className="h-9 text-[10px] font-black uppercase flex-1 bg-primary text-primary-foreground shadow-lg" asChild>
                    <a href={`https://www.google.com/maps/dir/?api=1&destination=${f.coordinates.lat},${f.coordinates.lng}`} target="_blank" rel="noopener noreferrer">
                      <Navigation className="h-3.5 w-3.5 mr-1" /> Navigate
                    </a>
                  </Button>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      
      <style jsx global>{`
        .leaflet-container {
          filter: grayscale(1) invert(0.95) contrast(0.8) brightness(1.1);
        }
        .dark .leaflet-container {
          filter: grayscale(1) invert(1) contrast(1.1) brightness(0.8) hue-rotate(180deg);
        }
        .leaflet-popup-content-wrapper {
          background: hsl(var(--card)) !important;
          color: hsl(var(--foreground)) !important;
          border-radius: 1.25rem !important;
          border: 1px solid rgba(255,255,255,0.08) !important;
          box-shadow: 0 20px 40px rgba(0,0,0,0.6) !important;
          padding: 0 !important;
        }
        .leaflet-popup-content {
          margin: 12px !important;
        }
        .leaflet-popup-tip {
          background: hsl(var(--card)) !important;
        }
        .leaflet-control-zoom {
          border: none !important;
          box-shadow: 0 8px 30px rgba(0,0,0,0.5) !important;
        }
        .leaflet-control-zoom-in, .leaflet-control-zoom-out {
          background: hsl(var(--card)) !important;
          color: hsl(var(--foreground)) !important;
          border: 1px solid rgba(255,255,255,0.1) !important;
        }
      `}</style>
    </div>
  );
}

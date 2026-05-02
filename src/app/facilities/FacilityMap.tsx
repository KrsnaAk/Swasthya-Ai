'use client';

import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { type Hospital } from '@/lib/hospital-service';
import { Button } from '@/components/ui/button';
import { Navigation, Phone, MapPin, Building2, User } from 'lucide-react';

interface FacilityMapProps {
  facilities: Hospital[];
  center: { lat: number; lng: number };
  userLocation: { lat: number; lng: number } | null;
}

// Component to handle map view updates
function MapUpdater({ center }: { center: { lat: number; lng: number } }) {
  const map = useMap();
  useEffect(() => {
    map.setView([center.lat, center.lng], 13);
  }, [center, map]);
  return null;
}

const createCustomIcon = (color: string, Icon: any) => {
  return L.divIcon({
    html: `
      <div style="
        background-color: ${color};
        width: 40px;
        height: 40px;
        border-radius: 50%;
        border: 3px solid white;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 15px rgba(0,0,0,0.3);
      ">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          ${Icon === Building2 ? '<path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/><path d="M10 6h4"/><path d="M10 10h4"/><path d="M10 14h4"/><path d="M10 18h4"/>' : '<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>'}
        </svg>
      </div>
    `,
    className: '',
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -20],
  });
};

const emergencyIcon = createCustomIcon('hsl(var(--destructive))', Building2);
const regularIcon = createCustomIcon('hsl(var(--primary))', Building2);
const userIcon = createCustomIcon('hsl(var(--accent))', User);

export default function FacilityMap({ facilities, center, userLocation }: FacilityMapProps) {
  return (
    <div className="w-full h-full rounded-3xl overflow-hidden border border-white/10 shadow-2xl relative z-0">
      <MapContainer 
        center={[center.lat, center.lng]} 
        zoom={13} 
        scrollWheelZoom={true}
        style={{ height: '100%', width: '100%', background: 'hsl(var(--muted))' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          className="map-tiles"
        />
        
        <MapUpdater center={center} />

        {userLocation && (
          <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon}>
            <Popup>
              <div className="text-xs font-bold uppercase tracking-widest text-primary">Your Location</div>
            </Popup>
          </Marker>
        )}

        {facilities.map((f) => (
          <Marker 
            key={f.id} 
            position={[f.coordinates.lat, f.coordinates.lng]} 
            icon={f.isEmergencyReady ? emergencyIcon : regularIcon}
          >
            <Popup>
              <div className="p-2 min-w-[200px] space-y-3">
                <div>
                  <h4 className="font-bold text-sm leading-tight mb-1">{f.name}</h4>
                  <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                    <MapPin className="h-3 w-3" /> {f.address}
                  </p>
                </div>
                <div className="flex items-center justify-between text-[10px] font-bold uppercase">
                  <span className={f.status.includes('Open 24/7') ? "text-green-500" : "text-amber-500"}>{f.status}</span>
                  <span className="text-muted-foreground">{f.distance}</span>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="h-8 text-[10px] flex-1" asChild>
                    <a href={`tel:${f.phone}`}>
                      <Phone className="h-3 w-3 mr-1" /> Call
                    </a>
                  </Button>
                  <Button size="sm" className="h-8 text-[10px] flex-1 bg-primary text-primary-foreground" asChild>
                    <a href={`https://www.google.com/maps/dir/?api=1&destination=${f.coordinates.lat},${f.coordinates.lng}`} target="_blank" rel="noopener noreferrer">
                      <Navigation className="h-3 w-3 mr-1" /> Nav
                    </a>
                  </Button>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      
      {/* Map Badge */}
      <div className="absolute top-4 left-4 z-[1000]">
        <div className="bg-background/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 text-[9px] font-black uppercase tracking-widest shadow-xl flex items-center gap-2">
          <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
          Live Network Data
        </div>
      </div>
      
      <style jsx global>{`
        .leaflet-container {
          filter: grayscale(1) invert(1) contrast(1.1) brightness(0.9);
        }
        .leaflet-popup-content-wrapper {
          background: hsl(var(--card)) !important;
          color: hsl(var(--foreground)) !important;
          border-radius: 1rem !important;
          border: 1px solid rgba(255,255,255,0.1) !important;
          box-shadow: 0 10px 25px rgba(0,0,0,0.5) !important;
        }
        .leaflet-popup-tip {
          background: hsl(var(--card)) !important;
        }
        .leaflet-control-zoom {
          border: none !important;
          box-shadow: 0 4px 15px rgba(0,0,0,0.3) !important;
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
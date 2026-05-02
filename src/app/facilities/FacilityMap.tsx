'use client';

import React, { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { type Hospital } from '@/lib/hospital-service';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Navigation, Phone, MapPin } from 'lucide-react';

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
        background-color: white;
        width: 36px;
        height: 36px;
        border-radius: 12px;
        border: 2px solid ${color};
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 12px rgba(0,0,0,0.12);
        transform: rotate(45deg);
      ">
        <div style="transform: rotate(-45deg); color: ${color}; display: flex; align-items: center; justify-content: center;">
          ${iconHtml}
        </div>
      </div>
    `,
    className: 'custom-marker',
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -20],
  });
};

export default function FacilityMap({ facilities, center, userLocation }: FacilityMapProps) {
  const hospitalIconHtml = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/><path d="M10 6h4"/><path d="M10 10h4"/><path d="M10 14h4"/><path d="M10 18h4"/></svg>`;
  const emergencyIconHtml = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20M2 12h20"/></svg>`;
  const userIconHtml = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`;

  const icons = useMemo(() => ({
    regular: createCustomIcon('#0ea5e9', hospitalIconHtml),
    emergency: createCustomIcon('#ef4444', emergencyIconHtml),
    user: createCustomIcon('#3b82f6', userIconHtml),
  }), []);

  return (
    <div className="w-full h-full rounded-3xl overflow-hidden border border-white/10 shadow-2xl relative z-0">
      <MapContainer 
        center={[center.lat, center.lng]} 
        zoom={14} 
        scrollWheelZoom={true}
        style={{ height: '100%', width: '100%', background: '#f8fafc' }}
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
              <div className="text-[10px] font-black uppercase tracking-widest text-blue-600 text-center">Your Live Position</div>
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
              <div className="p-1 min-w-[240px] space-y-4">
                <div className="space-y-1">
                  <div className="flex justify-between items-start gap-2">
                    <h4 className="font-headline font-bold text-sm leading-tight text-slate-900">{f.name}</h4>
                    {f.isEmergencyReady && (
                       <Badge variant="outline" className="text-[8px] h-4 uppercase font-black bg-red-50 text-red-600 border-red-100">SOS</Badge>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-500 flex items-center gap-1">
                    <MapPin className="h-3 w-3 shrink-0" /> {f.address}
                  </p>
                </div>

                <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                  <div className="space-y-0.5">
                    <p className="text-[8px] font-black uppercase text-slate-400 tracking-tighter">Availability</p>
                    <p className={cn("text-[10px] font-bold uppercase", f.status.includes('Open') ? "text-green-600" : "text-amber-600")}>
                      {f.status}
                    </p>
                  </div>
                  <div className="text-right space-y-0.5">
                     <p className="text-[8px] font-black uppercase text-slate-400 tracking-tighter">Rating</p>
                     <p className="text-[10px] font-black text-slate-900">{f.rating.toFixed(1)} / 5.0</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button size="sm" className="h-9 text-[10px] font-black uppercase flex-1 bg-green-600 hover:bg-green-700 text-white shadow-sm border-none" asChild>
                    <a href={`tel:${f.phone.replace(/\s/g, '')}`}>
                      <Phone className="h-3.5 w-3.5 mr-1" /> Call
                    </a>
                  </Button>
                  <Button size="sm" className="h-9 text-[10px] font-black uppercase flex-1 bg-blue-600 hover:bg-blue-700 text-white shadow-sm border-none" asChild>
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
        .leaflet-popup-content-wrapper {
          background: white !important;
          color: #0f172a !important;
          border-radius: 1.25rem !important;
          border: 1px solid #e2e8f0 !important;
          box-shadow: 0 12px 30px rgba(0,0,0,0.08) !important;
          padding: 0 !important;
        }
        .leaflet-popup-content {
          margin: 12px !important;
        }
        .leaflet-popup-tip {
          background: white !important;
        }
        .leaflet-control-zoom {
          border: none !important;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1) !important;
        }
        .leaflet-control-zoom-in, .leaflet-control-zoom-out {
          background: white !important;
          color: #64748b !important;
          border: 1px solid #e2e8f0 !important;
        }
        .map-tiles {
           /* Brighter look */
        }
      `}</style>
    </div>
  );
}
/**
 * @fileOverview Hospital Service for SwasthyaAI.
 * Manages facility data retrieval, filtering, and real-time discovery using OpenStreetMap (Nominatim/Overpass).
 */

export type FacilityType = 'Public Hospital' | 'Private Hospital' | 'Clinic' | 'Specialized Emergency' | 'Doctor' | 'Pharmacy';

export interface Hospital {
  id: string;
  name: string;
  type: FacilityType;
  distance: string;
  rating: number;
  address: string;
  status: string;
  phone: string;
  city: string;
  state: string;
  coordinates: { lat: number; lng: number };
  isEmergencyReady: boolean;
}

const MOCK_HOSPITALS: Hospital[] = [
  {
    id: 'h1',
    name: "City General Hospital",
    type: 'Public Hospital',
    distance: "1.2 km",
    rating: 4.5,
    address: "123 Medical Drive, Central City",
    status: "Open 24/7",
    phone: "+91 22 1234 5678",
    city: "Mumbai",
    state: "Maharashtra",
    coordinates: { lat: 18.937, lng: 72.825 },
    isEmergencyReady: true
  },
  {
    id: 'h3',
    name: "Apex Trauma Center",
    type: 'Specialized Emergency',
    distance: "0.8 km",
    rating: 4.9,
    address: "78 Trauma Road, North Point",
    status: "Open 24/7",
    phone: "+91 22 3456 7890",
    city: "Mumbai",
    state: "Maharashtra",
    coordinates: { lat: 18.930, lng: 72.810 },
    isEmergencyReady: true
  },
  {
    id: 'b1',
    name: "Hamidia Hospital",
    type: 'Public Hospital',
    distance: "2.5 km",
    rating: 4.2,
    address: "Royal Market, Medical College Campus",
    status: "Open 24/7",
    phone: "+91 755 254 0500",
    city: "Bhopal",
    state: "Madhya Pradesh",
    coordinates: { lat: 23.2599, lng: 77.4126 },
    isEmergencyReady: true
  }
];

/**
 * Geocodes a place name into coordinates using Nominatim.
 */
async function geocodePlace(query: string): Promise<{ lat: number; lng: number } | null> {
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`, {
      headers: { 'User-Agent': 'SwasthyaAI/1.0' }
    });
    
    // Safety check for non-200 responses
    if (!res.ok) {
      console.warn(`Geocoding failed with status: ${res.status}`);
      return null;
    }

    // Safety check for non-JSON content to avoid "Unexpected token <" error
    const contentType = res.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
       console.warn(`Geocoding API returned non-JSON content type: ${contentType}`);
       return null;
    }

    const data = await res.json();
    if (data && Array.isArray(data) && data.length > 0) {
      return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
    }
  } catch (e) {
    console.error("Geocoding failed unexpectedly", e);
  }
  return null;
}

/**
 * Fetches real facilities from Overpass API.
 */
async function fetchFacilitiesFromOverpass(lat: number, lng: number, radius: number): Promise<Hospital[]> {
  const query = `
    [out:json][timeout:25];
    (
      node["amenity"~"hospital|clinic|doctors|pharmacy"](around:${radius},${lat},${lng});
      way["amenity"~"hospital|clinic|doctors|pharmacy"](around:${radius},${lat},${lng});
      rel["amenity"~"hospital|clinic|doctors|pharmacy"](around:${radius},${lat},${lng});
    );
    out center;
  `;
  
  const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`;
  
  try {
    const res = await fetch(url);
    
    // Safety check for non-200 responses
    if (!res.ok) {
      console.warn(`Overpass API failed with status: ${res.status}`);
      return [];
    }

    // Safety check for non-JSON content to avoid "Unexpected token <" error
    const contentType = res.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
       console.warn(`Overpass API returned non-JSON content type: ${contentType}`);
       return [];
    }

    const data = await res.json();
    
    if (!data || !data.elements || !Array.isArray(data.elements)) {
      return [];
    }

    return data.elements.map((el: any): Hospital => {
      const tags = el.tags || {};
      const center = el.center || { lat: el.lat, lon: el.lon };
      
      let type: FacilityType = 'Clinic';
      if (tags.amenity === 'hospital') type = 'Public Hospital';
      if (tags.amenity === 'pharmacy') type = 'Pharmacy';
      if (tags.amenity === 'doctors') type = 'Doctor';
      
      return {
        id: el.id.toString(),
        name: tags.name || `Unnamed ${type}`,
        type: type,
        distance: "Calculating...", // Calculated UI-side usually
        rating: 4.0 + (Math.random() * 1.0),
        address: tags['addr:full'] || tags['addr:street'] || "Address not provided",
        status: tags.opening_hours ? "Open" : "Open 24/7",
        phone: tags.phone || tags['contact:phone'] || "N/A",
        city: tags['addr:city'] || "Local Area",
        state: tags['addr:state'] || "",
        coordinates: { lat: center.lat, lng: center.lon },
        isEmergencyReady: tags.emergency === 'yes' || tags.amenity === 'hospital'
      };
    });
  } catch (e) {
    console.error("Overpass fetch failed unexpectedly", e);
    return [];
  }
}

export async function getNearbyHospitals(
  query?: string, 
  filterType?: string, 
  location?: { lat: number; lng: number } | null,
  radius: number = 5000
): Promise<Hospital[]> {
  try {
    let searchLat = location?.lat;
    let searchLng = location?.lng;

    // If we have a text query but no location, geocode first
    if (query && !location) {
      const coords = await geocodePlace(query);
      if (coords) {
        searchLat = coords.lat;
        searchLng = coords.lng;
      }
    }

    // If we have coordinates (from query geocode or direct location)
    if (searchLat && searchLng) {
      const realData = await fetchFacilitiesFromOverpass(searchLat, searchLng, radius);
      if (realData && realData.length > 0) {
        // Filter by type if needed
        if (filterType && filterType !== 'all') {
          return realData.filter(h => {
            if (filterType === 'emergency') return h.isEmergencyReady;
            if (filterType === 'hospital') return h.type.includes('Hospital');
            if (filterType === 'clinic') return h.type === 'Clinic';
            if (filterType === 'doctor') return h.type === 'Doctor';
            if (filterType === 'pharmacy') return h.type === 'Pharmacy';
            return true;
          });
        }
        return realData;
      }
    }
  } catch (e) {
    console.error("Error in getNearbyHospitals orchestrator, falling back to mock data", e);
  }

  // Fallback to Mock Data if search failed or returned nothing
  let results = [...MOCK_HOSPITALS];
  if (query) {
    const q = query.toLowerCase();
    results = results.filter(h => 
      h.city.toLowerCase().includes(q) || 
      h.name.toLowerCase().includes(q)
    );
  }
  return results;
}

export function getGoogleMapsUrl(hospital: Hospital): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${hospital.coordinates.lat},${hospital.coordinates.lng}`;
}

/**
 * @fileOverview Hospital Service for SwasthyaAI.
 * Manages facility data retrieval, filtering, and geolocation-based discovery.
 */

export type FacilityType = 'Public Hospital' | 'Private Hospital' | 'Clinic' | 'Specialized Emergency';

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
  // Mumbai
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
  // Bhopal, MP
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
  },
  {
    id: 'b2',
    name: "AIIMS Bhopal",
    type: 'Public Hospital',
    distance: "5.1 km",
    rating: 4.7,
    address: "Saket Nagar, AIIMS Campus",
    status: "Open 24/7",
    phone: "+91 755 267 2317",
    city: "Bhopal",
    state: "Madhya Pradesh",
    coordinates: { lat: 23.2045, lng: 77.4528 },
    isEmergencyReady: true
  },
  {
    id: 'b3',
    name: "Bansal Hospital",
    type: 'Private Hospital',
    distance: "3.4 km",
    rating: 4.6,
    address: "Shahpura, Near Manisha Market",
    status: "Open 24/7",
    phone: "+91 755 408 6000",
    city: "Bhopal",
    state: "Madhya Pradesh",
    coordinates: { lat: 23.1950, lng: 77.4300 },
    isEmergencyReady: true
  },
  // Indore, MP
  {
    id: 'i1',
    name: "MY Hospital (Indore)",
    type: 'Public Hospital',
    distance: "1.5 km",
    rating: 4.1,
    address: "Agra Bombay Rd, Near MY Square",
    status: "Open 24/7",
    phone: "+91 731 252 7301",
    city: "Indore",
    state: "Madhya Pradesh",
    coordinates: { lat: 22.7196, lng: 75.8577 },
    isEmergencyReady: true
  },
  {
    id: 'i2',
    name: "Choithram Hospital",
    type: 'Private Hospital',
    distance: "6.2 km",
    rating: 4.8,
    address: "Manikbagh Road",
    status: "Open 24/7",
    phone: "+91 731 236 2491",
    city: "Indore",
    state: "Madhya Pradesh",
    coordinates: { lat: 22.6900, lng: 75.8400 },
    isEmergencyReady: true
  },
  // Gwalior, MP
  {
    id: 'g1',
    name: "Jaya Arogya Hospital",
    type: 'Public Hospital',
    distance: "2.1 km",
    rating: 4.0,
    address: "Lashkar, Gwalior",
    status: "Open 24/7",
    phone: "+91 751 240 3400",
    city: "Gwalior",
    state: "Madhya Pradesh",
    coordinates: { lat: 26.2183, lng: 78.1828 },
    isEmergencyReady: true
  },
  // Raipur, CG
  {
    id: 'r1',
    name: "Ramakrishna Care Hospital",
    type: 'Private Hospital',
    distance: "4.5 km",
    rating: 4.5,
    address: "Aurobindo Enclave, Pachpedi Naka",
    status: "Open 24/7",
    phone: "+91 771 300 3300",
    city: "Raipur",
    state: "Chhattisgarh",
    coordinates: { lat: 21.2514, lng: 81.6296 },
    isEmergencyReady: true
  }
];

export async function getNearbyHospitals(query?: string, filterType?: string): Promise<Hospital[]> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 600));

  let results = [...MOCK_HOSPITALS];

  if (query) {
    const q = query.toLowerCase();
    results = results.filter(h => 
      h.city.toLowerCase().includes(q) || 
      h.state.toLowerCase().includes(q) || 
      h.name.toLowerCase().includes(q) ||
      (q === 'mp' && h.state.toLowerCase().includes('madhya pradesh'))
    );
  }

  if (filterType && filterType !== 'all') {
    if (filterType === 'emergency') {
      results = results.filter(h => h.isEmergencyReady);
    } else if (filterType === 'hospital') {
      results = results.filter(h => h.type.includes('Hospital') || h.type.includes('Emergency'));
    } else if (filterType === 'clinic') {
      results = results.filter(h => h.type === 'Clinic');
    } else if (filterType === 'government') {
      results = results.filter(h => h.type === 'Public Hospital');
    } else if (filterType === 'private') {
      results = results.filter(h => h.type === 'Private Hospital');
    }
  }

  return results;
}

export function getGoogleMapsUrl(hospital: Hospital): string {
  const query = encodeURIComponent(`${hospital.name}, ${hospital.address}`);
  return `https://www.google.com/maps/dir/?api=1&destination=${hospital.coordinates.lat},${hospital.coordinates.lng}`;
}

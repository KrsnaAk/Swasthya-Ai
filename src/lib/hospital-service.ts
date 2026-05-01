/**
 * @fileOverview Hospital Service for SwasthyaAI.
 * Manages hospital data retrieval and filtering logic.
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
    coordinates: { lat: 18.937, lng: 72.825 },
    isEmergencyReady: true
  },
  {
    id: 'h2',
    name: "Unity Health Clinic",
    type: 'Clinic',
    distance: "2.5 km",
    rating: 4.8,
    address: "45 Care Lane, Wellness District",
    status: "Open until 8:00 PM",
    phone: "+91 22 2345 6789",
    city: "Mumbai",
    coordinates: { lat: 18.940, lng: 72.830 },
    isEmergencyReady: false
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
    coordinates: { lat: 18.930, lng: 72.810 },
    isEmergencyReady: true
  },
  {
    id: 'h4',
    name: "Holy Spirit Hospital",
    type: 'Private Hospital',
    distance: "4.1 km",
    rating: 4.3,
    address: "Mahakali Caves Rd, Andheri East",
    status: "Open 24/7",
    phone: "+91 22 4567 8901",
    city: "Mumbai",
    coordinates: { lat: 19.120, lng: 72.870 },
    isEmergencyReady: true
  },
  {
    id: 'h5',
    name: "Sunrise Child Clinic",
    type: 'Clinic',
    distance: "1.8 km",
    rating: 4.6,
    address: "Link Road, Borivali West",
    status: "Open until 9:00 PM",
    phone: "+91 22 5678 9012",
    city: "Mumbai",
    coordinates: { lat: 19.230, lng: 72.850 },
    isEmergencyReady: false
  }
];

export async function getNearbyHospitals(city?: string, filterType?: string): Promise<Hospital[]> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 800));

  let results = [...MOCK_HOSPITALS];

  if (city) {
    results = results.filter(h => h.city.toLowerCase().includes(city.toLowerCase()));
  }

  if (filterType && filterType !== 'all') {
    if (filterType === 'emergency') {
      results = results.filter(h => h.isEmergencyReady);
    } else {
      results = results.filter(h => h.type.toLowerCase().includes(filterType.toLowerCase()));
    }
  }

  return results;
}

export function getGoogleMapsUrl(hospital: Hospital): string {
  const query = encodeURIComponent(`${hospital.name}, ${hospital.address}`);
  return `https://www.google.com/maps/search/?api=1&query=${query}`;
}

import { Clinic, Location } from './types';
import { supabase } from './supabase';

export const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

export const getUserLocation = (): Promise<Location> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by this browser'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (error) => {
        let message = 'Unable to retrieve your location';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            message = 'Location access denied. Please enable location services.';
            break;
          case error.POSITION_UNAVAILABLE:
            message = 'Location information is unavailable.';
            break;
          case error.TIMEOUT:
            message = 'Location request timed out.';
            break;
        }
        reject(new Error(message));
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 300000, // 5 minutes
      }
    );
  });
};

export const fetchClinicsFromOSM = async (location: Location, radiusKm: number = 10): Promise<Clinic[]> => {
  try {
    const overpassQuery = `
      [out:json][timeout:30];
      (
        node["amenity"="hospital"](around:${radiusKm * 1000},${location.latitude},${location.longitude});
        node["amenity"="clinic"](around:${radiusKm * 1000},${location.latitude},${location.longitude});
        node["healthcare"="hospital"](around:${radiusKm * 1000},${location.latitude},${location.longitude});
        node["healthcare"="clinic"](around:${radiusKm * 1000},${location.latitude},${location.longitude});
        way["amenity"="hospital"](around:${radiusKm * 1000},${location.latitude},${location.longitude});
        way["amenity"="clinic"](around:${radiusKm * 1000},${location.latitude},${location.longitude});
      );
      out center;
    `;

    const response = await fetch(
      `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(overpassQuery)}`,
      {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Overpass API error: ${response.status}`);
    }

    const data = await response.json();
    
    const clinics: Clinic[] = data.elements
      .filter((element: any) => element.lat && element.lon)
      .map((element: any) => {
        const lat = element.lat || element.center?.lat;
        const lon = element.lon || element.center?.lon;
        
        if (!lat || !lon) return null;
        
        const distance = calculateDistance(location.latitude, location.longitude, lat, lon);
        
        // Filter out clinics that are actually too far (data quality issue)
        if (distance > radiusKm) return null;
        
        return {
          id: `osm_${element.id}`,
          name: element.tags?.name || element.tags?.['healthcare:speciality'] || 'Medical Facility',
          address: element.tags?.['addr:full'] || 
                  `${element.tags?.['addr:street'] || ''} ${element.tags?.['addr:city'] || ''}`.trim() || 
                  'Address not available',
          latitude: lat,
          longitude: lon,
          phone: element.tags?.phone || element.tags?.['contact:phone'] || null,
          distance
        };
      })
      .filter((clinic: Clinic | null): clinic is Clinic => clinic !== null)
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 20); // Limit to 20 closest clinics

    return clinics;
  } catch (error) {
    console.error('Error fetching from OpenStreetMap:', error);
    throw error;
  }
};

export const fetchClinicsFromSupabase = async (location: Location): Promise<Clinic[]> => {
  try {
    const { data, error } = await supabase
      .from('clinics')
      .select('*');

    if (error) throw error;

    const clinicsWithDistance = (data || []).map(clinic => ({
      ...clinic,
      distance: calculateDistance(location.latitude, location.longitude, clinic.latitude, clinic.longitude),
    }))
    .filter(clinic => clinic.distance <= 50) // Only show clinics within 50km
    .sort((a, b) => a.distance - b.distance);

    return clinicsWithDistance;
  } catch (error) {
    console.error('Error fetching clinics from Supabase:', error);
    throw error;
  }
};

export const findNearbyClinics = async (location: Location): Promise<Clinic[]> => {
  try {
    // Try OpenStreetMap first
    const osmClinics = await fetchClinicsFromOSM(location, 10);
    
    if (osmClinics.length > 0) {
      return osmClinics;
    }
    
    // Fallback to Supabase
    const supabaseClinics = await fetchClinicsFromSupabase(location);
    return supabaseClinics;
  } catch (error) {
    console.error('Error finding nearby clinics:', error);
    // Final fallback to Supabase
    try {
      return await fetchClinicsFromSupabase(location);
    } catch (fallbackError) {
      console.error('Fallback clinic fetch failed:', fallbackError);
      return [];
    }
  }
};
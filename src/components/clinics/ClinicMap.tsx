import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { motion } from 'framer-motion';
import { Clinic, Location } from '../../lib/types';
import { Phone, Navigation } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in react-leaflet
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.divIcon({
  html: `<div class="w-6 h-6 bg-red-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center">
    <div class="w-2 h-2 bg-white rounded-full"></div>
  </div>`,
  className: 'custom-div-icon',
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

let UserIcon = L.divIcon({
  html: `<div class="w-6 h-6 bg-blue-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center">
    <div class="w-2 h-2 bg-white rounded-full"></div>
  </div>`,
  className: 'custom-div-icon',
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

L.Marker.prototype.options.icon = DefaultIcon;

interface ClinicMapProps {
  clinics: Clinic[];
  userLocation: Location | null;
  onClinicSelect?: (clinic: Clinic) => void;
}

const MapController: React.FC<{ center: [number, number] }> = ({ center }) => {
  const map = useMap();
  
  useEffect(() => {
    map.setView(center, 13);
  }, [center, map]);
  
  return null;
};

export const ClinicMap: React.FC<ClinicMapProps> = ({ 
  clinics, 
  userLocation, 
  onClinicSelect 
}) => {
  const center: [number, number] = userLocation 
    ? [userLocation.latitude, userLocation.longitude]
    : [-1.2921, 36.8219]; // Nairobi default

  const openInMaps = (clinic: Clinic) => {
    const url = `https://maps.google.com/maps?q=${clinic.latitude},${clinic.longitude}`;
    window.open(url, '_blank');
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="h-96 w-full rounded-lg overflow-hidden shadow-lg"
    >
      <MapContainer
        center={center}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
        className="z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <MapController center={center} />
        
        {/* User location marker */}
        {userLocation && (
          <Marker 
            position={[userLocation.latitude, userLocation.longitude]}
            icon={UserIcon}
          >
            <Popup>
              <div className="text-center">
                <strong>Your Location</strong>
              </div>
            </Popup>
          </Marker>
        )}
        
        {/* Clinic markers */}
        {clinics.map((clinic) => (
          <Marker
            key={clinic.id}
            position={[clinic.latitude, clinic.longitude]}
            icon={DefaultIcon}
            eventHandlers={{
              click: () => onClinicSelect?.(clinic),
            }}
          >
            <Popup>
              <div className="min-w-48">
                <h3 className="font-semibold text-gray-900 mb-2">{clinic.name}</h3>
                <p className="text-sm text-gray-600 mb-2">{clinic.address}</p>
                {clinic.phone && (
                  <div className="flex items-center text-sm text-gray-600 mb-2">
                    <Phone className="w-3 h-3 mr-1" />
                    <a 
                      href={`tel:${clinic.phone}`}
                      className="text-blue-600 hover:text-blue-700"
                    >
                      {clinic.phone}
                    </a>
                  </div>
                )}
                {clinic.distance && (
                  <p className="text-xs text-gray-500 mb-2">
                    {clinic.distance < 1 
                      ? `${Math.round(clinic.distance * 1000)}m away`
                      : `${clinic.distance.toFixed(1)}km away`
                    }
                  </p>
                )}
                <button
                  onClick={() => openInMaps(clinic)}
                  className="w-full bg-blue-600 text-white text-xs py-1 px-2 rounded hover:bg-blue-700 transition-colors flex items-center justify-center"
                >
                  <Navigation className="w-3 h-3 mr-1" />
                  Get Directions
                </button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </motion.div>
  );
};
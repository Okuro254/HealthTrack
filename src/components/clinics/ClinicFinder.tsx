import React, { useState, useEffect } from 'react';
import { MapPin, Phone, Navigation, Map } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { Clinic, Location } from '../../lib/types';
import { getUserLocation, findNearbyClinics } from '../../lib/clinics';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { ClinicMap } from './ClinicMap';

export const ClinicFinder: React.FC = () => {
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [loading, setLoading] = useState(false);
  const [userLocation, setUserLocation] = useState<Location | null>(null);
  const [showMap, setShowMap] = useState(false);
  const [selectedClinic, setSelectedClinic] = useState<Clinic | null>(null);

  const handleFindClinics = async () => {
    setLoading(true);
    toast.loading('Getting your location...', { id: 'location' });
    
    try {
      const location = await getUserLocation();
      setUserLocation(location);
      
      toast.loading('Finding nearby clinics...', { id: 'location' });
      const nearbyClinics = await findNearbyClinics(location);
      
      toast.dismiss('location');
      setClinics(nearbyClinics);
      
      if (nearbyClinics.length === 0) {
        toast.error('No clinics found within 50km of your location');
      } else {
        toast.success(`Found ${nearbyClinics.length} nearby clinic${nearbyClinics.length === 1 ? '' : 's'}`);
        setShowMap(true);
      }
    } catch (error) {
      console.error('Error finding clinics:', error);
      toast.dismiss('location');
      toast.error(error instanceof Error ? error.message : 'Unable to access your location. Please enable location services.');
    } finally {
      setLoading(false);
    }
  };

  const openInMaps = (clinic: Clinic) => {
    const url = `https://maps.google.com/maps?q=${clinic.latitude},${clinic.longitude}`;
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card>
          <div className="text-center">
            <MapPin className="w-12 h-12 text-blue-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Find Nearby Clinics</h2>
            <p className="text-gray-600 mb-4">
              Discover healthcare facilities within 10km of your location
            </p>
            <Button
              onClick={handleFindClinics}
              loading={loading}
              className="w-full sm:w-auto"
            >
              <MapPin className="w-4 h-4 mr-2" />
              Find Clinics Near Me
            </Button>
          </div>
        </Card>
      </motion.div>

      {/* Map View */}
      <AnimatePresence>
        {showMap && clinics.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Clinic Locations</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowMap(!showMap)}
                >
                  <Map className="w-4 h-4 mr-1" />
                  {showMap ? 'Hide Map' : 'Show Map'}
                </Button>
              </div>
              <ClinicMap 
                clinics={clinics}
                userLocation={userLocation}
                onClinicSelect={setSelectedClinic}
              />
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Clinic List */}
      {clinics.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="space-y-4"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              Nearby Clinics ({clinics.length})
            </h3>
            {clinics.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowMap(!showMap)}
              >
                <Map className="w-4 h-4 mr-1" />
                {showMap ? 'Hide Map' : 'Show Map'}
              </Button>
            )}
          </div>
          
          <AnimatePresence>
            {clinics.map((clinic, index) => (
              <motion.div
                key={clinic.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Card className={`transition-all duration-200 hover:shadow-md cursor-pointer ${
                  selectedClinic?.id === clinic.id ? 'ring-2 ring-blue-500' : ''
                }`}
                onClick={() => setSelectedClinic(clinic)}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 mb-1">{clinic.name}</h4>
                      <div className="flex items-center text-gray-600 mb-2">
                        <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
                        <span className="text-sm">{clinic.address}</span>
                      </div>
                      {clinic.phone && (
                        <div className="flex items-center text-gray-600 mb-2">
                          <Phone className="w-4 h-4 mr-1 flex-shrink-0" />
                          <a 
                            href={`tel:${clinic.phone}`}
                            className="text-sm text-blue-600 hover:text-blue-700"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {clinic.phone}
                          </a>
                        </div>
                      )}
                      {clinic.distance !== undefined && (
                        <p className="text-sm text-gray-500">
                          {clinic.distance < 1 
                            ? `${Math.round(clinic.distance * 1000)}m away`
                            : `${clinic.distance.toFixed(1)}km away`
                          }
                        </p>
                      )}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        openInMaps(clinic);
                      }}
                      className="ml-4"
                    >
                      <Navigation className="w-4 h-4 mr-1" />
                      Directions
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
};
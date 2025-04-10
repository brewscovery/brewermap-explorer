
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Venue } from '@/types/venue';

/**
 * Hook for geocoding venue addresses
 */
export const useVenueGeocode = () => {
  const [isGeocoding, setIsGeocoding] = useState(false);
  
  const geocodeVenue = async (venueData: Partial<Venue>) => {
    if (!venueData.street || !venueData.city || !venueData.state) {
      return { longitude: venueData.longitude, latitude: venueData.latitude };
    }
    
    setIsGeocoding(true);
    
    try {
      const geocodeResponse = await supabase.functions.invoke('geocode', {
        body: {
          street: venueData.street,
          city: venueData.city,
          state: venueData.state,
          postalCode: venueData.postal_code
        }
      });
      
      setIsGeocoding(false);
      
      if (geocodeResponse.data) {
        return {
          longitude: geocodeResponse.data.longitude,
          latitude: geocodeResponse.data.latitude
        };
      }
      
      return { 
        longitude: venueData.longitude, 
        latitude: venueData.latitude 
      };
    } catch (error) {
      console.error('Geocoding error:', error);
      setIsGeocoding(false);
      
      return { 
        longitude: venueData.longitude, 
        latitude: venueData.latitude 
      };
    }
  };
  
  return {
    geocodeVenue,
    isGeocoding
  };
};

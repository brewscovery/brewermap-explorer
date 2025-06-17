
import { useState, useEffect, useCallback } from 'react';

interface GeolocationState {
  latitude: number;
  longitude: number;
}

interface UseGeolocationReturn {
  location: GeolocationState | null;
  isLoading: boolean;
  error: string | null;
  requestLocation: () => void;
}

export const useGeolocation = (): UseGeolocationReturn => {
  const [location, setLocation] = useState<GeolocationState | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser.');
      return;
    }

    setIsLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setIsLoading(false);
      },
      (error) => {
        let errorMessage = 'An unknown error occurred.';
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location access denied by user.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information is unavailable.';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out.';
            break;
        }
        
        setError(errorMessage);
        setIsLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000, // 5 minutes
      }
    );
  }, []);

  // Try to get location on mount if permission was previously granted
  useEffect(() => {
    navigator.permissions?.query({ name: 'geolocation' }).then((result) => {
      if (result.state === 'granted') {
        requestLocation();
      }
    });
  }, [requestLocation]);

  return {
    location,
    isLoading,
    error,
    requestLocation,
  };
};

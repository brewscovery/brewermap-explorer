import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import type { Brewery } from '@/types/brewery';
import { MAPBOX_TOKEN } from '@/utils/mapUtils';
import MapLayers from './map/MapLayers';
import MapInteractions from './map/MapInteractions';
import { toast } from 'sonner';

interface MapProps {
  breweries: Brewery[];
  onBrewerySelect: (brewery: Brewery) => void;
}

const Map = ({ breweries, onBrewerySelect }: MapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [isStyleLoaded, setIsStyleLoaded] = useState(false);

  // Function to fly to a brewery's location
  const flyToBrewery = (brewery: Brewery) => {
    if (!map.current || !brewery.longitude || !brewery.latitude) return;

    // Create a simple object with just the coordinates to avoid cloning issues
    const coordinates = {
      lng: parseFloat(brewery.longitude),
      lat: parseFloat(brewery.latitude)
    };

    map.current.flyTo({
      center: [coordinates.lng, coordinates.lat],
      zoom: 15,
      essential: true
    });
  };

  // Watch for brewery selection changes
  useEffect(() => {
    const selectedBrewery = breweries.find(b => b === breweries[0]);
    if (selectedBrewery) {
      flyToBrewery(selectedBrewery);
    }
  }, [breweries]);

  useEffect(() => {
    if (!mapContainer.current) return;

    mapboxgl.accessToken = MAPBOX_TOKEN;
    
    try {
      // Initialize map with default center (Australia)
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/light-v11',
        center: [133.7751, -25.2744], // Center of Australia
        zoom: 3
      });

      // Wait for map style to load before adding controls and layers
      map.current.on('style.load', () => {
        if (!map.current) return;
        
        setIsStyleLoaded(true);

        // Add navigation controls
        map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

        // Add geolocate control
        const geolocateControl = new mapboxgl.GeolocateControl({
          positionOptions: {
            enableHighAccuracy: true
          },
          trackUserLocation: true,
          showUserHeading: true
        });

        map.current.addControl(geolocateControl, 'top-right');

        // Try to get user location
        navigator.geolocation.getCurrentPosition(
          (position) => {
            if (map.current) {
              const coordinates = {
                lng: position.coords.longitude,
                lat: position.coords.latitude
              };
              
              map.current.flyTo({
                center: [coordinates.lng, coordinates.lat],
                zoom: 9,
                essential: true
              });
            }
          },
          (error) => {
            console.error('Error getting location:', error);
            toast.error('Could not get your location. Showing Australia view.');
            if (map.current) {
              map.current.flyTo({
                center: [133.7751, -25.2744],
                zoom: 4,
                essential: true
              });
            }
          }
        );
      });
    } catch (error) {
      console.error('Error initializing map:', error);
      toast.error('Failed to initialize map');
    }

    return () => {
      map.current?.remove();
    };
  }, []);

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainer} className="absolute inset-0" />
      {map.current && isStyleLoaded && (
        <>
          <MapLayers
            map={map.current}
            breweries={breweries}
            onBrewerySelect={onBrewerySelect}
          />
          <MapInteractions
            map={map.current}
            breweries={breweries}
            onBrewerySelect={onBrewerySelect}
          />
        </>
      )}
    </div>
  );
};

export default Map;
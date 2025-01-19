import React, { useEffect } from 'react';
import 'mapbox-gl/dist/mapbox-gl.css';
import type { Brewery } from '@/types/brewery';
import MapLayers from './map/MapLayers';
import MapInteractions from './map/MapInteractions';
import MapGeolocation from './map/MapGeolocation';
import { useMapInitialization } from '@/hooks/useMapInitialization';

interface MapProps {
  breweries: Brewery[];
  onBrewerySelect: (brewery: Brewery) => void;
}

const Map = ({ breweries, onBrewerySelect }: MapProps) => {
  const { mapContainer, map, isStyleLoaded } = useMapInitialization();

  // Function to fly to a brewery's location
  const flyToBrewery = (brewery: Brewery) => {
    if (!map.current || !brewery.longitude || !brewery.latitude) return;

    try {
      map.current.flyTo({
        center: [Number(brewery.longitude), Number(brewery.latitude)],
        zoom: 15,
        essential: true
      });
    } catch (error) {
      console.error('Error flying to brewery:', error);
    }
  };

  // Watch for brewery selection changes
  useEffect(() => {
    const selectedBrewery = breweries[0];
    if (selectedBrewery) {
      // Create a simple object with just the necessary data
      const simpleBrewery: Brewery = {
        id: selectedBrewery.id,
        name: selectedBrewery.name,
        brewery_type: selectedBrewery.brewery_type || '',
        street: selectedBrewery.street || '',
        city: selectedBrewery.city,
        state: selectedBrewery.state,
        postal_code: selectedBrewery.postal_code || '',
        country: selectedBrewery.country || 'United States',
        longitude: selectedBrewery.longitude || '',
        latitude: selectedBrewery.latitude || '',
        phone: selectedBrewery.phone || '',
        website_url: selectedBrewery.website_url || ''
      };
      flyToBrewery(simpleBrewery);
    }
  }, [breweries]);

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainer} className="absolute inset-0" />
      {map.current && isStyleLoaded && (
        <>
          <MapGeolocation map={map.current} />
          <MapLayers
            map={map.current}
            breweries={breweries.map(b => ({
              id: b.id,
              name: b.name,
              brewery_type: b.brewery_type || '',
              street: b.street || '',
              city: b.city,
              state: b.state,
              postal_code: b.postal_code || '',
              country: b.country || 'United States',
              longitude: b.longitude || '',
              latitude: b.latitude || '',
              phone: b.phone || '',
              website_url: b.website_url || ''
            }))}
            onBrewerySelect={onBrewerySelect}
          />
          <MapInteractions
            map={map.current}
            breweries={breweries.map(b => ({
              id: b.id,
              name: b.name,
              brewery_type: b.brewery_type || '',
              street: b.street || '',
              city: b.city,
              state: b.state,
              postal_code: b.postal_code || '',
              country: b.country || 'United States',
              longitude: b.longitude || '',
              latitude: b.latitude || '',
              phone: b.phone || '',
              website_url: b.website_url || ''
            }))}
            onBrewerySelect={onBrewerySelect}
          />
        </>
      )}
    </div>
  );
};

export default Map;
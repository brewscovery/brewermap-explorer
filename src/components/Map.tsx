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

    const lng = parseFloat(brewery.longitude);
    const lat = parseFloat(brewery.latitude);
    
    if (isNaN(lng) || isNaN(lat)) return;

    map.current.flyTo({
      center: [lng, lat],
      zoom: 15,
      essential: true
    });
  };

  // Watch for brewery selection changes
  useEffect(() => {
    const selectedBrewery = breweries[0];
    if (selectedBrewery?.longitude && selectedBrewery?.latitude) {
      flyToBrewery(selectedBrewery);
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
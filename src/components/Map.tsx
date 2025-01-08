import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Beer } from 'lucide-react';
import type { Brewery } from '@/types/brewery';

interface MapProps {
  breweries: Brewery[];
  onBrewerySelect: (brewery: Brewery) => void;
}

const Map = ({ breweries, onBrewerySelect }: MapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapboxToken, setMapboxToken] = useState<string>('');

  useEffect(() => {
    if (!mapContainer.current || !mapboxToken) return;

    mapboxgl.accessToken = mapboxToken;
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: [-95.7129, 37.0902], // Center of US
      zoom: 3
    });

    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    return () => {
      map.current?.remove();
    };
  }, [mapboxToken]);

  useEffect(() => {
    if (!map.current) return;

    // Remove existing markers
    const markers = document.getElementsByClassName('marker');
    while(markers[0]) {
      markers[0].remove();
    }

    // Add markers for each brewery
    breweries.forEach((brewery) => {
      if (!brewery.longitude || !brewery.latitude) return;

      const markerEl = document.createElement('div');
      markerEl.className = 'marker';
      markerEl.innerHTML = `<div class="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground shadow-lg hover:scale-110 transition-transform cursor-pointer">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 11h1a3 3 0 0 1 0 6h-1"></path><path d="M9 12v6"></path><path d="M13 12v6"></path><path d="M14 7.5c-1 0-1.44.5-3 .5s-2-.5-3-.5-1.72.5-2.5.5a2.5 2.5 0 0 1 0-5c.78 0 1.57.5 2.5.5S9.44 3 11 3s2 .5 3 .5 1.72-.5 2.5-.5a2.5 2.5 0 0 1 0 5c-.78 0-1.5-.5-2.5-.5Z"></path></svg>
      </div>`;

      new mapboxgl.Marker(markerEl)
        .setLngLat([parseFloat(brewery.longitude), parseFloat(brewery.latitude)])
        .setPopup(
          new mapboxgl.Popup({ offset: 25 })
            .setHTML(`
              <div class="flex flex-col gap-2">
                <h3 class="font-bold">${brewery.name}</h3>
                <p class="text-sm">${brewery.street}</p>
                <p class="text-sm">${brewery.city}, ${brewery.state}</p>
                ${brewery.website_url ? `<a href="${brewery.website_url}" target="_blank" rel="noopener noreferrer" class="text-primary hover:underline text-sm">Visit Website</a>` : ''}
              </div>
            `)
        )
        .addTo(map.current);
    });
  }, [breweries, map.current]);

  if (!mapboxToken) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 p-4">
        <p className="text-lg">Please enter your Mapbox public token to view the map:</p>
        <input
          type="text"
          className="w-full max-w-md px-4 py-2 border rounded"
          placeholder="Enter Mapbox token..."
          onChange={(e) => setMapboxToken(e.target.value)}
        />
        <p className="text-sm text-muted-foreground">
          You can get your token from <a href="https://www.mapbox.com/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">mapbox.com</a>
        </p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainer} className="absolute inset-0" />
    </div>
  );
};

export default Map;
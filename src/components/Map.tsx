import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import type { Brewery } from '@/types/brewery';

interface MapProps {
  breweries: Brewery[];
  onBrewerySelect: (brewery: Brewery) => void;
}

const MAPBOX_TOKEN = 'pk.eyJ1IjoibG92YWJsZSIsImEiOiJjbHR3Z3k2NmowMDNqMnFxbTI2M2wyOXozIn0.JYdYhyQiR6KgsFH_HJRwzQ';

const Map = ({ breweries, onBrewerySelect }: MapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    if (!mapContainer.current) return;

    mapboxgl.accessToken = MAPBOX_TOKEN;
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: [-95.7129, 37.0902],
      zoom: 3
    });

    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    return () => {
      map.current?.remove();
    };
  }, []);

  useEffect(() => {
    if (!map.current) return;

    // Remove existing markers
    const markers = document.getElementsByClassName('marker');
    while(markers[0]) {
      markers[0].remove();
    }

    // Add markers for each brewery with valid coordinates
    breweries.forEach((brewery) => {
      if (!brewery.longitude || !brewery.latitude) return;
      
      const lat = parseFloat(brewery.latitude);
      const lng = parseFloat(brewery.longitude);
      
      // Validate coordinates
      if (isNaN(lat) || isNaN(lng) || 
          lat < -90 || lat > 90 || 
          lng < -180 || lng > 180) {
        return;
      }

      const markerEl = document.createElement('div');
      markerEl.className = 'marker';
      markerEl.innerHTML = `<div class="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground shadow-lg hover:scale-110 transition-transform cursor-pointer">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 11h1a3 3 0 0 1 0 6h-1"></path><path d="M9 12v6"></path><path d="M13 12v6"></path><path d="M14 7.5c-1 0-1.44.5-3 .5s-2-.5-3-.5-1.72.5-2.5.5a2.5 2.5 0 0 1 0-5c.78 0 1.57.5 2.5.5S9.44 3 11 3s2 .5 3 .5 1.72-.5 2.5-.5a2.5 2.5 0 0 1 0 5c-.78 0-1.5-.5-2.5-.5Z"></path></svg>
      </div>`;

      try {
        new mapboxgl.Marker(markerEl)
          .setLngLat([lng, lat])
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
      } catch (err) {
        console.error('Error adding marker for brewery:', brewery.name, err);
      }
    });
  }, [breweries]);

  // Add function to center map on brewery
  const centerOnBrewery = (brewery: Brewery) => {
    if (!map.current || !brewery.longitude || !brewery.latitude) return;
    
    const lat = parseFloat(brewery.latitude);
    const lng = parseFloat(brewery.longitude);
    
    // Validate coordinates before centering
    if (isNaN(lat) || isNaN(lng) || 
        lat < -90 || lat > 90 || 
        lng < -180 || lng > 180) {
      return;
    }
    
    map.current.flyTo({
      center: [lng, lat],
      zoom: 15,
      duration: 2000,
      essential: true
    });
  };

  // Update useEffect to listen for brewery selection
  useEffect(() => {
    const handleBrewerySelect = (brewery: Brewery) => {
      centerOnBrewery(brewery);
    };

    if (onBrewerySelect) {
      const originalOnBrewerySelect = onBrewerySelect;
      onBrewerySelect = (brewery: Brewery) => {
        handleBrewerySelect(brewery);
        originalOnBrewerySelect(brewery);
      };
    }
  }, [onBrewerySelect]);

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainer} className="absolute inset-0" />
    </div>
  );
};

export default Map;
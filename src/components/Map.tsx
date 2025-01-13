import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import type { Brewery } from '@/types/brewery';

interface MapProps {
  breweries: Brewery[];
  onBrewerySelect: (brewery: Brewery) => void;
}

const MAPBOX_TOKEN = 'pk.eyJ1IjoiYnJld3Njb3ZlcnkiLCJhIjoiY201bmJhMmRkMDE3eTJwcTRpeHZ6MzFoMyJ9.9MJIileO_bMKCiOVavjSRw';

const Map = ({ breweries, onBrewerySelect }: MapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    if (!mapContainer.current) return;

    mapboxgl.accessToken = MAPBOX_TOKEN;
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: [-95.7129, 37.0902], // Center of US
      zoom: 3
    });

    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    // Add clustering when map loads
    map.current.on('load', () => {
      if (!map.current) return;

      // Add a source for brewery points with clustering enabled
      map.current.addSource('breweries', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: breweries
            .filter(brewery => brewery.longitude && brewery.latitude)
            .map(brewery => ({
              type: 'Feature',
              properties: {
                id: brewery.id,
                name: brewery.name
              },
              geometry: {
                type: 'Point',
                coordinates: [parseFloat(brewery.longitude), parseFloat(brewery.latitude)]
              }
            }))
        },
        cluster: true,
        clusterMaxZoom: 14,
        clusterRadius: 50
      });

      // Add a layer for the clusters
      map.current.addLayer({
        id: 'clusters',
        type: 'circle',
        source: 'breweries',
        filter: ['has', 'point_count'],
        paint: {
          'circle-color': [
            'step',
            ['get', 'point_count'],
            '#51A4DB', // Color for clusters with < 10 points
            10,
            '#2B8CBE', // Color for clusters with < 30 points
            30,
            '#084081' // Color for clusters with >= 30 points
          ],
          'circle-radius': [
            'step',
            ['get', 'point_count'],
            20, // radius for clusters with < 10 points
            10,
            30, // radius for clusters with < 30 points
            30,
            40 // radius for clusters with >= 30 points
          ]
        }
      });

      // Add a layer for the cluster counts
      map.current.addLayer({
        id: 'cluster-count',
        type: 'symbol',
        source: 'breweries',
        filter: ['has', 'point_count'],
        layout: {
          'text-field': '{point_count_abbreviated}',
          'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
          'text-size': 12
        },
        paint: {
          'text-color': '#ffffff'
        }
      });

      // Add a layer for individual points
      map.current.addLayer({
        id: 'unclustered-point',
        type: 'circle',
        source: 'breweries',
        filter: ['!', ['has', 'point_count']],
        paint: {
          'circle-color': '#51A4DB',
          'circle-radius': 8,
          'circle-stroke-width': 2,
          'circle-stroke-color': '#fff'
        }
      });

      // Handle clicks on clusters
      map.current.on('click', 'clusters', (e) => {
        if (!map.current) return;
        const features = map.current.queryRenderedFeatures(e.point, {
          layers: ['clusters']
        });
        if (!features.length) return;

        const clusterId = features[0].properties?.cluster_id;
        const source = map.current.getSource('breweries') as mapboxgl.GeoJSONSource;
        source.getClusterExpansionZoom(clusterId, (err, zoom) => {
          if (err || !map.current) return;

          map.current.easeTo({
            center: (features[0].geometry as any).coordinates,
            zoom: zoom
          });
        });
      });

      // Handle clicks on individual points
      map.current.on('click', 'unclustered-point', (e) => {
        if (!e.features?.[0]?.properties) return;
        const properties = e.features[0].properties;
        const brewery = breweries.find(b => b.id === properties.id);
        if (brewery) {
          onBrewerySelect(brewery);
          
          const coordinates = (e.features[0].geometry as any).coordinates.slice();
          
          // Create popup content
          const popupContent = document.createElement('div');
          popupContent.className = 'flex flex-col gap-2 p-2';
          popupContent.innerHTML = `
            <h3 class="font-bold">${brewery.name}</h3>
            <p class="text-sm">${brewery.street || ''}</p>
            <p class="text-sm">${brewery.city}, ${brewery.state}</p>
            ${brewery.website_url ? `<a href="${brewery.website_url}" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:underline text-sm">Visit Website</a>` : ''}
          `;

          new mapboxgl.Popup()
            .setLngLat(coordinates)
            .setDOMContent(popupContent)
            .addTo(map.current);
        }
      });

      // Change cursor on hover
      map.current.on('mouseenter', 'clusters', () => {
        if (map.current) map.current.getCanvas().style.cursor = 'pointer';
      });
      map.current.on('mouseleave', 'clusters', () => {
        if (map.current) map.current.getCanvas().style.cursor = '';
      });
      map.current.on('mouseenter', 'unclustered-point', () => {
        if (map.current) map.current.getCanvas().style.cursor = 'pointer';
      });
      map.current.on('mouseleave', 'unclustered-point', () => {
        if (map.current) map.current.getCanvas().style.cursor = '';
      });
    });

    return () => {
      map.current?.remove();
    };
  }, [breweries, onBrewerySelect]);

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainer} className="absolute inset-0" />
    </div>
  );
};

export default Map;
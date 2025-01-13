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
          features: []
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
        type: 'symbol',
        source: 'breweries',
        filter: ['!', ['has', 'point_count']],
        layout: {
          'icon-image': 'beer',
          'icon-size': 1,
          'icon-allow-overlap': false
        }
      });

      // Add custom beer icon
      map.current.loadImage(
        'https://raw.githubusercontent.com/mapbox/mapbox-gl-js/main/src/style-spec/reference/marker.png',
        (error, image) => {
          if (error) throw error;
          if (image && map.current && !map.current.hasImage('beer')) {
            map.current.addImage('beer', image);
          }
        }
      );

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
          const popup = new mapboxgl.Popup()
            .setLngLat((e.features[0].geometry as any).coordinates)
            .setHTML(`
              <div class="flex flex-col gap-2">
                <h3 class="font-bold">${brewery.name}</h3>
                <p class="text-sm">${brewery.street}</p>
                <p class="text-sm">${brewery.city}, ${brewery.state}</p>
                ${brewery.website_url ? `<a href="${brewery.website_url}" target="_blank" rel="noopener noreferrer" class="text-primary hover:underline text-sm">Visit Website</a>` : ''}
              </div>
            `)
            .addTo(map.current!);
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
  }, []);

  // Update map data when breweries change
  useEffect(() => {
    if (!map.current || !map.current.isStyleLoaded()) return;

    const features = breweries
      .filter(brewery => brewery.longitude && brewery.latitude)
      .map(brewery => ({
        type: 'Feature' as const,
        properties: {
          id: brewery.id,
          name: brewery.name
        },
        geometry: {
          type: 'Point' as const,
          coordinates: [
            parseFloat(brewery.longitude),
            parseFloat(brewery.latitude)
          ]
        }
      }));

    const source = map.current.getSource('breweries') as mapboxgl.GeoJSONSource;
    if (source) {
      source.setData({
        type: 'FeatureCollection',
        features
      });
    }
  }, [breweries]);

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainer} className="absolute inset-0" />
    </div>
  );
};

export default Map;
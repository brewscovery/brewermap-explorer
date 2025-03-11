
import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import type { Venue } from '@/types/venue';
import type { Feature, Point, FeatureCollection } from 'geojson';

interface MapSourceProps {
  map: mapboxgl.Map;
  venues: Venue[];
  children: React.ReactNode;
}

interface VenueProperties {
  id: string;
  name: string;
  brewery_id: string;
}

const MapSource = ({ map, venues, children }: MapSourceProps) => {
  const sourceAdded = useRef(false);

  useEffect(() => {
    const createGeoJsonData = () => {
      const features: Feature<Point, VenueProperties>[] = venues
        .filter(venue => {
          const lng = parseFloat(venue.longitude || '');
          const lat = parseFloat(venue.latitude || '');
          return !isNaN(lng) && !isNaN(lat);
        })
        .map(venue => ({
          type: 'Feature',
          properties: {
            id: venue.id,
            name: venue.name,
            brewery_id: venue.brewery_id
          },
          geometry: {
            type: 'Point',
            coordinates: [
              parseFloat(venue.longitude || '0'),
              parseFloat(venue.latitude || '0')
            ]
          }
        }));

      console.log(`Created GeoJSON with ${features.length} features`);
      return {
        type: 'FeatureCollection',
        features: features
      } as FeatureCollection<Point, VenueProperties>;
    };

    const addSourceAndLayers = () => {
      console.log('Adding source and layers');
      
      // Clean up existing source and layers
      ['unclustered-point', 'unclustered-point-label', 'cluster-count', 'clusters'].forEach(layer => {
        if (map.getLayer(layer)) {
          map.removeLayer(layer);
        }
      });
      
      if (map.getSource('venues')) {
        map.removeSource('venues');
      }
      
      // Add new source with clustering enabled
      map.addSource('venues', {
        type: 'geojson',
        data: createGeoJsonData(),
        cluster: true,
        clusterMaxZoom: 14,
        clusterRadius: 50,
        generateId: true // Ensures unique IDs for features
      });
      
      sourceAdded.current = true;
      console.log('Source added successfully');
    };

    const initializeSource = () => {
      if (!map.isStyleLoaded()) {
        console.log('Style not loaded, waiting for style.load event');
        const onStyleLoad = () => {
          console.log('Style loaded, initializing source');
          addSourceAndLayers();
          map.off('style.load', onStyleLoad);
        };
        map.on('style.load', onStyleLoad);
      } else {
        console.log('Style already loaded, initializing source');
        addSourceAndLayers();
      }
    };

    // Initialize source when component mounts or venues change
    if (venues.length > 0) {
      console.log(`Initializing source with ${venues.length} venues`);
      initializeSource();
    }

    // Update source data when venues change and source exists
    if (sourceAdded.current) {
      const source = map.getSource('venues') as mapboxgl.GeoJSONSource;
      if (source) {
        console.log('Updating existing source data');
        source.setData(createGeoJsonData());
      }
    }

    return () => {
      if (!map.getStyle()) return;
      
      console.log('Cleaning up source and layers');
      try {
        ['unclustered-point', 'unclustered-point-label', 'cluster-count', 'clusters'].forEach(layer => {
          if (map.getLayer(layer)) {
            map.removeLayer(layer);
          }
        });
        if (map.getSource('venues')) {
          map.removeSource('venues');
        }
        sourceAdded.current = false;
      } catch (error) {
        console.warn('Error cleaning up:', error);
      }
    };
  }, [map, venues]);

  return <>{children}</>;
};

export default MapSource;


import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
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
  const [geoJsonData, setGeoJsonData] = useState<FeatureCollection<Point, VenueProperties> | null>(null);
  const [isStyleLoaded, setIsStyleLoaded] = useState(map.isStyleLoaded());

  // Handle style loading
  useEffect(() => {
    if (!isStyleLoaded) {
      const onStyleLoad = () => {
        console.log('Style loaded in MapSource');
        setIsStyleLoaded(true);
      };
      
      map.once('style.load', onStyleLoad);
      
      return () => {
        map.off('style.load', onStyleLoad);
      };
    }
  }, [map, isStyleLoaded]);

  // Create GeoJSON data from venues
  const createGeoJsonData = useCallback(() => {
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
  }, [venues]);

  // Memoize venues to detect changes
  const venueIds = useMemo(() => {
    return new Set(venues.map(venue => venue.id));
  }, [venues]);

  // Update GeoJSON data when venues change
  useEffect(() => {
    console.log('Venues changed, updating GeoJSON data');
    setGeoJsonData(createGeoJsonData());
  }, [venues, createGeoJsonData, venueIds]);

  // Add source and layers to map
  const addSourceAndLayers = useCallback(() => {
    if (!geoJsonData || !isStyleLoaded) return;
    
    console.log('Adding source and layers');
    
    try {
      // Clean up existing source and layers if they exist
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
        data: geoJsonData,
        cluster: true,
        clusterMaxZoom: 14,
        clusterRadius: 50,
        generateId: true // Ensures unique IDs for features
      });
      
      sourceAdded.current = true;
      console.log('Source added successfully');
    } catch (error) {
      console.error('Error adding source:', error);
    }
  }, [map, geoJsonData, isStyleLoaded]);

  // Initialize the source when the map is loaded
  useEffect(() => {
    if (!geoJsonData || !isStyleLoaded) return;

    addSourceAndLayers();

    // Cleanup function
    return () => {
      if (!map || !map.loaded()) return;
      
      try {
        // Only attempt cleanup if style is loaded
        if (map.isStyleLoaded()) {
          console.log('Cleaning up source and layers');
          ['unclustered-point', 'unclustered-point-label', 'cluster-count', 'clusters'].forEach(layer => {
            if (map.getLayer(layer)) {
              map.removeLayer(layer);
            }
          });
          if (map.getSource('venues')) {
            map.removeSource('venues');
          }
          sourceAdded.current = false;
        }
      } catch (error) {
        console.warn('Error cleaning up:', error);
      }
    };
  }, [map, venues, geoJsonData, addSourceAndLayers, isStyleLoaded]);

  // Update source data when venues change and source exists
  useEffect(() => {
    if (!geoJsonData || !isStyleLoaded) return;
    
    if (sourceAdded.current) {
      try {
        const source = map.getSource('venues') as mapboxgl.GeoJSONSource;
        if (source) {
          console.log('Updating existing source data');
          source.setData(geoJsonData);
        }
      } catch (error) {
        console.error('Error updating source data:', error);
      }
    }
  }, [map, geoJsonData, isStyleLoaded]);

  return <>{children}</>;
};

export default MapSource;

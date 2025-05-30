
import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import type { Venue } from '@/types/venue';
import { useAuth } from '@/contexts/AuthContext';
import { useQueryClient } from '@tanstack/react-query';

interface MapInteractionsProps {
  map: mapboxgl.Map;
  venues: Venue[];
  onVenueSelect: (venue: Venue) => void;
}

const MapInteractions = ({ map, venues, onVenueSelect }: MapInteractionsProps) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const lastSelectedVenueIdRef = useRef<string | null>(null);
  const lastClickTimeRef = useRef<number>(0);

  useEffect(() => {
    if (!map || !map.getStyle) return;

    // Handle clicks on clusters
    const handleClusterClick = (e: mapboxgl.MapMouseEvent) => {
      const features = map.queryRenderedFeatures(e.point, {
        layers: ['clusters']
      });
      
      if (!features.length) return;

      const clusterId = features[0].properties?.cluster_id;
      const source = map.getSource('venues') as mapboxgl.GeoJSONSource;
      
      if (!source) return;

      source.getClusterExpansionZoom(clusterId, (err, zoom) => {
        if (err) return;

        if (!features[0].geometry || features[0].geometry.type !== 'Point') return;

        const coordinates = features[0].geometry.coordinates as [number, number];
        
        map.easeTo({
          center: coordinates,
          zoom: zoom
        });
      });
    };

    // Handle clicks on individual points
    const handlePointClick = (e: mapboxgl.MapMouseEvent) => {
      const features = map.queryRenderedFeatures(e.point, {
        layers: ['unclustered-point']
      });

      if (!features.length || !features[0].properties) return;
      
      const properties = features[0].properties;
      const venue = venues.find(v => v.id === properties.id);
      
      if (!venue || !features[0].geometry || features[0].geometry.type !== 'Point') return;
      
      // Prevent duplicate clicks within 500ms
      const now = Date.now();
      if (lastSelectedVenueIdRef.current === venue.id && 
          now - lastClickTimeRef.current < 500) {
        console.log('Ignoring duplicate map click on venue:', venue.name);
        return;
      }
      
      // Track the selection to prevent duplicates
      lastSelectedVenueIdRef.current = venue.id;
      lastClickTimeRef.current = now;
      
      console.log('Point clicked:', properties);

      // We no longer need to center the map here since handleVenueSelect will do it
      // This removes one source of duplication

      // Call the onVenueSelect callback to show the sidebar
      onVenueSelect(venue);
    };

    // Add cursor change handlers
    const handleMouseEnter = () => map.getCanvas().style.cursor = 'pointer';
    const handleMouseLeave = () => map.getCanvas().style.cursor = '';

    // Add event listeners
    map.on('click', 'clusters', handleClusterClick);
    map.on('click', 'unclustered-point', handlePointClick);
    map.on('mouseenter', 'clusters', handleMouseEnter);
    map.on('mouseleave', 'clusters', handleMouseLeave);
    map.on('mouseenter', 'unclustered-point', handleMouseEnter);
    map.on('mouseleave', 'unclustered-point', handleMouseLeave);

    // Cleanup
    return () => {
      if (!map || !map.getStyle || !map.loaded()) return;
      
      try {
        map.off('click', 'clusters', handleClusterClick);
        map.off('click', 'unclustered-point', handlePointClick);
        map.off('mouseenter', 'clusters', handleMouseEnter);
        map.off('mouseleave', 'clusters', handleMouseLeave);
        map.off('mouseenter', 'unclustered-point', handleMouseEnter);
        map.off('mouseleave', 'unclustered-point', handleMouseLeave);
      } catch (error) {
        console.error('Error cleaning up map event listeners:', error);
      }
    };
  }, [map, venues, onVenueSelect]);

  return null;
};

export default MapInteractions;

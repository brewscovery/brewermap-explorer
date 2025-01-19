import { useEffect } from 'react';
import mapboxgl from 'mapbox-gl';
import type { Brewery } from '@/types/brewery';
import { createPopupContent } from '@/utils/mapUtils';

interface MapInteractionsProps {
  map: mapboxgl.Map;
  breweries: Brewery[];
  onBrewerySelect: (brewery: Brewery) => void;
}

const MapInteractions = ({ map, breweries, onBrewerySelect }: MapInteractionsProps) => {
  useEffect(() => {
    // Handle clicks on clusters
    const handleClusterClick = (e: mapboxgl.MapMouseEvent & { features?: mapboxgl.MapboxGeoJSONFeature[] }) => {
      try {
        const features = map.queryRenderedFeatures(e.point, {
          layers: ['clusters']
        });
        
        if (!features.length) return;

        const clusterId = features[0].properties?.cluster_id;
        const source = map.getSource('breweries') as mapboxgl.GeoJSONSource;
        
        if (!source) {
          console.error('Source not found');
          return;
        }

        source.getClusterExpansionZoom(clusterId, (err, zoom) => {
          if (err) {
            console.error('Error getting cluster zoom:', err);
            return;
          }

          const feature = features[0];
          if (feature.geometry.type !== 'Point') return;

          // Create a simple coordinates array that can be cloned
          const coordinates = feature.geometry.coordinates.slice(0, 2) as [number, number];

          map.easeTo({
            center: coordinates,
            zoom: zoom
          });
        });
      } catch (error) {
        console.error('Error handling cluster click:', error);
      }
    };

    // Handle clicks on individual points
    const handlePointClick = (e: mapboxgl.MapMouseEvent & { features?: mapboxgl.MapboxGeoJSONFeature[] }) => {
      try {
        if (!e.features?.[0]?.properties) return;
        
        const properties = e.features[0].properties;
        const brewery = breweries.find(b => b.id === properties.id);
        
        if (!brewery) return;

        const feature = e.features[0];
        if (feature.geometry.type !== 'Point') return;

        // Create a simple coordinates array that can be cloned
        const coordinates = feature.geometry.coordinates.slice(0, 2) as [number, number];

        // Create a simplified brewery object for the popup
        const simpleBrewery = {
          id: brewery.id,
          name: brewery.name,
          street: brewery.street,
          city: brewery.city,
          state: brewery.state,
          website_url: brewery.website_url
        };

        // Create popup content
        const popupContent = createPopupContent(simpleBrewery);

        // Create and show popup
        new mapboxgl.Popup()
          .setLngLat(coordinates)
          .setDOMContent(popupContent)
          .addTo(map);

        // Notify about brewery selection with the original brewery object
        onBrewerySelect(brewery);
      } catch (error) {
        console.error('Error handling point click:', error);
      }
    };

    // Handle cursor changes
    const handleMouseEnter = () => {
      map.getCanvas().style.cursor = 'pointer';
    };

    const handleMouseLeave = () => {
      map.getCanvas().style.cursor = '';
    };

    // Add event listeners
    map.on('click', 'clusters', handleClusterClick);
    map.on('click', 'unclustered-point', handlePointClick);
    map.on('mouseenter', 'clusters', handleMouseEnter);
    map.on('mouseleave', 'clusters', handleMouseLeave);
    map.on('mouseenter', 'unclustered-point', handleMouseEnter);
    map.on('mouseleave', 'unclustered-point', handleMouseLeave);

    // Cleanup event listeners
    return () => {
      if (!map.getStyle()) return;
      
      map.off('click', 'clusters', handleClusterClick);
      map.off('click', 'unclustered-point', handlePointClick);
      map.off('mouseenter', 'clusters', handleMouseEnter);
      map.off('mouseleave', 'clusters', handleMouseLeave);
      map.off('mouseenter', 'unclustered-point', handleMouseEnter);
      map.off('mouseleave', 'unclustered-point', handleMouseLeave);
    };
  }, [map, breweries, onBrewerySelect]);

  return null;
};

export default MapInteractions;
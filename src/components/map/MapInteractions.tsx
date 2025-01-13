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
      const features = map.queryRenderedFeatures(e.point, {
        layers: ['clusters']
      });
      if (!features.length) return;

      const clusterId = features[0].properties?.cluster_id;
      const source = map.getSource('breweries') as mapboxgl.GeoJSONSource;
      source.getClusterExpansionZoom(clusterId, (err, zoom) => {
        if (err) return;

        map.easeTo({
          center: (features[0].geometry as any).coordinates,
          zoom: zoom
        });
      });
    };

    // Handle clicks on individual points
    const handlePointClick = (e: mapboxgl.MapMouseEvent & { features?: mapboxgl.MapboxGeoJSONFeature[] }) => {
      if (!e.features?.[0]?.properties) return;
      const properties = e.features[0].properties;
      const brewery = breweries.find(b => b.id === properties.id);
      if (brewery) {
        onBrewerySelect(brewery);
        
        const coordinates = (e.features[0].geometry as any).coordinates.slice();
        const popupContent = createPopupContent(brewery);

        new mapboxgl.Popup()
          .setLngLat(coordinates)
          .setDOMContent(popupContent)
          .addTo(map);
      }
    };

    // Handle cursor changes
    const handleClusterMouseEnter = () => {
      map.getCanvas().style.cursor = 'pointer';
    };

    const handleClusterMouseLeave = () => {
      map.getCanvas().style.cursor = '';
    };

    const handlePointMouseEnter = () => {
      map.getCanvas().style.cursor = 'pointer';
    };

    const handlePointMouseLeave = () => {
      map.getCanvas().style.cursor = '';
    };

    // Add event listeners
    map.on('click', 'clusters', handleClusterClick);
    map.on('click', 'unclustered-point', handlePointClick);
    map.on('mouseenter', 'clusters', handleClusterMouseEnter);
    map.on('mouseleave', 'clusters', handleClusterMouseLeave);
    map.on('mouseenter', 'unclustered-point', handlePointMouseEnter);
    map.on('mouseleave', 'unclustered-point', handlePointMouseLeave);

    // Cleanup event listeners
    return () => {
      map.off('click', 'clusters', handleClusterClick);
      map.off('click', 'unclustered-point', handlePointClick);
      map.off('mouseenter', 'clusters', handleClusterMouseEnter);
      map.off('mouseleave', 'clusters', handleClusterMouseLeave);
      map.off('mouseenter', 'unclustered-point', handlePointMouseEnter);
      map.off('mouseleave', 'unclustered-point', handlePointMouseLeave);
    };
  }, [map, breweries, onBrewerySelect]);

  return null;
};

export default MapInteractions;
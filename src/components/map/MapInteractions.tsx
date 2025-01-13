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
    map.on('click', 'clusters', (e) => {
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
    });

    // Handle clicks on individual points
    map.on('click', 'unclustered-point', (e) => {
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
    });

    // Change cursor on hover
    map.on('mouseenter', 'clusters', () => {
      map.getCanvas().style.cursor = 'pointer';
    });
    map.on('mouseleave', 'clusters', () => {
      map.getCanvas().style.cursor = '';
    });
    map.on('mouseenter', 'unclustered-point', () => {
      map.getCanvas().style.cursor = 'pointer';
    });
    map.on('mouseleave', 'unclustered-point', () => {
      map.getCanvas().style.cursor = '';
    });

    return () => {
      map.off('click', 'clusters');
      map.off('click', 'unclustered-point');
      map.off('mouseenter', 'clusters');
      map.off('mouseleave', 'clusters');
      map.off('mouseenter', 'unclustered-point');
      map.off('mouseleave', 'unclustered-point');
    };
  }, [map, breweries, onBrewerySelect]);

  return null;
};

export default MapInteractions;
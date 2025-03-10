
import { supabase } from '@/integrations/supabase/client';
import type { Brewery } from '@/types/brewery';

export const getMapboxToken = async () => {
  const { data } = await supabase.functions.invoke('get-mapbox-token');
  if (!data?.token) {
    throw new Error('Failed to get Mapbox token');
  }
  return data.token;
};

export const createBreweryFeatures = (breweries: Brewery[]) => {
  return breweries
    .filter(brewery => brewery.longitude && brewery.latitude)
    .map(brewery => ({
      type: 'Feature' as const,
      properties: {
        id: brewery.id,
        name: brewery.name
      },
      geometry: {
        type: 'Point' as const,
        coordinates: [parseFloat(brewery.longitude), parseFloat(brewery.latitude)]
      }
    }));
};

export const createPopupContent = (brewery: Brewery) => {
  const popupContent = document.createElement('div');
  popupContent.className = 'flex flex-col gap-2 p-2';
  popupContent.innerHTML = `
    <h3 class="font-bold">${brewery.name}</h3>
    <p class="text-sm">${brewery.street || ''}</p>
    <p class="text-sm">${brewery.city}, ${brewery.state}</p>
    ${brewery.website_url ? `<a href="${brewery.website_url}" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:underline text-sm">Visit Website</a>` : ''}
  `;
  return popupContent;
};

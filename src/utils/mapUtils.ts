
import { supabase } from '@/integrations/supabase/client';
import type { Venue } from '@/types/venue';

export const getMapboxToken = async () => {
  const { data } = await supabase.functions.invoke('get-mapbox-token');
  if (!data?.token) {
    throw new Error('Failed to get Mapbox token');
  }
  return data.token;
};

export const createVenueFeatures = (venues: Venue[]) => {
  return venues
    .filter(venue => venue.longitude && venue.latitude)
    .map(venue => ({
      type: 'Feature' as const,
      properties: {
        id: venue.id,
        name: venue.name
      },
      geometry: {
        type: 'Point' as const,
        coordinates: [parseFloat(venue.longitude), parseFloat(venue.latitude)]
      }
    }));
};

export const createPopupContent = (venue: Venue) => {
  const popupContent = document.createElement('div');
  popupContent.className = 'flex flex-col gap-2 p-2';
  popupContent.innerHTML = `
    <h3 class="font-bold">${venue.name}</h3>
    <p class="text-sm">${venue.street || ''}</p>
    <p class="text-sm">${venue.city}, ${venue.state}</p>
    ${venue.website_url ? `<a href="${venue.website_url}" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:underline text-sm">Visit Website</a>` : ''}
  `;
  return popupContent;
};

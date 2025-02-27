
import { supabase } from '@/integrations/supabase/client';
import type { Brewery } from '@/types/brewery';
import { toast } from 'sonner';

export const getMapboxToken = async () => {
  try {
    console.log('Fetching Mapbox token from Supabase function...');
    const { data, error } = await supabase.functions.invoke('get-mapbox-token');
    
    if (error) {
      console.error('Error fetching Mapbox token:', error);
      throw new Error(`Failed to get Mapbox token: ${error.message}`);
    }
    
    if (!data?.token) {
      console.error('No token returned from Supabase function');
      throw new Error('No token returned from Supabase function');
    }
    
    console.log('Successfully retrieved Mapbox token');
    return data.token;
  } catch (error) {
    console.error('Error in getMapboxToken:', error);
    toast.error('Failed to load map. Please try refreshing the page.');
    
    // Return a fallback token if available in local storage
    const fallbackToken = localStorage.getItem('mapbox_token');
    if (fallbackToken) {
      console.log('Using fallback token from localStorage');
      return fallbackToken;
    }
    
    // If all else fails, throw the error to be handled by the caller
    throw error;
  }
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

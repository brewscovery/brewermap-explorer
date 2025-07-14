import { supabase } from '@/integrations/supabase/client';
import { BreweryImportData, BreweryImportResult } from '@/types/breweryImport';
import { toast } from 'sonner';

interface GeocodeResult {
  longitude: string | null;
  latitude: string | null;
}

const geocodeAddress = async (brewery: BreweryImportData): Promise<GeocodeResult> => {
  try {
    const geocodeResponse = await supabase.functions.invoke('geocode', {
      body: {
        street: brewery.address,
        city: brewery.city,
        state: brewery.state,
        postalCode: brewery.postalCode
      }
    });
    
    if (geocodeResponse.data && geocodeResponse.data.longitude && geocodeResponse.data.latitude) {
      return {
        longitude: geocodeResponse.data.longitude,
        latitude: geocodeResponse.data.latitude
      };
    }
    
    return { longitude: null, latitude: null };
  } catch (error) {
    console.error('Geocoding error:', error);
    return { longitude: null, latitude: null };
  }
};

const createOrUpdateBrewery = async (breweryData: BreweryImportData) => {
  // Check if brewery already exists
  const { data: existingBrewery } = await supabase
    .from('breweries')
    .select('id')
    .ilike('name', breweryData.name)
    .single();

  if (existingBrewery) {
    // Update existing brewery
    const { data: brewery, error } = await supabase
      .from('breweries')
      .update({
        website_url: breweryData.webPage ? 
          (breweryData.webPage.startsWith('http') ? breweryData.webPage : `https://${breweryData.webPage}`) : 
          null,
        is_independent: breweryData.isIndependent,
        country: breweryData.country || 'United States of America'
      })
      .eq('id', existingBrewery.id)
      .select()
      .single();

    if (error) throw error;
    return brewery;
  } else {
    // Create new brewery
    const { data: brewery, error } = await supabase
      .from('breweries')
      .insert({
        name: breweryData.name,
        website_url: breweryData.webPage ? 
          (breweryData.webPage.startsWith('http') ? breweryData.webPage : `https://${breweryData.webPage}`) : 
          null,
        is_independent: breweryData.isIndependent,
        country: breweryData.country || 'United States of America',
        is_verified: true
      })
      .select()
      .single();

    if (error) throw error;
    return brewery;
  }
};

const createVenueIfNeeded = async (breweryData: BreweryImportData, breweryId: string) => {
  // Only create venue if we have address information
  if (!breweryData.address && !breweryData.city) {
    return null;
  }

  // Check if venue already exists for this brewery and address
  const { data: existingVenue } = await supabase
    .from('venues')
    .select('id')
    .eq('brewery_id', breweryId)
    .eq('city', breweryData.city)
    .maybeSingle();

  if (existingVenue) {
    return existingVenue;
  }

  // Geocode the address
  const coordinates = await geocodeAddress(breweryData);

  // Create new venue
  const { data: venue, error } = await supabase
    .from('venues')
    .insert({
      brewery_id: breweryId,
      name: breweryData.name,
      street: breweryData.address || null,
      city: breweryData.city,
      state: breweryData.state,
      postal_code: breweryData.postalCode || null,
      country: breweryData.country || 'United States of America',
      phone: breweryData.phone || null,
      longitude: coordinates.longitude,
      latitude: coordinates.latitude
    })
    .select()
    .single();

  if (error) throw error;

  // Create default venue hours
  const venueHoursData = Array.from({ length: 7 }, (_, index) => ({
    venue_id: venue.id,
    day_of_week: index,
    venue_open_time: '12:00:00',
    venue_close_time: '20:00:00',
    kitchen_open_time: '13:00:00',
    kitchen_close_time: '19:00:00',
    is_closed: true
  }));

  await supabase.from('venue_hours').insert(venueHoursData);

  return venue;
};

export const importBrewery = async (breweryData: BreweryImportData): Promise<BreweryImportResult> => {
  try {
    const brewery = await createOrUpdateBrewery(breweryData);
    const venue = await createVenueIfNeeded(breweryData, brewery.id);

    return {
      success: true,
      name: breweryData.name,
      brewery,
      venue
    };
  } catch (error: any) {
    return {
      success: false,
      name: breweryData.name,
      error: error.message
    };
  }
};

export const bulkImportBreweries = async (breweries: BreweryImportData[]): Promise<BreweryImportResult[]> => {
  const results: BreweryImportResult[] = [];
  let successCount = 0;
  let errorCount = 0;

  for (const brewery of breweries) {
    if (!brewery.selected) continue;

    const result = await importBrewery(brewery);
    results.push(result);

    if (result.success) {
      successCount++;
      toast.success(`✓ ${brewery.name} imported successfully`);
    } else {
      errorCount++;
      toast.error(`✗ Failed to import ${brewery.name}: ${result.error}`);
    }
  }

  toast.success(`Import complete: ${successCount} successful, ${errorCount} failed`);
  return results;
};
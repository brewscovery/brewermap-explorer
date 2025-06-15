
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface BreweryData {
  name: string;
  address: string;
  website: string;
}

interface ParsedAddress {
  street: string;
  city: string;
  state: string;
  postalCode?: string;
}

const parseAddress = (address: string): ParsedAddress => {
  // Parse address like "4055 W Peterson Ave., Suite Rear, Chicago, Illinois 60646-6072"
  const parts = address.split(',').map(part => part.trim());
  
  if (parts.length < 3) {
    throw new Error(`Invalid address format: ${address}`);
  }
  
  // Last part should contain state and zip
  const lastPart = parts[parts.length - 1];
  const stateZipMatch = lastPart.match(/^(.+?)\s+(\d{5}(?:-\d{4})?)$/);
  
  if (!stateZipMatch) {
    throw new Error(`Could not parse state and zip from: ${lastPart}`);
  }
  
  const state = stateZipMatch[1];
  const postalCode = stateZipMatch[2];
  
  // Second to last part should be city
  const city = parts[parts.length - 2];
  
  // Everything before city should be street
  const street = parts.slice(0, -2).join(', ');
  
  return {
    street,
    city,
    state,
    postalCode
  };
};

const geocodeAddress = async (address: ParsedAddress): Promise<{ longitude: string | null; latitude: string | null }> => {
  try {
    const geocodeResponse = await supabase.functions.invoke('geocode', {
      body: {
        street: address.street,
        city: address.city,
        state: address.state,
        postalCode: address.postalCode
      }
    });
    
    if (geocodeResponse.data && geocodeResponse.data.longitude && geocodeResponse.data.latitude) {
      return {
        longitude: geocodeResponse.data.longitude,
        latitude: geocodeResponse.data.latitude
      };
    }
    
    console.warn('Geocoding failed for address:', address);
    return { longitude: null, latitude: null };
  } catch (error) {
    console.error('Geocoding error:', error);
    return { longitude: null, latitude: null };
  }
};

export const createBreweryWithVenue = async (breweryData: BreweryData) => {
  try {
    console.log('Creating brewery:', breweryData.name);
    
    // Parse the address
    const parsedAddress = parseAddress(breweryData.address);
    console.log('Parsed address:', parsedAddress);
    
    // Create brewery
    const { data: brewery, error: breweryError } = await supabase
      .from('breweries')
      .insert({
        name: breweryData.name,
        website_url: breweryData.website.startsWith('www.') ? `https://${breweryData.website}` : breweryData.website,
        is_verified: true,
        country: 'United States of America'
      })
      .select()
      .single();
    
    if (breweryError) {
      throw new Error(`Failed to create brewery: ${breweryError.message}`);
    }
    
    console.log('Created brewery:', brewery);
    
    // Geocode the address
    const coordinates = await geocodeAddress(parsedAddress);
    console.log('Geocoded coordinates:', coordinates);
    
    // Create venue
    const { data: venue, error: venueError } = await supabase
      .from('venues')
      .insert({
        brewery_id: brewery.id,
        name: breweryData.name, // Use brewery name as venue name
        street: parsedAddress.street,
        city: parsedAddress.city,
        state: parsedAddress.state,
        postal_code: parsedAddress.postalCode,
        country: 'United States of America',
        longitude: coordinates.longitude,
        latitude: coordinates.latitude
      })
      .select()
      .single();
    
    if (venueError) {
      throw new Error(`Failed to create venue: ${venueError.message}`);
    }
    
    console.log('Created venue:', venue);
    
    // Create default venue hours
    const venueHoursData = Array.from({ length: 7 }, (_, index) => ({
      venue_id: venue.id,
      day_of_week: index,
      venue_open_time: '12:00:00',
      venue_close_time: '20:00:00',
      kitchen_open_time: '13:00:00',
      kitchen_close_time: '19:00:00',
      is_closed: true // Default to closed
    }));
    
    const { error: hoursError } = await supabase
      .from('venue_hours')
      .insert(venueHoursData);
    
    if (hoursError) {
      console.warn('Failed to create venue hours:', hoursError.message);
    }
    
    return { brewery, venue };
  } catch (error) {
    console.error('Error creating brewery with venue:', error);
    throw error;
  }
};

export const bulkCreateBreweriesWithVenues = async (breweriesData: BreweryData[]) => {
  const results = [];
  let successCount = 0;
  let errorCount = 0;
  
  for (const breweryData of breweriesData) {
    try {
      const result = await createBreweryWithVenue(breweryData);
      results.push({ success: true, brewery: result.brewery, venue: result.venue });
      successCount++;
      toast.success(`Created ${breweryData.name} successfully`);
    } catch (error: any) {
      results.push({ success: false, name: breweryData.name, error: error.message });
      errorCount++;
      toast.error(`Failed to create ${breweryData.name}: ${error.message}`);
    }
  }
  
  toast.success(`Import complete: ${successCount} successful, ${errorCount} failed`);
  return results;
};

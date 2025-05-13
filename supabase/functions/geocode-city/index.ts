
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.43.5';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") || "";
const MAPBOX_ACCESS_TOKEN = Deno.env.get("MAPBOX_ACCESS_TOKEN") || "";

/**
 * This function geocodes a city name and finds venues within a radius (defaults to 50km)
 */
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders, status: 204 });
  }

  try {
    // Create Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    // Parse request body
    const { city, radius = 50 } = await req.json();

    if (!city) {
      return new Response(
        JSON.stringify({ error: 'City name is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    if (!MAPBOX_ACCESS_TOKEN) {
      return new Response(
        JSON.stringify({ error: 'Mapbox access token not configured' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    // Geocode the city name using Mapbox API
    console.log(`Geocoding city: ${city}`);
    const geocodeUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(city)}.json?access_token=${MAPBOX_ACCESS_TOKEN}&types=place`;
    
    const geocodeResponse = await fetch(geocodeUrl);
    const geocodeData = await geocodeResponse.json();

    if (!geocodeData.features || geocodeData.features.length === 0) {
      console.log(`No geocode results found for city: ${city}`);
      return new Response(
        JSON.stringify({ data: [] }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    // Extract coordinates from the first result
    const [longitude, latitude] = geocodeData.features[0].center;
    console.log(`City coordinates: ${latitude}, ${longitude}`);
    
    // Find venues within the specified radius using our SQL function
    const { data: venues, error } = await supabase.rpc(
      'calculate_venues_in_radius', 
      { ref_lat: latitude, ref_lon: longitude, radius_km: radius }
    );

    if (error) {
      console.error('Error querying venues within radius:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to find venues in radius' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    console.log(`Found ${venues?.length || 0} venues within ${radius}km of ${city}`);

    return new Response(
      JSON.stringify({ data: venues || [] }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
    
  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});

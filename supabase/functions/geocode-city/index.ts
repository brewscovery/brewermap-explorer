
import { serve } from "https://deno.land/std@0.131.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.21.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  
  try {
    // Get request data
    const { city } = await req.json();
    
    if (!city) {
      return new Response(
        JSON.stringify({ error: "City parameter is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Create Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // First, try to find venues that directly match the city name
    let { data: venues, error } = await supabase
      .from("venues")
      .select("*")
      .ilike("city", `%${city}%`);
      
    if (error) {
      throw error;
    }
    
    // If no direct matches, try to get coordinates for the city using a geocoding service
    if (!venues || venues.length === 0) {
      // You would integrate with a geocoding service here
      // For now, we'll return an empty array
      return new Response(
        JSON.stringify([]),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // If we have venues with the city name, use their coordinates to find nearby venues
    // Let's find all venues within approximately 50km of the first matching venue
    if (venues.length > 0) {
      const referenceVenue = venues[0];
      
      // Skip if we don't have coordinates
      if (!referenceVenue.latitude || !referenceVenue.longitude) {
        return new Response(
          JSON.stringify(venues),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      // Use the calculate_distance function to find venues within 50km
      const { data: nearbyVenues, error: distanceError } = await supabase.rpc(
        "calculate_venues_in_radius",
        {
          ref_lat: parseFloat(referenceVenue.latitude),
          ref_lon: parseFloat(referenceVenue.longitude),
          radius_km: 50
        }
      );
      
      if (distanceError) {
        // Fall back to just the directly matched venues if the distance calculation fails
        return new Response(
          JSON.stringify(venues),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      return new Response(
        JSON.stringify(nearbyVenues),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    return new Response(
      JSON.stringify(venues),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
    
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

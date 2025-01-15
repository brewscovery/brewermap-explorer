import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { city } = await req.json()
    
    // Geocode the city using Mapbox
    const mapboxToken = Deno.env.get('MAPBOX_ACCESS_TOKEN')
    const encodedCity = encodeURIComponent(city)
    const response = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodedCity}.json?access_token=${mapboxToken}`
    )
    
    const data = await response.json()
    const coordinates = data.features?.[0]?.geometry?.coordinates

    if (!coordinates) {
      return new Response(
        JSON.stringify({ error: 'City not found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      )
    }

    // Query breweries within 100km radius
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { data: breweries, error } = await supabase.rpc('calculate_distance', {
      lat1: parseFloat(coordinates[1]),
      lon1: parseFloat(coordinates[0]),
      lat2: null,
      lon2: null
    }).select()
      .from('breweries')
      .filter('latitude', 'not.is', null)
      .filter('longitude', 'not.is', null)
      .execute()

    if (error) {
      console.error('Database error:', error)
      throw error
    }

    // Filter breweries within 100km
    const nearbyBreweries = breweries.filter(brewery => {
      const distance = supabase.rpc('calculate_distance', {
        lat1: parseFloat(coordinates[1]),
        lon1: parseFloat(coordinates[0]),
        lat2: parseFloat(brewery.latitude),
        lon2: parseFloat(brewery.longitude)
      })
      return distance <= 100
    })

    return new Response(
      JSON.stringify(nearbyBreweries),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
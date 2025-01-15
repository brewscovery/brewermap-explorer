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
    console.log('Searching for city:', city)
    
    // Geocode the city using Mapbox
    const mapboxToken = Deno.env.get('MAPBOX_ACCESS_TOKEN')
    if (!mapboxToken) {
      throw new Error('MAPBOX_ACCESS_TOKEN is not configured')
    }

    const encodedCity = encodeURIComponent(city)
    const geocodeResponse = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodedCity}.json?access_token=${mapboxToken}`
    )
    
    if (!geocodeResponse.ok) {
      throw new Error(`Mapbox API error: ${geocodeResponse.statusText}`)
    }

    const geocodeData = await geocodeResponse.json()
    const coordinates = geocodeData.features?.[0]?.geometry?.coordinates

    if (!coordinates) {
      return new Response(
        JSON.stringify({ error: 'City not found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      )
    }

    console.log('City coordinates:', coordinates)

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Query breweries and calculate distances
    const { data: breweries, error: dbError } = await supabase
      .from('breweries')
      .select('*')
      .not('latitude', 'is', null)
      .not('longitude', 'is', null)

    if (dbError) {
      console.error('Database error:', dbError)
      throw dbError
    }

    // Filter breweries within 100km radius
    const nearbyBreweries = breweries.filter(brewery => {
      if (!brewery.latitude || !brewery.longitude) return false
      
      const { data: distance } = supabase.rpc('calculate_distance', {
        lat1: parseFloat(coordinates[1]),
        lon1: parseFloat(coordinates[0]),
        lat2: parseFloat(brewery.latitude),
        lon2: parseFloat(brewery.longitude)
      })

      return distance && distance <= 100
    })

    console.log(`Found ${nearbyBreweries.length} breweries within 100km radius`)

    return new Response(
      JSON.stringify(nearbyBreweries),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error in geocode-city function:', error)
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
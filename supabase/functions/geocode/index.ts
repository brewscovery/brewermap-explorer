import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

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
    const { street, city, state, postalCode } = await req.json()
    
    // Construct the address query
    const query = `${street}, ${city}, ${state} ${postalCode}`.trim()
    const encodedQuery = encodeURIComponent(query)
    
    // Call Mapbox Geocoding API
    const mapboxToken = Deno.env.get('MAPBOX_ACCESS_TOKEN')
    const response = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodedQuery}.json?access_token=${mapboxToken}`
    )
    
    const data = await response.json()
    
    // Extract coordinates from the first result
    const coordinates = data.features?.[0]?.geometry?.coordinates
    
    return new Response(
      JSON.stringify({
        longitude: coordinates?.[0]?.toString() || null,
        latitude: coordinates?.[1]?.toString() || null,
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    )
  } catch (error) {
    console.error('Geocoding error:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to geocode address' }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    )
  }
})
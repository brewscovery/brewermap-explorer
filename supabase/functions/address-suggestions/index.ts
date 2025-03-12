
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
    const { query, limit = 5 } = await req.json()
    
    if (!query || typeof query !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Query parameter is required' }),
        { 
          status: 400,
          headers: { 
            ...corsHeaders,
            'Content-Type': 'application/json'
          }
        }
      )
    }
    
    const encodedQuery = encodeURIComponent(query)
    const mapboxToken = Deno.env.get('MAPBOX_ACCESS_TOKEN')
    
    if (!mapboxToken) {
      console.error('MAPBOX_ACCESS_TOKEN not found in environment variables')
      throw new Error('MAPBOX_ACCESS_TOKEN not found')
    }
    
    console.log(`Fetching address suggestions for: ${query}`)
    
    // Request address suggestions from Mapbox
    const response = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodedQuery}.json?access_token=${mapboxToken}&country=us&types=address&autocomplete=true&limit=${limit}`
    )
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error(`Mapbox API error: ${response.status} - ${errorText}`)
      throw new Error(`Mapbox API error: ${response.status}`)
    }
    
    const data = await response.json()
    
    // Format suggestions for frontend use
    const suggestions = data.features.map(feature => {
      const { place_name, center } = feature
      
      // Parse address components
      const addressParts = place_name.split(', ')
      let street = addressParts[0] || ''
      let city = addressParts[1] || ''
      let stateZip = addressParts[2] || ''
      let state = ''
      let postalCode = ''
      
      // Extract state and zip
      if (stateZip) {
        const stateZipParts = stateZip.split(' ')
        state = stateZipParts[0] || ''
        postalCode = stateZipParts[1] || ''
      }
      
      return {
        fullAddress: place_name,
        street,
        city, 
        state,
        postalCode,
        longitude: center[0]?.toString() || null,
        latitude: center[1]?.toString() || null
      }
    })
    
    console.log(`Returning ${suggestions.length} suggestions`)
    
    return new Response(
      JSON.stringify({ suggestions }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    )
  } catch (error) {
    console.error('Address suggestions error:', error)
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to get address suggestions' }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    )
  }
})

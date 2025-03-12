
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
    
    // Request address suggestions from Mapbox - removed the country=us filter
    const response = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodedQuery}.json?access_token=${mapboxToken}&types=address&autocomplete=true&limit=${limit}`
    )
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error(`Mapbox API error: ${response.status} - ${errorText}`)
      throw new Error(`Mapbox API error: ${response.status}`)
    }
    
    const data = await response.json()
    
    // Format suggestions for frontend use
    const suggestions = data.features.map(feature => {
      const { place_name, center, context = [] } = feature
      
      // Parse address components
      let street = ''
      let city = ''
      let state = ''
      let postalCode = ''
      let country = 'Australia'  // Default to Australia
      
      // Get the main address line (usually the street with number)
      street = feature.text || ''
      
      // Parse context data (Mapbox provides location hierarchy details here)
      context.forEach(item => {
        if (item.id.startsWith('place')) {
          city = item.text
        } else if (item.id.startsWith('region')) {
          state = item.text
        } else if (item.id.startsWith('postcode')) {
          postalCode = item.text
        } else if (item.id.startsWith('country')) {
          country = item.text
        }
      })
      
      // Handle Australian address formats
      // Australian format: "streetnumber street, city state postal code, country"
      if (country === 'Australia') {
        // If we didn't get components from context, try to parse from place_name
        if ((!city || !state || !postalCode) && place_name) {
          const parts = place_name.split(', ')
          
          if (parts.length >= 2) {
            // For Australian addresses, ensure street includes the number
            if (parts[0] && (!street || !street.match(/^\d+/))) {
              street = parts[0] // This should contain "streetnumber street"
            }
            
            // Second part usually contains city, state and postal code
            if (parts[1] && (!city || !state || !postalCode)) {
              const locationParts = parts[1].trim().split(' ')
              // The last part is typically the postal code
              if (locationParts.length >= 2 && /^\d{4}$/.test(locationParts[locationParts.length - 1])) {
                postalCode = locationParts.pop() || ''
                // The second last part is typically the state abbreviation
                if (locationParts.length >= 1) {
                  state = locationParts.pop() || ''
                  // Everything else would be the city
                  city = locationParts.join(' ')
                }
              }
            }
          }
        }
        
        // Ensure street number is included in the street field
        if (feature.address && street && !street.startsWith(feature.address)) {
          street = `${feature.address} ${street}`
        }
      }
      
      // General international fallback parsing if components are missing
      if ((!city || !state || !postalCode) && place_name) {
        const addressParts = place_name.split(', ')
        
        if (!street && addressParts[0]) {
          street = addressParts[0]
        }
        
        // For remaining parts, try to extract city, state, postal code
        if (addressParts.length > 1) {
          const secondPart = addressParts[1] || ''
          const thirdPart = addressParts[2] || ''
          
          // Handle city and country
          if (!city && secondPart && !secondPart.includes(' ')) {
            city = secondPart
          } else if (!city && secondPart) {
            // Try to extract city from second part
            const cityParts = secondPart.split(' ')
            if (cityParts.length > 1) {
              // Look for postal code patterns
              const postalCodeIndex = cityParts.findIndex(part => /^\d+$/.test(part))
              if (postalCodeIndex >= 0) {
                postalCode = cityParts[postalCodeIndex]
                cityParts.splice(postalCodeIndex, 1)
              }
              
              // Assume last part might be state abbreviation if it's 2-3 chars
              if (cityParts.length > 1 && cityParts[cityParts.length-1].length <= 3) {
                state = cityParts.pop() || ''
              }
              
              city = cityParts.join(' ')
            }
          }
          
          // If we still don't have location data and there's a third part
          if ((!state || !postalCode) && thirdPart) {
            const stateParts = thirdPart.split(' ')
            
            // Postal code is often numeric
            const postalIndex = stateParts.findIndex(part => /\d/.test(part))
            if (postalIndex >= 0) {
              postalCode = stateParts[postalIndex]
              stateParts.splice(postalIndex, 1)
            }
            
            // Rest could be state
            if (!state && stateParts.length > 0) {
              state = stateParts.join(' ')
            }
          }
        }
      }
      
      return {
        fullAddress: place_name,
        street,
        city, 
        state,
        postalCode,
        country,
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

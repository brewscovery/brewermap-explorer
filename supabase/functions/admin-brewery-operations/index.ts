
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.47.12'
import { corsHeaders } from '../_shared/cors.ts'

const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''

Deno.serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Create a Supabase client with the service role key
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    // Get the operation type and data from the request
    const { operation, breweryData, venueData, breweryId, venueId } = await req.json()
    
    // Get the user token from the request headers
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    // Verify the user is an admin
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: userError } = await supabase.auth.getUser(token)
    
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    // Get the user's profile to check if they are an admin
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('user_type')
      .eq('id', user.id)
      .single()
      
    if (profileError || !profile) {
      return new Response(
        JSON.stringify({ error: 'Could not verify user type' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    if (profile.user_type !== 'admin') {
      return new Response(
        JSON.stringify({ error: 'Insufficient permissions' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    let result;
    
    // Handle different operations
    switch (operation) {
      case 'createBrewery':
        console.log('Creating brewery:', breweryData)
        const { data: newBrewery, error: createError } = await supabase
          .from('breweries')
          .insert([breweryData])
          .select()
          .single()
        
        if (createError) {
          console.error('Error creating brewery:', createError)
          throw new Error(`Failed to create brewery: ${createError.message}`)
        }
        
        result = { brewery: newBrewery }
        break
        
      case 'updateBrewery':
        console.log('Updating brewery:', breweryId, breweryData)
        const { data: updatedBrewery, error: updateError } = await supabase
          .from('breweries')
          .update(breweryData)
          .eq('id', breweryId)
          .select()
          .single()
        
        if (updateError) {
          console.error('Error updating brewery:', updateError)
          throw new Error(`Failed to update brewery: ${updateError.message}`)
        }
        
        result = { brewery: updatedBrewery }
        break
        
      case 'deleteBrewery':
        console.log('Deleting brewery:', breweryId)
        // First check if brewery has any venues
        const { data: venues, error: venuesError } = await supabase
          .from('venues')
          .select('id')
          .eq('brewery_id', breweryId)
        
        if (venuesError) {
          console.error('Error checking venues:', venuesError)
          throw new Error(`Failed to check venues: ${venuesError.message}`)
        }
        
        // Delete all venues if they exist
        if (venues && venues.length > 0) {
          console.log(`Deleting ${venues.length} venues for brewery ${breweryId}`)
          const { error: deleteVenuesError } = await supabase
            .from('venues')
            .delete()
            .eq('brewery_id', breweryId)
          
          if (deleteVenuesError) {
            console.error('Error deleting venues:', deleteVenuesError)
            throw new Error(`Failed to delete venues: ${deleteVenuesError.message}`)
          }
        }
        
        // Delete brewery owners if they exist
        const { error: deleteOwnersError } = await supabase
          .from('brewery_owners')
          .delete()
          .eq('brewery_id', breweryId)
        
        if (deleteOwnersError) {
          console.error('Error deleting brewery owners:', deleteOwnersError)
          throw new Error(`Failed to delete brewery owners: ${deleteOwnersError.message}`)
        }
        
        // Delete brewery
        const { error: deleteBreweryError } = await supabase
          .from('breweries')
          .delete()
          .eq('id', breweryId)
        
        if (deleteBreweryError) {
          console.error('Error deleting brewery:', deleteBreweryError)
          throw new Error(`Failed to delete brewery: ${deleteBreweryError.message}`)
        }
        
        result = { success: true }
        break
        
      case 'createVenue':
        console.log('Creating venue:', venueData)
        const { data: newVenue, error: createVenueError } = await supabase
          .from('venues')
          .insert([venueData])
          .select()
          .single()
        
        if (createVenueError) {
          console.error('Error creating venue:', createVenueError)
          throw new Error(`Failed to create venue: ${createVenueError.message}`)
        }
        
        result = { venue: newVenue }
        break
        
      case 'updateVenue':
        console.log('Updating venue:', venueId, venueData)
        const { data: updatedVenue, error: updateVenueError } = await supabase
          .from('venues')
          .update(venueData)
          .eq('id', venueId)
          .select()
          .single()
        
        if (updateVenueError) {
          console.error('Error updating venue:', updateVenueError)
          throw new Error(`Failed to update venue: ${updateVenueError.message}`)
        }
        
        result = { venue: updatedVenue }
        break
        
      case 'deleteVenue':
        console.log('Deleting venue:', venueId)
        // Delete venue hours if they exist
        const { error: deleteHoursError } = await supabase
          .from('venue_hours')
          .delete()
          .eq('venue_id', venueId)
        
        if (deleteHoursError) {
          console.error('Error deleting venue hours:', deleteHoursError)
          throw new Error(`Failed to delete venue hours: ${deleteHoursError.message}`)
        }
        
        // Delete venue happy hours if they exist
        const { error: deleteHappyHoursError } = await supabase
          .from('venue_happy_hours')
          .delete()
          .eq('venue_id', venueId)
        
        if (deleteHappyHoursError) {
          console.error('Error deleting venue happy hours:', deleteHappyHoursError)
          throw new Error(`Failed to delete venue happy hours: ${deleteHappyHoursError.message}`)
        }
        
        // Delete venue daily specials if they exist
        const { error: deleteSpecialsError } = await supabase
          .from('venue_daily_specials')
          .delete()
          .eq('venue_id', venueId)
        
        if (deleteSpecialsError) {
          console.error('Error deleting venue daily specials:', deleteSpecialsError)
          throw new Error(`Failed to delete venue daily specials: ${deleteSpecialsError.message}`)
        }
        
        // Delete venue
        const { error: deleteVenueError } = await supabase
          .from('venues')
          .delete()
          .eq('id', venueId)
        
        if (deleteVenueError) {
          console.error('Error deleting venue:', deleteVenueError)
          throw new Error(`Failed to delete venue: ${deleteVenueError.message}`)
        }
        
        result = { success: true }
        break
        
      default:
        throw new Error('Invalid operation')
    }
    
    return new Response(
      JSON.stringify(result),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
    
  } catch (error) {
    console.error('Error in admin-brewery-operations:', error.message)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

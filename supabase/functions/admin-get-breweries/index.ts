
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
    
    // Get the search query from the request
    const { searchQuery } = await req.json()
    
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
    
    // Query breweries with search filter if provided
    let breweryQuery = supabase
      .from('breweries')
      .select('id, name, brewery_type, is_verified, website_url, created_at')
      
    if (searchQuery) {
      breweryQuery = breweryQuery.ilike('name', `%${searchQuery}%`)
    }
    
    const { data: breweries, error: breweriesError } = await breweryQuery
    
    if (breweriesError) {
      console.error('Error fetching breweries:', breweriesError)
      return new Response(
        JSON.stringify({ error: 'Error fetching breweries' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    // If no breweries found, return empty array
    if (!breweries || breweries.length === 0) {
      return new Response(
        JSON.stringify({ breweries: [] }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    // Get brewery IDs for further queries
    const breweryIds = breweries.map(brewery => brewery.id)
    
    // Get venue counts for each brewery
    const { data: venues, error: venuesError } = await supabase
      .from('venues')
      .select('brewery_id')
      .in('brewery_id', breweryIds)
    
    if (venuesError) {
      console.error('Error fetching venues:', venuesError)
    }
    
    // Count venues per brewery
    const venueCounts = {}
    if (venues) {
      venues.forEach(venue => {
        venueCounts[venue.brewery_id] = (venueCounts[venue.brewery_id] || 0) + 1
      })
    }
    
    // Get brewery owners
    const { data: owners, error: ownersError } = await supabase
      .from('brewery_owners')
      .select('brewery_id, user_id')
      .in('brewery_id', breweryIds)
    
    if (ownersError) {
      console.error('Error fetching brewery owners:', ownersError)
    }
    
    // Group owners by brewery
    const breweryOwners = {}
    if (owners) {
      owners.forEach(owner => {
        if (!breweryOwners[owner.brewery_id]) {
          breweryOwners[owner.brewery_id] = []
        }
        breweryOwners[owner.brewery_id].push(owner.user_id)
      })
    }
    
    // Get owner profiles if there are any owners
    const allOwnerIds = owners ? owners.map(owner => owner.user_id) : []
    
    let ownerProfiles = []
    if (allOwnerIds.length > 0) {
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, first_name, last_name')
        .in('id', allOwnerIds)
      
      if (profilesError) {
        console.error('Error fetching owner profiles:', profilesError)
      } else {
        ownerProfiles = profiles || []
      }
    }
    
    // Create map of owner IDs to names
    const ownerNames = {}
    ownerProfiles.forEach(profile => {
      ownerNames[profile.id] = profile.first_name && profile.last_name 
        ? `${profile.first_name} ${profile.last_name}`.trim()
        : 'Unknown'
    })
    
    // Enhance breweries with venue counts and owner names
    const enhancedBreweries = breweries.map(brewery => {
      const breweryOwnerIds = breweryOwners[brewery.id] || []
      const ownerNamesList = breweryOwnerIds.map(id => ownerNames[id] || 'Unknown')
      
      return {
        ...brewery,
        venue_count: venueCounts[brewery.id] || 0,
        owner_name: ownerNamesList.join(', ') || 'No owner'
      }
    })
    
    return new Response(
      JSON.stringify({ breweries: enhancedBreweries }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
    
  } catch (error) {
    console.error('Error in admin-get-breweries:', error.message)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

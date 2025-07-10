
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
    
    // Step 1: Query breweries with search filter if provided
    console.log("Querying breweries with search:", searchQuery || "none")
    let breweryQuery = supabase
      .from('breweries')
      .select('*') // Select all fields
      
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
    
    console.log(`Found ${breweries?.length || 0} breweries`)
    
    // If no breweries found, return empty array
    if (!breweries || breweries.length === 0) {
      return new Response(
        JSON.stringify({ breweries: [] }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    // Step 2: Get brewery IDs for further queries
    const breweryIds = breweries.map(brewery => brewery.id)
    
    // Step 3: Get venue counts and state information for each brewery
    const { data: venues, error: venuesError } = await supabase
      .from('venues')
      .select('brewery_id, id, state, country')
      .in('brewery_id', breweryIds)
    
    if (venuesError) {
      console.error('Error fetching venues:', venuesError)
    }
    
    // Count venues and collect states per brewery
    const venueCounts = {}
    const breweryStates = {}
    if (venues && venues.length > 0) {
      venues.forEach(venue => {
        venueCounts[venue.brewery_id] = (venueCounts[venue.brewery_id] || 0) + 1
        
        // Collect unique states for each brewery
        if (venue.state) {
          if (!breweryStates[venue.brewery_id]) {
            breweryStates[venue.brewery_id] = new Set()
          }
          breweryStates[venue.brewery_id].add(venue.state)
        }
      })
    }
    
    // Convert state sets to arrays and get primary state (first alphabetically)
    const breweryPrimaryStates = {}
    Object.keys(breweryStates).forEach(breweryId => {
      const statesArray = Array.from(breweryStates[breweryId]).sort()
      breweryPrimaryStates[breweryId] = statesArray[0] // Use first state alphabetically as primary
    })
    
    // Step 4: Get brewery owners with JOIN to profiles to get the names directly
    console.log("Fetching brewery owners with profile data")
    const { data: ownersWithProfiles, error: ownersError } = await supabase
      .from('brewery_owners')
      .select(`
        brewery_id,
        user_id,
        profiles:user_id (
          first_name,
          last_name
        )
      `)
      .in('brewery_id', breweryIds)
    
    if (ownersError) {
      console.error('Error fetching brewery owners:', ownersError)
    }
    
    console.log(`Found ${ownersWithProfiles?.length || 0} brewery owners with profiles`)
    
    // Group owners by brewery
    const breweryOwners = {}
    const ownerNames = {}
    
    if (ownersWithProfiles && ownersWithProfiles.length > 0) {
      ownersWithProfiles.forEach(owner => {
        // Extract profile data
        const profile = owner.profiles
        const ownerName = profile && (profile.first_name || profile.last_name) 
          ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim()
          : 'Unknown'
        
        // Store owner name by user_id for easy lookup
        ownerNames[owner.user_id] = ownerName
        
        // Group owners by brewery
        if (!breweryOwners[owner.brewery_id]) {
          breweryOwners[owner.brewery_id] = []
        }
        breweryOwners[owner.brewery_id].push({
          userId: owner.user_id,
          name: ownerName
        })
      })
    }
    
    console.log("Owner names lookup created:", Object.keys(ownerNames).length)
    console.log("Brewery owners grouped by brewery:", Object.keys(breweryOwners).length)
    
    // Step 5: Enhance breweries with venue counts and owner names
    const enhancedBreweries = breweries.map(brewery => {
      const ownersForBrewery = breweryOwners[brewery.id] || []
      const ownerNamesList = ownersForBrewery.map(owner => owner.name)
      
      // Include the country directly from the brewery data
      return {
        ...brewery, // Include all brewery fields first
        venue_count: venueCounts[brewery.id] || 0,
        owner_name: ownerNamesList.length > 0 ? ownerNamesList.join(', ') : 'No owner',
        // Use the country value from the brewery data, and only fall back to 'Unknown' if it's null
        country: brewery.country || 'Unknown',
        // Add primary state from venues (first state alphabetically if multiple)
        state: breweryPrimaryStates[brewery.id] || null
      }
    })
    
    console.log("Enhanced breweries created, returning data")
    
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

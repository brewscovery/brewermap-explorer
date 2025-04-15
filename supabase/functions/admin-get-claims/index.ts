
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
    
    // Fetch claims data
    const { data: claims, error: claimsError } = await supabase
      .from('brewery_claims')
      .select('*')
    
    if (claimsError) {
      console.error('Error fetching claims:', claimsError)
      return new Response(
        JSON.stringify({ error: 'Error fetching claims' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    if (!claims || claims.length === 0) {
      return new Response(
        JSON.stringify({ claims: [] }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    // Get brewery names and user names in separate queries
    const breweryIds = claims.map(claim => claim.brewery_id)
    const userIds = claims.map(claim => claim.user_id)
    
    // Fetch brewery names
    const { data: breweries, error: breweriesError } = await supabase
      .from('breweries')
      .select('id, name')
      .in('id', breweryIds)
      
    if (breweriesError) {
      console.error('Error fetching breweries:', breweriesError)
    }
    
    // Fetch user profiles with first and last names
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, first_name, last_name')
      .in('id', userIds)
      
    if (profilesError) {
      console.error('Error fetching profiles:', profilesError)
    }
    
    // Create maps for easy lookup
    const breweryMap = new Map()
    if (breweries) {
      breweries.forEach(brewery => {
        breweryMap.set(brewery.id, brewery.name)
      })
    }
    
    const userMap = new Map()
    if (profiles) {
      profiles.forEach(profile => {
        userMap.set(profile.id, 
          profile.first_name && profile.last_name 
            ? `${profile.first_name} ${profile.last_name}` 
            : profile.first_name || profile.last_name || 'Unknown User')
      })
    }
    
    // Enhance claims with names
    const enhancedClaims = claims.map(claim => ({
      ...claim,
      brewery_name: breweryMap.get(claim.brewery_id) || 'Unknown Brewery',
      user_name: userMap.get(claim.user_id) || 'Unknown User'
    }))
    
    return new Response(
      JSON.stringify({ claims: enhancedClaims }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
    
  } catch (error) {
    console.error('Error in admin-get-claims:', error.message)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

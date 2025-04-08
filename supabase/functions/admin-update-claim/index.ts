
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
    
    // Get the update data from the request
    const { claimId, status, adminNotes } = await req.json()
    
    if (!claimId || !status) {
      return new Response(
        JSON.stringify({ error: 'Claim ID and status are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
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
    
    // Prepare update data
    const updates = {
      status,
      admin_notes: adminNotes,
      decision_at: status !== 'pending' ? new Date().toISOString() : null,
      updated_at: new Date().toISOString()
    }
    
    // Update claim
    const { data, error } = await supabase
      .from('brewery_claims')
      .update(updates)
      .eq('id', claimId)
      .select()
      
    if (error) {
      console.error('Error updating brewery claim:', error)
      return new Response(
        JSON.stringify({ error: 'Error updating claim' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    const claim = data && data.length > 0 ? data[0] : null
    
    // If the claim was approved, handle brewery ownership
    if (status === 'approved' && claim) {
      // Update brewery verification status
      const { error: breweryError } = await supabase
        .from('breweries')
        .update({ is_verified: true })
        .eq('id', claim.brewery_id)
        
      if (breweryError) {
        console.error('Error updating brewery verification:', breweryError)
        return new Response(
          JSON.stringify({ error: 'Error updating brewery' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      
      // Check if brewery owner relationship already exists
      const { data: existingOwner, error: existingOwnerError } = await supabase
        .from('brewery_owners')
        .select('id')
        .eq('brewery_id', claim.brewery_id)
        .eq('user_id', claim.user_id)
        
      if (existingOwnerError) {
        console.error('Error checking existing owner:', existingOwnerError)
      }
      
      // Create brewery owner relationship if it doesn't exist
      if (!existingOwner || existingOwner.length === 0) {
        const { error: ownerError } = await supabase
          .from('brewery_owners')
          .insert({
            brewery_id: claim.brewery_id,
            user_id: claim.user_id
          })
          
        if (ownerError) {
          console.error('Error creating brewery owner:', ownerError)
          return new Response(
            JSON.stringify({ error: 'Error creating brewery owner' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
      }
    }
    
    return new Response(
      JSON.stringify({ claim }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
    
  } catch (error) {
    console.error('Error in admin-update-claim:', error.message)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

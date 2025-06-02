
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.47.12'
import { corsHeaders } from '../_shared/cors.ts'

const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''

Deno.serve(async (req) => {
  // Handle CORS preflight requests
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
    
    // Get the claim details first to check if it's an auto-generated claim
    const { data: claim, error: claimError } = await supabase
      .from('brewery_claims')
      .select('brewery_id, claim_type, user_id')
      .eq('id', claimId)
      .single()
      
    if (claimError) {
      console.error('Error fetching claim:', claimError)
      return new Response(
        JSON.stringify({ error: 'Error fetching claim details' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // If claim is being rejected and it's an auto-generated claim, delete the brewery
    if (status === 'rejected' && claim.claim_type === 'auto') {
      console.log('Deleting brewery for rejected auto-claim:', claim.brewery_id)
      
      // Delete brewery owners first
      const { error: ownersError } = await supabase
        .from('brewery_owners')
        .delete()
        .eq('brewery_id', claim.brewery_id)
      
      if (ownersError) {
        console.error('Error deleting brewery owners:', ownersError)
        return new Response(
          JSON.stringify({ error: 'Error deleting brewery owners' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Delete all claims for this brewery
      const { error: claimsError } = await supabase
        .from('brewery_claims')
        .delete()
        .eq('brewery_id', claim.brewery_id)
      
      if (claimsError) {
        console.error('Error deleting brewery claims:', claimsError)
        return new Response(
          JSON.stringify({ error: 'Error deleting brewery claims' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Finally delete the brewery
      const { error: breweryError } = await supabase
        .from('breweries')
        .delete()
        .eq('id', claim.brewery_id)
      
      if (breweryError) {
        console.error('Error deleting brewery:', breweryError)
        return new Response(
          JSON.stringify({ error: 'Error deleting brewery' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      console.log('Successfully deleted brewery and related data')
      return new Response(
        JSON.stringify({ message: 'Brewery and claim deleted successfully' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    // For non-auto claims or non-rejection cases, proceed with normal claim update
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
    
    const updatedClaim = data && data.length > 0 ? data[0] : null
    
    // If the claim was approved, handle brewery ownership
    if (status === 'approved' && updatedClaim) {
      // Update brewery verification status
      const { error: breweryError } = await supabase
        .from('breweries')
        .update({ is_verified: true })
        .eq('id', updatedClaim.brewery_id)
        
      if (breweryError) {
        console.error('Error updating brewery verification:', breweryError)
        return new Response(
          JSON.stringify({ error: 'Error updating brewery' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    }

    // Send notification for claim status update if status changed to approved or rejected
    if (status === 'approved' || status === 'rejected') {
      try {
        // Get brewery name for the notification
        const { data: brewery, error: breweryError } = await supabase
          .from('breweries')
          .select('name')
          .eq('id', claim.brewery_id)
          .single()

        if (breweryError) {
          console.error('Error fetching brewery name for notification:', breweryError)
        } else if (brewery?.name) {
          console.log('🔔 Sending claim status notification')
          
          // Check if user has claim_updates enabled using the security definer function
          const { data: usersWithPreferences, error: preferencesError } = await supabase
            .rpc('get_notification_preferences_for_users', { user_ids: [claim.user_id] })

          if (preferencesError) {
            console.error('❌ Error fetching notification preferences for claim update:', preferencesError)
          } else {
            // Check if user has claim_updates enabled
            const userPreferences = usersWithPreferences?.find(user => user.user_id === claim.user_id)
            if (userPreferences?.claim_updates) {
              const notificationType = status === 'approved' ? 'CLAIM_APPROVED' : 'CLAIM_REJECTED'
              const content = status === 'approved' 
                ? `Your claim for ${brewery.name} has been approved! You can now manage this brewery.`
                : `Your claim for ${brewery.name} has been rejected. Please contact support for more information.`

              console.log('📝 Creating claim status notification for user:', claim.user_id)

              const { error: notificationError } = await supabase
                .from('notifications')
                .insert({
                  user_id: claim.user_id,
                  type: notificationType,
                  content,
                  related_entity_id: claimId,
                  related_entity_type: 'brewery_claim'
                })

              if (notificationError) {
                console.error('❌ Error creating claim status notification:', notificationError)
              } else {
                console.log(`✅ Created claim status notification for user ${claim.user_id}`)
              }
            } else {
              console.log('ℹ️ User does not have claim updates enabled')
            }
          }
        }
      } catch (notificationError) {
        console.error('Error sending claim status notification:', notificationError)
        // Don't fail the whole operation for notification errors
      }
    }
    
    return new Response(
      JSON.stringify({ claim: updatedClaim }),
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

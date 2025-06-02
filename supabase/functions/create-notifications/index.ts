
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const body = await req.json()
    console.log('🔔 create-notifications called with:', body)

    const { type } = body

    switch (type) {
      case 'venue_hours_update':
        await handleVenueHoursUpdate(supabaseClient, body)
        break
      case 'happy_hour_update':
        await handleHappyHourUpdate(supabaseClient, body)
        break
      case 'daily_special_update':
        await handleDailySpecialUpdate(supabaseClient, body)
        break
      case 'event_created':
      case 'event_updated':
        await handleEventUpdate(supabaseClient, body)
        break
      case 'claim_status_update':
        await handleClaimStatusUpdate(supabaseClient, body)
        break
      default:
        console.log('Unknown notification type:', type)
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  } catch (error) {
    console.error('Error in create-notifications:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 },
    )
  }
})

async function handleVenueHoursUpdate(supabaseClient: any, body: any) {
  const { venue_id, day_of_week, old_data, new_data } = body
  
  console.log('📍 Processing venue hours update for venue:', venue_id)
  
  // Get venue name
  const { data: venue, error: venueError } = await supabaseClient
    .from('venues')
    .select('name')
    .eq('id', venue_id)
    .single()

  if (venueError || !venue?.name) {
    console.error('❌ Error fetching venue name:', venueError)
    return
  }

  // Get users who have favorited this venue
  const { data: favoriteUsers, error: favoritesError } = await supabaseClient
    .rpc('get_venue_favorites_for_notifications', { venue_id_param: venue_id })

  if (favoritesError) {
    console.error('❌ Error fetching favorite users:', favoritesError)
    return
  }

  console.log('👥 Found users who favorited the venue:', favoriteUsers?.length || 0)

  if (!favoriteUsers || favoriteUsers.length === 0) {
    console.log('ℹ️ No users have favorited this venue')
    return
  }

  // Get notification preferences for these users
  const userIds = favoriteUsers.map(u => u.user_id)
  const { data: usersWithPreferences, error: preferencesError } = await supabaseClient
    .rpc('get_notification_preferences_for_users', { user_ids: userIds })

  if (preferencesError) {
    console.error('❌ Error fetching notification preferences:', preferencesError)
    return
  }

  // Filter users who have venue_updates enabled
  const enabledUsers = usersWithPreferences?.filter(user => user.venue_updates) || []
  console.log('✅ Users with venue_updates enabled:', enabledUsers?.length || 0)

  if (!enabledUsers || enabledUsers.length === 0) {
    console.log('ℹ️ No users have venue updates enabled')
    return
  }

  // Determine what changed
  const changes = []
  if (old_data.venue_open_time !== new_data.venue_open_time || 
      old_data.venue_close_time !== new_data.venue_close_time) {
    changes.push('venue hours')
  }
  if (old_data.kitchen_open_time !== new_data.kitchen_open_time || 
      old_data.kitchen_close_time !== new_data.kitchen_close_time) {
    changes.push('kitchen hours')
  }
  if (old_data.is_closed !== new_data.is_closed) {
    changes.push(new_data.is_closed ? 'closed' : 'reopened')
  }

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  const dayName = dayNames[day_of_week]
  const content = `${venue.name} has updated their ${changes.join(' and ')} for ${dayName}.`

  // Create notifications for each user with preferences enabled
  const notifications = enabledUsers.map(user => ({
    user_id: user.user_id,
    type: changes.includes('kitchen hours') ? 'KITCHEN_HOURS_UPDATE' : 'VENUE_HOURS_UPDATE',
    content,
    related_entity_id: venue_id,
    related_entity_type: 'venue'
  }))

  console.log('📝 Creating notifications:', notifications.length)

  const { error: notificationError } = await supabaseClient
    .from('notifications')
    .insert(notifications)

  if (notificationError) {
    console.error('❌ Error creating notifications:', notificationError)
  } else {
    console.log(`✅ Created ${notifications.length} venue hours notifications`)
  }
}

async function handleHappyHourUpdate(supabaseClient: any, body: any) {
  const { venue_id, data: updateData } = body
  
  console.log('🍻 Processing happy hour update for venue:', venue_id)
  
  // Get venue name
  const { data: venue, error: venueError } = await supabaseClient
    .from('venues')
    .select('name')
    .eq('id', venue_id)
    .single()

  if (venueError || !venue?.name) {
    console.error('❌ Error fetching venue name:', venueError)
    return
  }

  // Get users who have favorited this venue
  const { data: favoriteUsers, error: favoritesError } = await supabaseClient
    .rpc('get_venue_favorites_for_notifications', { venue_id_param: venue_id })

  if (favoritesError) {
    console.error('❌ Error fetching favorite users:', favoritesError)
    return
  }

  console.log('👥 Found users who favorited the venue:', favoriteUsers?.length || 0)

  if (!favoriteUsers || favoriteUsers.length === 0) {
    console.log('ℹ️ No users have favorited this venue')
    return
  }

  // Get notification preferences for these users
  const userIds = favoriteUsers.map(u => u.user_id)
  const { data: usersWithPreferences, error: preferencesError } = await supabaseClient
    .rpc('get_notification_preferences_for_users', { user_ids: userIds })

  if (preferencesError) {
    console.error('❌ Error fetching notification preferences:', preferencesError)
    return
  }

  // Filter users who have happy_hour_updates enabled
  const enabledUsers = usersWithPreferences?.filter(user => user.happy_hour_updates) || []
  console.log('✅ Users with happy_hour_updates enabled:', enabledUsers?.length || 0)

  if (!enabledUsers || enabledUsers.length === 0) {
    console.log('ℹ️ No users have happy hour updates enabled')
    return
  }

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  const dayName = dayNames[updateData?.day_of_week || 0]
  const content = `${venue.name} has updated their happy hours for ${dayName}.`

  // Create notifications for each user with preferences enabled
  const notifications = enabledUsers.map(user => ({
    user_id: user.user_id,
    type: 'HAPPY_HOURS_UPDATE',
    content,
    related_entity_id: venue_id,
    related_entity_type: 'venue'
  }))

  console.log('📝 Creating happy hour notifications:', notifications.length)

  const { error: notificationError } = await supabaseClient
    .from('notifications')
    .insert(notifications)

  if (notificationError) {
    console.error('❌ Error creating happy hour notifications:', notificationError)
  } else {
    console.log(`✅ Created ${notifications.length} happy hour notifications`)
  }
}

async function handleDailySpecialUpdate(supabaseClient: any, body: any) {
  const { venue_id, data: updateData } = body
  
  console.log('🍽️ Processing daily special update for venue:', venue_id)
  
  // Get venue name
  const { data: venue, error: venueError } = await supabaseClient
    .from('venues')
    .select('name')
    .eq('id', venue_id)
    .single()

  if (venueError || !venue?.name) {
    console.error('❌ Error fetching venue name:', venueError)
    return
  }

  // Get users who have favorited this venue
  const { data: favoriteUsers, error: favoritesError } = await supabaseClient
    .rpc('get_venue_favorites_for_notifications', { venue_id_param: venue_id })

  if (favoritesError) {
    console.error('❌ Error fetching favorite users:', favoritesError)
    return
  }

  console.log('👥 Found users who favorited the venue:', favoriteUsers?.length || 0)

  if (!favoriteUsers || favoriteUsers.length === 0) {
    console.log('ℹ️ No users have favorited this venue')
    return
  }

  // Get notification preferences for these users
  const userIds = favoriteUsers.map(u => u.user_id)
  const { data: usersWithPreferences, error: preferencesError } = await supabaseClient
    .rpc('get_notification_preferences_for_users', { user_ids: userIds })

  if (preferencesError) {
    console.error('❌ Error fetching notification preferences:', preferencesError)
    return
  }

  // Filter users who have daily_special_updates enabled
  const enabledUsers = usersWithPreferences?.filter(user => user.daily_special_updates) || []
  console.log('✅ Users with daily_special_updates enabled:', enabledUsers?.length || 0)

  if (!enabledUsers || enabledUsers.length === 0) {
    console.log('ℹ️ No users have daily special updates enabled')
    return
  }

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  const dayName = dayNames[updateData?.day_of_week || 0]
  const content = `${venue.name} has updated their daily specials for ${dayName}.`

  // Create notifications for each user with preferences enabled
  const notifications = enabledUsers.map(user => ({
    user_id: user.user_id,
    type: 'DAILY_SPECIAL_UPDATE',
    content,
    related_entity_id: venue_id,
    related_entity_type: 'venue'
  }))

  console.log('📝 Creating daily special notifications:', notifications.length)

  const { error: notificationError } = await supabaseClient
    .from('notifications')
    .insert(notifications)

  if (notificationError) {
    console.error('❌ Error creating daily special notifications:', notificationError)
  } else {
    console.log(`✅ Created ${notifications.length} daily special notifications`)
  }
}

async function handleEventUpdate(supabaseClient: any, body: any) {
  const { event_id, venue_id, data: eventData, type } = body
  
  console.log('🎉 Processing event update for venue:', venue_id, 'event:', event_id)
  
  // Get venue name
  const { data: venue, error: venueError } = await supabaseClient
    .from('venues')
    .select('name')
    .eq('id', venue_id)
    .single()

  if (venueError || !venue?.name) {
    console.error('❌ Error fetching venue name:', venueError)
    return
  }

  // Get users who have favorited this venue
  const { data: favoriteUsers, error: favoritesError } = await supabaseClient
    .rpc('get_venue_favorites_for_notifications', { venue_id_param: venue_id })

  if (favoritesError) {
    console.error('❌ Error fetching favorite users:', favoritesError)
    return
  }

  // Get users who have expressed interest in this specific event
  const { data: interestedUsers, error: interestError } = await supabaseClient
    .from('event_interests')
    .select('user_id')
    .eq('event_id', event_id)

  if (interestError) {
    console.error('❌ Error fetching interested users:', interestError)
    return
  }

  // Combine and deduplicate users
  const allUserIds = new Set()
  const favoriteUserIds = favoriteUsers?.map(u => u.user_id) || []
  const interestedUserIds = interestedUsers?.map(u => u.user_id) || []
  
  favoriteUserIds.forEach(userId => allUserIds.add(userId))
  interestedUserIds.forEach(userId => allUserIds.add(userId))

  console.log('👥 Found users to potentially notify:', allUserIds.size)

  if (allUserIds.size === 0) {
    console.log('ℹ️ No users to notify for event update')
    return
  }

  // Get notification preferences for these users
  const { data: usersWithPreferences, error: preferencesError } = await supabaseClient
    .rpc('get_notification_preferences_for_users', { user_ids: Array.from(allUserIds) })

  if (preferencesError) {
    console.error('❌ Error fetching notification preferences:', preferencesError)
    return
  }

  // Filter users who have event_updates enabled
  const enabledUsers = usersWithPreferences?.filter(user => user.event_updates) || []
  console.log('✅ Users with event_updates enabled:', enabledUsers?.length || 0)

  if (!enabledUsers || enabledUsers.length === 0) {
    console.log('ℹ️ No users have event updates enabled')
    return
  }

  const eventTitle = eventData?.title || 'Untitled Event'
  const notificationType = type === 'event_created' ? 'EVENT_CREATED' : 'EVENT_UPDATED'
  const action = type === 'event_created' ? 'created' : 'updated'
  const content = `New event "${eventTitle}" has been ${action} at ${venue.name}.`

  // Create notifications for each user with preferences enabled
  const notifications = enabledUsers.map(user => ({
    user_id: user.user_id,
    type: notificationType,
    content,
    related_entity_id: event_id,
    related_entity_type: 'event'
  }))

  console.log('📝 Creating event notifications:', notifications.length)

  const { error: notificationError } = await supabaseClient
    .from('notifications')
    .insert(notifications)

  if (notificationError) {
    console.error('❌ Error creating event notifications:', notificationError)
  } else {
    console.log(`✅ Created ${notifications.length} event notifications`)
  }
}

async function handleClaimStatusUpdate(supabaseClient: any, body: any) {
  const { user_id, claim_id, status, brewery_name } = body
  
  console.log('🔔 Processing claim status update for user:', user_id, 'status:', status)
  
  // Check if user has claim_updates enabled using the security definer function
  const { data: usersWithPreferences, error: preferencesError } = await supabaseClient
    .rpc('get_notification_preferences_for_users', { user_ids: [user_id] })

  if (preferencesError) {
    console.error('❌ Error fetching notification preferences for claim update:', preferencesError)
    return
  }

  // Check if user has claim_updates enabled
  const userPreferences = usersWithPreferences?.find(user => user.user_id === user_id)
  if (!userPreferences?.claim_updates) {
    console.log('ℹ️ User does not have claim updates enabled')
    return
  }

  const notificationType = status === 'approved' ? 'CLAIM_APPROVED' : 'CLAIM_REJECTED'
  const content = status === 'approved' 
    ? `Your claim for ${brewery_name} has been approved! You can now manage this brewery.`
    : `Your claim for ${brewery_name} has been rejected. Please contact support for more information.`

  console.log('📝 Creating claim status notification for user:', user_id)

  const { error: notificationError } = await supabaseClient
    .from('notifications')
    .insert({
      user_id: user_id,
      type: notificationType,
      content,
      related_entity_id: claim_id,
      related_entity_type: 'brewery_claim'
    })

  if (notificationError) {
    console.error('❌ Error creating claim status notification:', notificationError)
  } else {
    console.log(`✅ Created claim status notification for user ${user_id}`)
  }
}


import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.47.12';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface NotificationRequest {
  type: string;
  venue_id?: string;
  event_id?: string;
  user_id?: string;
  claim_id?: string;
  status?: string;
  brewery_name?: string;
  day_of_week?: number;
  operation?: string;
  data?: any;
  old_data?: any;
  new_data?: any;
}

serve(async (req) => {
  console.log('=== Edge function called ===');
  console.log('Method:', req.method);
  console.log('Headers:', Object.fromEntries(req.headers.entries()));

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('Handling OPTIONS request');
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    console.log('Environment check:');
    console.log('SUPABASE_URL:', supabaseUrl ? 'Present' : 'Missing');
    console.log('SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? 'Present' : 'Missing');
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Missing required environment variables');
      return new Response(JSON.stringify({ error: 'Missing environment variables' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    let body: NotificationRequest;
    
    try {
      const text = await req.text();
      console.log('Request body text:', text);
      body = JSON.parse(text);
    } catch (parseError) {
      console.error('Error parsing request body:', parseError);
      return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    console.log('=== Notification function called ===');
    console.log('Request body:', JSON.stringify(body, null, 2));

    switch (body.type) {
      case 'venue_hours_update':
        await handleVenueHoursUpdate(supabase, body);
        break;
      case 'happy_hour_update':
        await handleHappyHourUpdate(supabase, body);
        break;
      case 'daily_special_update':
        await handleDailySpecialUpdate(supabase, body);
        break;
      case 'event_created':
        await handleEventCreated(supabase, body);
        break;
      case 'event_updated':
        await handleEventUpdated(supabase, body);
        break;
      case 'claim_status_update':
        await handleClaimStatusUpdate(supabase, body);
        break;
      default:
        console.log('Unknown notification type:', body.type);
    }

    console.log('=== Notification function completed successfully ===');
    return new Response(JSON.stringify({ success: true, timestamp: new Date().toISOString() }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('=== Error in create-notifications function ===');
    console.error('Error details:', error);
    console.error('Error stack:', error.stack);
    return new Response(JSON.stringify({ 
      error: error.message,
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function handleVenueHoursUpdate(supabase: any, body: NotificationRequest) {
  console.log('=== handleVenueHoursUpdate called ===');
  
  if (!body.venue_id) {
    console.log('No venue_id provided');
    return;
  }

  console.log('Processing venue hours update for venue:', body.venue_id);

  try {
    // Get venue name for the notification content
    const { data: venue, error: venueError } = await supabase
      .from('venues')
      .select('name')
      .eq('id', body.venue_id)
      .single();

    if (venueError) {
      console.error('Error fetching venue:', venueError);
      return;
    }

    if (!venue) {
      console.log('Venue not found');
      return;
    }

    console.log('Found venue:', venue.name);

    // Get users who have this venue in their favorites
    const { data: favoriteUsers, error: favoritesError } = await supabase
      .from('venue_favorites')
      .select('user_id')
      .eq('venue_id', body.venue_id);

    if (favoritesError) {
      console.error('Error fetching venue favorites:', favoritesError);
      return;
    }

    console.log('Found favorite users:', favoriteUsers?.length || 0);

    if (!favoriteUsers || favoriteUsers.length === 0) {
      console.log('No users have this venue in favorites');
      return;
    }

    // Get notification preferences for these users
    const userIds = favoriteUsers.map(f => f.user_id);
    console.log('Checking preferences for user IDs:', userIds);
    
    const { data: preferences, error: preferencesError } = await supabase
      .from('notification_preferences')
      .select('user_id, venue_updates')
      .in('user_id', userIds)
      .eq('venue_updates', true);

    if (preferencesError) {
      console.error('Error fetching notification preferences:', preferencesError);
      return;
    }

    console.log('Users with venue_updates enabled:', preferences?.length || 0);

    if (!preferences || preferences.length === 0) {
      console.log('No users have venue_updates enabled');
      return;
    }

    // Determine notification type and content
    const hasKitchenChanges = body.old_data?.kitchen_open_time !== body.new_data?.kitchen_open_time ||
                             body.old_data?.kitchen_close_time !== body.new_data?.kitchen_close_time;
    const hasVenueChanges = body.old_data?.venue_open_time !== body.new_data?.venue_open_time ||
                           body.old_data?.venue_close_time !== body.new_data?.venue_close_time ||
                           body.old_data?.is_closed !== body.new_data?.is_closed;

    let notificationType = 'VENUE_HOURS_UPDATE';
    let content = `${venue.name} has updated their hours.`;
    
    if (hasKitchenChanges && hasVenueChanges) {
      content = `${venue.name} has updated their venue and kitchen hours.`;
    } else if (hasKitchenChanges) {
      notificationType = 'KITCHEN_HOURS_UPDATE';
      content = `${venue.name} has updated their kitchen hours.`;
    }

    console.log('Creating notifications with content:', content);

    // Create notifications for each user
    const notifications = preferences.map(pref => ({
      user_id: pref.user_id,
      type: notificationType,
      content,
      related_entity_id: body.venue_id,
      related_entity_type: 'venue'
    }));

    console.log('Inserting notifications:', notifications.length);
    console.log('Notification data:', JSON.stringify(notifications, null, 2));

    const { data: insertedData, error: insertError } = await supabase
      .from('notifications')
      .insert(notifications)
      .select();

    if (insertError) {
      console.error('Error creating venue hours notifications:', insertError);
    } else {
      console.log(`Successfully created ${notifications.length} venue hours notifications`);
      console.log('Inserted notifications:', insertedData);
    }
  } catch (error) {
    console.error('Error in handleVenueHoursUpdate:', error);
  }
}

async function handleHappyHourUpdate(supabase: any, body: NotificationRequest) {
  console.log('=== handleHappyHourUpdate called ===');
  
  if (!body.venue_id) {
    console.log('No venue_id provided');
    return;
  }

  try {
    // Get venue name
    const { data: venue, error: venueError } = await supabase
      .from('venues')
      .select('name')
      .eq('id', body.venue_id)
      .single();

    if (venueError || !venue) {
      console.error('Error fetching venue or venue not found:', venueError);
      return;
    }

    console.log('Found venue for happy hour update:', venue.name);

    // Get users who have this venue in their favorites
    const { data: favoriteUsers, error: favoritesError } = await supabase
      .from('venue_favorites')
      .select('user_id')
      .eq('venue_id', body.venue_id);

    if (favoritesError) {
      console.error('Error fetching venue favorites:', favoritesError);
      return;
    }

    console.log('Found favorite users for happy hour:', favoriteUsers?.length || 0);

    if (!favoriteUsers || favoriteUsers.length === 0) {
      console.log('No users to notify for happy hour update');
      return;
    }

    // Get notification preferences for these users
    const userIds = favoriteUsers.map(f => f.user_id);
    const { data: preferences, error: preferencesError } = await supabase
      .from('notification_preferences')
      .select('user_id, happy_hour_updates')
      .in('user_id', userIds)
      .eq('happy_hour_updates', true);

    if (preferencesError) {
      console.error('Error fetching happy hour notification preferences:', preferencesError);
      return;
    }

    console.log('Users with happy_hour_updates enabled:', preferences?.length || 0);

    if (!preferences || preferences.length === 0) {
      console.log('No users have happy_hour_updates enabled');
      return;
    }

    const content = body.operation === 'INSERT' 
      ? `${venue.name} has added new happy hour specials!`
      : `${venue.name} has updated their happy hour specials.`;

    const notifications = preferences.map(pref => ({
      user_id: pref.user_id,
      type: 'HAPPY_HOURS_UPDATE',
      content,
      related_entity_id: body.venue_id,
      related_entity_type: 'venue'
    }));

    console.log('Creating happy hour notifications:', notifications.length);

    const { data: insertedData, error: insertError } = await supabase
      .from('notifications')
      .insert(notifications)
      .select();

    if (insertError) {
      console.error('Error creating happy hour notifications:', insertError);
    } else {
      console.log(`Created ${notifications.length} happy hour notifications`);
      console.log('Inserted happy hour notifications:', insertedData);
    }
  } catch (error) {
    console.error('Error in handleHappyHourUpdate:', error);
  }
}

async function handleDailySpecialUpdate(supabase: any, body: NotificationRequest) {
  console.log('=== handleDailySpecialUpdate called ===');
  
  if (!body.venue_id) {
    console.log('No venue_id provided');
    return;
  }

  try {
    // Get venue name
    const { data: venue, error: venueError } = await supabase
      .from('venues')
      .select('name')
      .eq('id', body.venue_id)
      .single();

    if (venueError || !venue) {
      console.error('Error fetching venue or venue not found:', venueError);
      return;
    }

    console.log('Found venue for daily special update:', venue.name);

    // Get users who have this venue in their favorites
    const { data: favoriteUsers, error: favoritesError } = await supabase
      .from('venue_favorites')
      .select('user_id')
      .eq('venue_id', body.venue_id);

    if (favoritesError) {
      console.error('Error fetching venue favorites:', favoritesError);
      return;
    }

    console.log('Found favorite users for daily special:', favoriteUsers?.length || 0);

    if (!favoriteUsers || favoriteUsers.length === 0) {
      console.log('No users to notify for daily special update');
      return;
    }

    // Get notification preferences for these users
    const userIds = favoriteUsers.map(f => f.user_id);
    const { data: preferences, error: preferencesError } = await supabase
      .from('notification_preferences')
      .select('user_id, daily_special_updates')
      .in('user_id', userIds)
      .eq('daily_special_updates', true);

    if (preferencesError) {
      console.error('Error fetching daily special notification preferences:', preferencesError);
      return;
    }

    console.log('Users with daily_special_updates enabled:', preferences?.length || 0);

    if (!preferences || preferences.length === 0) {
      console.log('No users have daily_special_updates enabled');
      return;
    }

    const content = body.operation === 'INSERT'
      ? `${venue.name} has added new daily specials!`
      : `${venue.name} has updated their daily specials.`;

    const notifications = preferences.map(pref => ({
      user_id: pref.user_id,
      type: 'DAILY_SPECIAL_UPDATE',
      content,
      related_entity_id: body.venue_id,
      related_entity_type: 'venue'
    }));

    console.log('Creating daily special notifications:', notifications.length);

    const { data: insertedData, error: insertError } = await supabase
      .from('notifications')
      .insert(notifications)
      .select();

    if (insertError) {
      console.error('Error creating daily special notifications:', insertError);
    } else {
      console.log(`Created ${notifications.length} daily special notifications`);
      console.log('Inserted daily special notifications:', insertedData);
    }
  } catch (error) {
    console.error('Error in handleDailySpecialUpdate:', error);
  }
}

async function handleEventCreated(supabase: any, body: NotificationRequest) {
  if (!body.event_id || !body.venue_id) return;

  // Get venue name
  const { data: venue } = await supabase
    .from('venues')
    .select('name')
    .eq('id', body.venue_id)
    .single();

  if (!venue) return;

  // Get users who have this venue in their favorites and have event_updates enabled
  const { data: favoriteUsers } = await supabase
    .from('venue_favorites')
    .select(`
      user_id,
      notification_preferences!inner(event_updates)
    `)
    .eq('venue_id', body.venue_id)
    .eq('notification_preferences.event_updates', true);

  if (!favoriteUsers || favoriteUsers.length === 0) {
    console.log('No users to notify for event creation');
    return;
  }

  const eventTitle = body.data?.title || 'New Event';
  const content = `${venue.name} has created a new event: ${eventTitle}`;

  const notifications = favoriteUsers.map(favorite => ({
    user_id: favorite.user_id,
    type: 'EVENT_CREATED',
    content,
    related_entity_id: body.event_id,
    related_entity_type: 'event'
  }));

  const { error } = await supabase
    .from('notifications')
    .insert(notifications);

  if (error) {
    console.error('Error creating event creation notifications:', error);
  } else {
    console.log(`Created ${notifications.length} event creation notifications`);
  }
}

async function handleEventUpdated(supabase: any, body: NotificationRequest) {
  if (!body.event_id || !body.venue_id) return;

  // Get venue name
  const { data: venue } = await supabase
    .from('venues')
    .select('name')
    .eq('id', body.venue_id)
    .single();

  if (!venue) return;

  // Get users who have this venue in their favorites and have event_updates enabled
  const { data: favoriteUsers } = await supabase
    .from('venue_favorites')
    .select(`
      user_id,
      notification_preferences!inner(event_updates)
    `)
    .eq('venue_id', body.venue_id)
    .eq('notification_preferences.event_updates', true);

  // Get users who have expressed interest in this specific event
  const { data: interestedUsers } = await supabase
    .from('event_interests')
    .select(`
      user_id,
      notification_preferences!inner(event_updates)
    `)
    .eq('event_id', body.event_id)
    .eq('notification_preferences.event_updates', true);

  // Combine and deduplicate users
  const allUsers = new Set();
  const favoriteUserIds = favoriteUsers?.map(u => u.user_id) || [];
  const interestedUserIds = interestedUsers?.map(u => u.user_id) || [];
  
  [...favoriteUserIds, ...interestedUserIds].forEach(userId => allUsers.add(userId));

  if (allUsers.size === 0) {
    console.log('No users to notify for event update');
    return;
  }

  const eventTitle = body.new_data?.title || body.old_data?.title || 'Event';
  const content = `${venue.name} has updated the event: ${eventTitle}`;

  const notifications = Array.from(allUsers).map(userId => ({
    user_id: userId as string,
    type: 'EVENT_UPDATED',
    content,
    related_entity_id: body.event_id,
    related_entity_type: 'event'
  }));

  const { error } = await supabase
    .from('notifications')
    .insert(notifications);

  if (error) {
    console.error('Error creating event update notifications:', error);
  } else {
    console.log(`Created ${notifications.length} event update notifications`);
  }
}

async function handleClaimStatusUpdate(supabase: any, body: NotificationRequest) {
  if (!body.user_id || !body.claim_id || !body.status || !body.brewery_name) return;

  // Check if user has claim_updates enabled
  const { data: preferences } = await supabase
    .from('notification_preferences')
    .select('claim_updates')
    .eq('user_id', body.user_id)
    .single();

  if (!preferences?.claim_updates) {
    console.log('User does not have claim updates enabled');
    return;
  }

  const notificationType = body.status === 'approved' ? 'CLAIM_APPROVED' : 'CLAIM_REJECTED';
  const content = body.status === 'approved' 
    ? `Your claim for ${body.brewery_name} has been approved! You can now manage this brewery.`
    : `Your claim for ${body.brewery_name} has been rejected. Please contact support for more information.`;

  const { error } = await supabase
    .from('notifications')
    .insert({
      user_id: body.user_id,
      type: notificationType,
      content,
      related_entity_id: body.claim_id,
      related_entity_type: 'brewery_claim'
    });

  if (error) {
    console.error('Error creating claim status notification:', error);
  } else {
    console.log(`Created claim status notification for user ${body.user_id}`);
  }
}

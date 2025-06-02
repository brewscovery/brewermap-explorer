
import { supabase } from '@/integrations/supabase/client';

/**
 * Get users who have favorited a specific venue
 */
export const getVenueFavorites = async (venueId: string) => {
  console.log('🔍 Using security definer function to get venue favorites');
  const { data: favoriteUsers, error: favoritesError } = await supabase
    .rpc('get_venue_favorites_for_notifications', { venue_id_param: venueId });

  if (favoritesError) {
    console.error('❌ Error fetching favorite users:', favoritesError);
    return [];
  }

  console.log('👥 Found users who favorited the venue:', favoriteUsers?.length || 0, favoriteUsers);
  return favoriteUsers || [];
};

/**
 * Get notification preferences for a list of users
 */
export const getUserNotificationPreferences = async (userIds: string[]) => {
  console.log('🔍 Checking notification preferences for users:', userIds);
  
  const { data: usersWithPreferences, error: preferencesError } = await supabase
    .rpc('get_notification_preferences_for_users', { user_ids: userIds });

  if (preferencesError) {
    console.error('❌ Error fetching notification preferences:', preferencesError);
    return [];
  }

  return usersWithPreferences || [];
};

/**
 * Get venue name by ID
 */
export const getVenueName = async (venueId: string): Promise<string | null> => {
  console.log('🏢 Fetching venue name for:', venueId);
  const { data: venue, error: venueError } = await supabase
    .from('venues')
    .select('name')
    .eq('id', venueId)
    .single();

  if (venueError) {
    console.error('❌ Error fetching venue name:', venueError);
    return null;
  }

  if (!venue?.name) {
    console.error('❌ No venue found with id:', venueId);
    return null;
  }

  console.log('🏢 Venue name found:', venue.name);
  return venue.name;
};

/**
 * Create notifications in the database
 */
export const createNotifications = async (notifications: any[]) => {
  console.log('📝 Creating notifications:', notifications);

  const { error: notificationError } = await supabase
    .from('notifications')
    .insert(notifications);

  if (notificationError) {
    console.error('❌ Error creating notifications:', notificationError);
    throw notificationError;
  } else {
    console.log(`✅ Created ${notifications.length} notifications successfully`);
  }
};


import { supabase } from '@/integrations/supabase/client';
import type { NotificationType } from '@/types/notification';

export class NotificationService {
  /**
   * Create notifications for venue updates (hours, contact info, etc.)
   * Notifies users who have the venue in their favorites
   */
  static async notifyVenueUpdate(
    venueId: string,
    updateType: 'VENUE_HOURS_UPDATE' | 'KITCHEN_HOURS_UPDATE',
    content: string
  ) {
    try {
      // Get users who have this venue in their favorites and have venue_updates enabled
      const { data: favoriteUsers, error: favoritesError } = await supabase
        .from('venue_favorites')
        .select(`
          user_id,
          notification_preferences!inner(venue_updates)
        `)
        .eq('venue_id', venueId)
        .eq('notification_preferences.venue_updates', true);

      if (favoritesError) {
        console.error('Error fetching favorite users:', favoritesError);
        return;
      }

      if (!favoriteUsers || favoriteUsers.length === 0) {
        console.log('No users to notify for venue update');
        return;
      }

      // Create notifications for each user
      const notifications = favoriteUsers.map(favorite => ({
        user_id: favorite.user_id,
        type: updateType,
        content,
        related_entity_id: venueId,
        related_entity_type: 'venue'
      }));

      const { error: notificationError } = await supabase
        .from('notifications')
        .insert(notifications);

      if (notificationError) {
        console.error('Error creating venue update notifications:', notificationError);
      } else {
        console.log(`Created ${notifications.length} venue update notifications`);
      }
    } catch (error) {
      console.error('Error in notifyVenueUpdate:', error);
    }
  }

  /**
   * Create notifications for happy hour updates
   * Notifies users who have the venue in their favorites
   */
  static async notifyHappyHourUpdate(venueId: string, content: string) {
    try {
      // Get users who have this venue in their favorites and have happy_hour_updates enabled
      const { data: favoriteUsers, error: favoritesError } = await supabase
        .from('venue_favorites')
        .select(`
          user_id,
          notification_preferences!inner(happy_hour_updates)
        `)
        .eq('venue_id', venueId)
        .eq('notification_preferences.happy_hour_updates', true);

      if (favoritesError) {
        console.error('Error fetching favorite users for happy hour update:', favoritesError);
        return;
      }

      if (!favoriteUsers || favoriteUsers.length === 0) {
        console.log('No users to notify for happy hour update');
        return;
      }

      // Create notifications for each user
      const notifications = favoriteUsers.map(favorite => ({
        user_id: favorite.user_id,
        type: 'HAPPY_HOURS_UPDATE' as NotificationType,
        content,
        related_entity_id: venueId,
        related_entity_type: 'venue'
      }));

      const { error: notificationError } = await supabase
        .from('notifications')
        .insert(notifications);

      if (notificationError) {
        console.error('Error creating happy hour notifications:', notificationError);
      } else {
        console.log(`Created ${notifications.length} happy hour notifications`);
      }
    } catch (error) {
      console.error('Error in notifyHappyHourUpdate:', error);
    }
  }

  /**
   * Create notifications for daily special updates
   * Notifies users who have the venue in their favorites
   */
  static async notifyDailySpecialUpdate(venueId: string, content: string) {
    console.log('🔔 NotificationService.notifyDailySpecialUpdate called with:', { venueId, content });
    
    try {
      // Get venue name first
      console.log('🏢 Fetching venue name for:', venueId);
      const { data: venue, error: venueError } = await supabase
        .from('venues')
        .select('name')
        .eq('id', venueId)
        .single();

      if (venueError) {
        console.error('❌ Error fetching venue name:', venueError);
        return;
      }

      if (!venue?.name) {
        console.error('❌ No venue found with id:', venueId);
        return;
      }

      console.log('🏢 Venue name found:', venue.name);

      // Use the new security definer function to get venue favorites (bypasses RLS)
      console.log('🔍 Using security definer function to get venue favorites');
      const { data: favoriteUsers, error: favoritesError } = await supabase
        .rpc('get_venue_favorites_for_notifications', { venue_id_param: venueId });

      if (favoritesError) {
        console.error('❌ Error fetching favorite users for daily special update:', favoritesError);
        return;
      }

      console.log('👥 Found users who favorited the venue:', favoriteUsers?.length || 0, favoriteUsers);

      if (!favoriteUsers || favoriteUsers.length === 0) {
        console.log('ℹ️ No users have favorited this venue');
        return;
      }

      // Get notification preferences for these users using the security definer function
      const userIds = favoriteUsers.map(f => f.user_id);
      console.log('🔍 Checking notification preferences for users:', userIds);
      
      const { data: usersWithPreferences, error: preferencesError } = await supabase
        .rpc('get_notification_preferences_for_users', { user_ids: userIds });

      if (preferencesError) {
        console.error('❌ Error fetching notification preferences:', preferencesError);
        return;
      }

      // Filter users who have daily_special_updates enabled
      const enabledUsers = usersWithPreferences?.filter(user => user.daily_special_updates) || [];
      console.log('✅ Users with daily_special_updates enabled:', enabledUsers?.length || 0, enabledUsers);

      if (!enabledUsers || enabledUsers.length === 0) {
        console.log('ℹ️ No users have daily special updates enabled');
        return;
      }

      // Create notification content with venue name
      const notificationContent = `${venue.name} has updated their daily specials.`;
      console.log('📝 Notification content:', notificationContent);

      // Create notifications for each user with preferences enabled
      const notifications = enabledUsers.map(user => ({
        user_id: user.user_id,
        type: 'DAILY_SPECIAL_UPDATE' as NotificationType,
        content: notificationContent,
        related_entity_id: venueId,
        related_entity_type: 'venue'
      }));

      console.log('📝 Creating notifications:', notifications);

      const { error: notificationError } = await supabase
        .from('notifications')
        .insert(notifications);

      if (notificationError) {
        console.error('❌ Error creating daily special notifications:', notificationError);
      } else {
        console.log(`✅ Created ${notifications.length} daily special notifications successfully`);
      }
    } catch (error) {
      console.error('💥 Error in notifyDailySpecialUpdate:', error);
    }
  }

  /**
   * Create notifications for event updates
   * Notifies users who have the venue in their favorites OR have expressed interest in the specific event
   */
  static async notifyEventUpdate(
    eventId: string,
    venueId: string,
    updateType: 'EVENT_CREATED' | 'EVENT_UPDATED',
    content: string
  ) {
    try {
      // Get users who have this venue in their favorites and have event_updates enabled
      const { data: favoriteUsers, error: favoritesError } = await supabase
        .from('venue_favorites')
        .select(`
          user_id,
          notification_preferences!inner(event_updates)
        `)
        .eq('venue_id', venueId)
        .eq('notification_preferences.event_updates', true);

      if (favoritesError) {
        console.error('Error fetching favorite users for event update:', favoritesError);
        return;
      }

      // Get users who have expressed interest in this specific event
      const { data: interestedUsers, error: interestError } = await supabase
        .from('event_interests')
        .select(`
          user_id,
          notification_preferences!inner(event_updates)
        `)
        .eq('event_id', eventId)
        .eq('notification_preferences.event_updates', true);

      if (interestError) {
        console.error('Error fetching interested users for event update:', interestError);
        return;
      }

      // Combine and deduplicate users
      const allUsers = new Set();
      const favoriteUserIds = favoriteUsers?.map(u => u.user_id) || [];
      const interestedUserIds = interestedUsers?.map(u => u.user_id) || [];
      
      [...favoriteUserIds, ...interestedUserIds].forEach(userId => allUsers.add(userId));

      if (allUsers.size === 0) {
        console.log('No users to notify for event update');
        return;
      }

      // Create notifications for each unique user
      const notifications = Array.from(allUsers).map(userId => ({
        user_id: userId as string,
        type: updateType,
        content,
        related_entity_id: eventId,
        related_entity_type: 'event'
      }));

      const { error: notificationError } = await supabase
        .from('notifications')
        .insert(notifications);

      if (notificationError) {
        console.error('Error creating event update notifications:', notificationError);
      } else {
        console.log(`Created ${notifications.length} event update notifications`);
      }
    } catch (error) {
      console.error('Error in notifyEventUpdate:', error);
    }
  }

  /**
   * Create notifications for brewery claim status updates
   * Notifies the user who made the claim
   */
  static async notifyClaimStatusUpdate(
    userId: string,
    claimId: string,
    status: 'approved' | 'rejected',
    breweryName: string
  ) {
    try {
      // Check if user has claim_updates enabled
      const { data: preferences, error: preferencesError } = await supabase
        .from('notification_preferences')
        .select('claim_updates')
        .eq('user_id', userId)
        .single();

      if (preferencesError || !preferences?.claim_updates) {
        console.log('User does not have claim updates enabled or preferences not found');
        return;
      }

      const notificationType: NotificationType = status === 'approved' ? 'CLAIM_APPROVED' : 'CLAIM_REJECTED';
      const content = status === 'approved' 
        ? `Your claim for ${breweryName} has been approved! You can now manage this brewery.`
        : `Your claim for ${breweryName} has been rejected. Please contact support for more information.`;

      const { error: notificationError } = await supabase
        .from('notifications')
        .insert({
          user_id: userId,
          type: notificationType,
          content,
          related_entity_id: claimId,
          related_entity_type: 'brewery_claim'
        });

      if (notificationError) {
        console.error('Error creating claim status notification:', notificationError);
      } else {
        console.log(`Created claim status notification for user ${userId}`);
      }
    } catch (error) {
      console.error('Error in notifyClaimStatusUpdate:', error);
    }
  }

  /**
   * Utility method to create a custom notification
   */
  static async createCustomNotification(
    userId: string,
    type: NotificationType,
    content: string,
    relatedEntityId?: string,
    relatedEntityType?: string
  ) {
    try {
      const { error } = await supabase
        .from('notifications')
        .insert({
          user_id: userId,
          type,
          content,
          related_entity_id: relatedEntityId,
          related_entity_type: relatedEntityType
        });

      if (error) {
        console.error('Error creating custom notification:', error);
      } else {
        console.log('Custom notification created successfully');
      }
    } catch (error) {
      console.error('Error in createCustomNotification:', error);
    }
  }
}


import type { NotificationType } from '@/types/notification';
import { getVenueFavorites, getUserNotificationPreferences, getVenueName, createNotifications } from './utils';

export class VenueNotificationService {
  /**
   * Create notifications for venue updates (hours, contact info, etc.)
   * Notifies users who have the venue in their favorites
   */
  static async notifyVenueUpdate(
    venueId: string,
    updateType: 'VENUE_HOURS_UPDATE' | 'KITCHEN_HOURS_UPDATE',
    content: string
  ) {
    console.log('🔔 VenueNotificationService.notifyVenueUpdate called with:', { venueId, updateType, content });

    try {
      const favoriteUsers = await getVenueFavorites(venueId);

      if (!favoriteUsers || favoriteUsers.length === 0) {
        console.log('ℹ️ No users have favorited this venue');
        return;
      }

      // Get notification preferences for these users
      const userIds = favoriteUsers.map(f => f.user_id);
      const usersWithPreferences = await getUserNotificationPreferences(userIds);

      // Filter users who have venue_updates enabled
      const enabledUsers = usersWithPreferences?.filter(user => user.venue_updates) || [];
      console.log('✅ Users with venue_updates enabled:', enabledUsers?.length || 0, enabledUsers);

      if (!enabledUsers || enabledUsers.length === 0) {
        console.log('ℹ️ No users have venue updates enabled');
        return;
      }

      // Create notifications for each user with preferences enabled
      const notifications = enabledUsers.map(user => ({
        user_id: user.user_id,
        type: updateType as NotificationType,
        content,
        related_entity_id: venueId,
        related_entity_type: 'venue'
      }));

      await createNotifications(notifications);
    } catch (error) {
      console.error('💥 Error in notifyVenueUpdate:', error);
    }
  }

  /**
   * Create notifications for happy hour updates
   * Notifies users who have the venue in their favorites
   */
  static async notifyHappyHourUpdate(venueId: string, content: string) {
    console.log('🔔 VenueNotificationService.notifyHappyHourUpdate called with:', { venueId, content });

    try {
      const favoriteUsers = await getVenueFavorites(venueId);

      if (!favoriteUsers || favoriteUsers.length === 0) {
        console.log('No users to notify for happy hour update');
        return;
      }

      // Get notification preferences for these users
      const userIds = favoriteUsers.map(f => f.user_id);
      const usersWithPreferences = await getUserNotificationPreferences(userIds);

      // Filter users who have happy_hour_updates enabled
      const enabledUsers = usersWithPreferences?.filter(user => user.happy_hour_updates) || [];
      console.log('✅ Users with happy_hour_updates enabled:', enabledUsers?.length || 0, enabledUsers);

      if (!enabledUsers || enabledUsers.length === 0) {
        console.log('ℹ️ No users have happy hour updates enabled');
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

      await createNotifications(notifications);
      console.log(`Created ${notifications.length} happy hour notifications`);
    } catch (error) {
      console.error('Error in notifyHappyHourUpdate:', error);
    }
  }

  /**
   * Create notifications for daily special updates
   * Notifies users who have the venue in their favorites
   */
  static async notifyDailySpecialUpdate(venueId: string, content: string) {
    console.log('🔔 VenueNotificationService.notifyDailySpecialUpdate called with:', { venueId, content });
    
    try {
      const favoriteUsers = await getVenueFavorites(venueId);

      if (!favoriteUsers || favoriteUsers.length === 0) {
        console.log('ℹ️ No users have favorited this venue');
        return;
      }

      // Get notification preferences for these users
      const userIds = favoriteUsers.map(f => f.user_id);
      const usersWithPreferences = await getUserNotificationPreferences(userIds);

      // Filter users who have daily_special_updates enabled
      const enabledUsers = usersWithPreferences?.filter(user => user.daily_special_updates) || [];
      console.log('✅ Users with daily_special_updates enabled:', enabledUsers?.length || 0, enabledUsers);

      if (!enabledUsers || enabledUsers.length === 0) {
        console.log('ℹ️ No users have daily special updates enabled');
        return;
      }

      // Create notifications for each user with preferences enabled
      const notifications = enabledUsers.map(user => ({
        user_id: user.user_id,
        type: 'DAILY_SPECIAL_UPDATE' as NotificationType,
        content,
        related_entity_id: venueId,
        related_entity_type: 'venue'
      }));

      await createNotifications(notifications);
    } catch (error) {
      console.error('💥 Error in notifyDailySpecialUpdate:', error);
    }
  }
}


import { supabase } from '@/integrations/supabase/client';
import type { NotificationType, CreateNotificationParams } from '@/types/notification';

export class NotificationService {
  /**
   * Create a notification for a specific user
   */
  static async createNotification(params: CreateNotificationParams) {
    try {
      const { error } = await supabase
        .from('notifications')
        .insert({
          user_id: params.user_id,
          type: params.type,
          content: params.content,
          related_entity_id: params.related_entity_id,
          related_entity_type: params.related_entity_type,
        });

      if (error) {
        console.error('Error creating notification:', error);
        throw error;
      }
    } catch (error) {
      console.error('Failed to create notification:', error);
    }
  }

  /**
   * Create notifications for multiple users who have favorited a venue
   */
  static async createVenueNotifications(
    venueId: string,
    type: NotificationType,
    content: string,
    relatedEntityType?: string
  ) {
    try {
      // Get all users who have favorited this venue
      const { data: favorites, error: favError } = await supabase
        .from('venue_favorites')
        .select('user_id')
        .eq('venue_id', venueId);

      if (favError) {
        console.error('Error fetching venue favorites:', favError);
        return;
      }

      if (!favorites || favorites.length === 0) {
        console.log('No users have favorited this venue');
        return;
      }

      // Get user preferences to filter who wants this type of notification
      const { data: preferences, error: prefError } = await supabase
        .from('notification_preferences')
        .select('user_id, venue_updates, event_updates, happy_hour_updates, daily_special_updates')
        .in('user_id', favorites.map(f => f.user_id));

      if (prefError) {
        console.error('Error fetching notification preferences:', prefError);
        return;
      }

      // Filter users based on their preferences
      const eligibleUsers = favorites.filter(favorite => {
        const userPrefs = preferences?.find(p => p.user_id === favorite.user_id);
        if (!userPrefs) return true; // Default to sending if no preferences found

        // Check preference based on notification type
        switch (type) {
          case 'VENUE_HOURS_UPDATE':
          case 'KITCHEN_HOURS_UPDATE':
            return userPrefs.venue_updates;
          case 'EVENT_CREATED':
          case 'EVENT_UPDATED':
            return userPrefs.event_updates;
          case 'HAPPY_HOURS_UPDATE':
            return userPrefs.happy_hour_updates;
          case 'DAILY_SPECIAL_UPDATE':
            return userPrefs.daily_special_updates;
          default:
            return true;
        }
      });

      // Create notifications for eligible users
      const notifications = eligibleUsers.map(favorite => ({
        user_id: favorite.user_id,
        type,
        content,
        related_entity_id: venueId,
        related_entity_type: relatedEntityType || 'venue',
      }));

      if (notifications.length > 0) {
        const { error: insertError } = await supabase
          .from('notifications')
          .insert(notifications);

        if (insertError) {
          console.error('Error inserting notifications:', insertError);
        } else {
          console.log(`Created ${notifications.length} notifications for venue ${venueId}`);
        }
      }
    } catch (error) {
      console.error('Failed to create venue notifications:', error);
    }
  }

  /**
   * Create notifications for users interested in an event
   */
  static async createEventNotifications(
    eventId: string,
    type: NotificationType,
    content: string
  ) {
    try {
      // Get all users who have shown interest in this event
      const { data: interests, error: interestError } = await supabase
        .from('event_interests')
        .select('user_id')
        .eq('event_id', eventId);

      if (interestError) {
        console.error('Error fetching event interests:', interestError);
        return;
      }

      if (!interests || interests.length === 0) {
        console.log('No users are interested in this event');
        return;
      }

      // Get user preferences
      const { data: preferences, error: prefError } = await supabase
        .from('notification_preferences')
        .select('user_id, event_updates')
        .in('user_id', interests.map(i => i.user_id));

      if (prefError) {
        console.error('Error fetching notification preferences:', prefError);
        return;
      }

      // Filter users who want event notifications
      const eligibleUsers = interests.filter(interest => {
        const userPrefs = preferences?.find(p => p.user_id === interest.user_id);
        return userPrefs ? userPrefs.event_updates : true;
      });

      // Create notifications
      const notifications = eligibleUsers.map(interest => ({
        user_id: interest.user_id,
        type,
        content,
        related_entity_id: eventId,
        related_entity_type: 'event',
      }));

      if (notifications.length > 0) {
        const { error: insertError } = await supabase
          .from('notifications')
          .insert(notifications);

        if (insertError) {
          console.error('Error inserting event notifications:', insertError);
        } else {
          console.log(`Created ${notifications.length} notifications for event ${eventId}`);
        }
      }
    } catch (error) {
      console.error('Failed to create event notifications:', error);
    }
  }

  /**
   * Create claim status notifications for business users
   */
  static async createClaimNotification(
    userId: string,
    type: 'CLAIM_APPROVED' | 'CLAIM_REJECTED',
    breweryName: string,
    adminNotes?: string
  ) {
    try {
      // Check if user wants claim notifications
      const { data: preferences, error: prefError } = await supabase
        .from('notification_preferences')
        .select('claim_updates')
        .eq('user_id', userId)
        .single();

      if (prefError) {
        console.error('Error fetching notification preferences:', prefError);
        // Default to sending notification if we can't fetch preferences
      }

      const shouldSend = preferences ? preferences.claim_updates : true;
      if (!shouldSend) {
        console.log('User has disabled claim notifications');
        return;
      }

      let content: string;
      if (type === 'CLAIM_APPROVED') {
        content = `🎉 Your claim for ${breweryName} has been approved! You can now manage this brewery.`;
      } else {
        content = `Your claim for ${breweryName} has been rejected.${adminNotes ? ` Admin notes: ${adminNotes}` : ''}`;
      }

      await this.createNotification({
        user_id: userId,
        type,
        content,
        related_entity_type: 'brewery_claim',
      });
    } catch (error) {
      console.error('Failed to create claim notification:', error);
    }
  }
}

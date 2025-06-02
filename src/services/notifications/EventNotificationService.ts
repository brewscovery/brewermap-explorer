
import { supabase } from '@/integrations/supabase/client';
import type { NotificationType } from '@/types/notification';
import { getVenueFavorites, getUserNotificationPreferences, createNotifications } from './utils';

export class EventNotificationService {
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
    console.log('🔔 EventNotificationService.notifyEventUpdate called with:', { eventId, venueId, updateType, content });

    try {
      // Get users who have this venue in their favorites
      const favoriteUsers = await getVenueFavorites(venueId);

      // Get users who have expressed interest in this specific event
      const { data: interestedUsers, error: interestError } = await supabase
        .from('event_interests')
        .select('user_id')
        .eq('event_id', eventId);

      if (interestError) {
        console.error('❌ Error fetching interested users for event update:', interestError);
        return;
      }

      // Combine and deduplicate users
      const allUserIds = new Set<string>();
      const favoriteUserIds = favoriteUsers?.map(u => u.user_id) || [];
      const interestedUserIds = interestedUsers?.map(u => u.user_id) || [];
      
      [...favoriteUserIds, ...interestedUserIds].forEach(userId => allUserIds.add(userId));

      console.log('👥 Found users to potentially notify:', allUserIds.size);

      if (allUserIds.size === 0) {
        console.log('ℹ️ No users to notify for event update');
        return;
      }

      // Get notification preferences for these users
      const usersWithPreferences = await getUserNotificationPreferences(Array.from(allUserIds));

      // Filter users who have event_updates enabled
      const enabledUsers = usersWithPreferences?.filter(user => user.event_updates) || [];
      console.log('✅ Users with event_updates enabled:', enabledUsers?.length || 0);

      if (!enabledUsers || enabledUsers.length === 0) {
        console.log('ℹ️ No users have event updates enabled');
        return;
      }

      // Create notifications for each user with preferences enabled
      const notifications = enabledUsers.map(user => ({
        user_id: user.user_id,
        type: updateType as NotificationType,
        content,
        related_entity_id: eventId,
        related_entity_type: 'event'
      }));

      await createNotifications(notifications);
    } catch (error) {
      console.error('💥 Error in notifyEventUpdate:', error);
    }
  }
}


import { supabase } from '@/integrations/supabase/client';
import type { NotificationType } from '@/types/notification';

export class CustomNotificationService {
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

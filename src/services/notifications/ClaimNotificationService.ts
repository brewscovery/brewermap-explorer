
import { supabase } from '@/integrations/supabase/client';
import type { NotificationType } from '@/types/notification';
import { getUserNotificationPreferences } from './utils';

export class ClaimNotificationService {
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
    console.log('🔔 ClaimNotificationService.notifyClaimStatusUpdate called with:', { userId, claimId, status, breweryName });

    try {
      // Check if user has claim_updates enabled
      const usersWithPreferences = await getUserNotificationPreferences([userId]);

      // Check if user has claim_updates enabled
      const userPreferences = usersWithPreferences?.find(user => user.user_id === userId);
      if (!userPreferences?.claim_updates) {
        console.log('ℹ️ User does not have claim updates enabled');
        return;
      }

      const notificationType: NotificationType = status === 'approved' ? 'CLAIM_APPROVED' : 'CLAIM_REJECTED';
      const content = status === 'approved' 
        ? `Your claim for ${breweryName} has been approved! You can now manage this brewery.`
        : `Your claim for ${breweryName} has been rejected. Please contact support for more information.`;

      console.log('📝 Creating claim status notification for user:', userId);

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
        console.error('❌ Error creating claim status notification:', notificationError);
      } else {
        console.log(`✅ Created claim status notification for user ${userId}`);
      }
    } catch (error) {
      console.error('💥 Error in notifyClaimStatusUpdate:', error);
    }
  }
}

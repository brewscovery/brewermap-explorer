
import type { NotificationType } from '@/types/notification';

export interface NotificationParams {
  user_id: string;
  type: NotificationType;
  content: string;
  related_entity_id?: string;
  related_entity_type?: string;
}

export interface VenueNotificationData {
  venueId: string;
  content: string;
  updateType?: 'VENUE_HOURS_UPDATE' | 'KITCHEN_HOURS_UPDATE';
}

export interface EventNotificationData {
  eventId: string;
  venueId: string;
  updateType: 'EVENT_CREATED' | 'EVENT_UPDATED';
  content: string;
}

export interface ClaimNotificationData {
  userId: string;
  claimId: string;
  status: 'approved' | 'rejected';
  breweryName: string;
}


export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  content: string;
  related_entity_id?: string;
  related_entity_type?: string;
  read_at?: string;
  created_at: string;
  updated_at: string;
}

export interface NotificationPreferences {
  id: string;
  user_id: string;
  venue_updates: boolean;
  event_updates: boolean;
  happy_hour_updates: boolean;
  claim_updates: boolean;
  daily_special_updates: boolean;
  created_at: string;
  updated_at: string;
}

export type NotificationType = 
  | 'VENUE_HOURS_UPDATE'
  | 'KITCHEN_HOURS_UPDATE'
  | 'HAPPY_HOURS_UPDATE'
  | 'DAILY_SPECIAL_UPDATE'
  | 'EVENT_CREATED'
  | 'EVENT_UPDATED'
  | 'CLAIM_APPROVED'
  | 'CLAIM_REJECTED';

export interface CreateNotificationParams {
  user_id: string;
  type: NotificationType;
  content: string;
  related_entity_id?: string;
  related_entity_type?: string;
}

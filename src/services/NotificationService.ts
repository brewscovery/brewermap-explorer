
import { VenueNotificationService } from './notifications/VenueNotificationService';
import { EventNotificationService } from './notifications/EventNotificationService';
import { ClaimNotificationService } from './notifications/ClaimNotificationService';
import { CustomNotificationService } from './notifications/CustomNotificationService';

/**
 * Main NotificationService that delegates to specialized notification services
 */
export class NotificationService {
  // Venue-related notifications
  static notifyVenueUpdate = VenueNotificationService.notifyVenueUpdate;
  static notifyHappyHourUpdate = VenueNotificationService.notifyHappyHourUpdate;
  static notifyDailySpecialUpdate = VenueNotificationService.notifyDailySpecialUpdate;

  // Event-related notifications
  static notifyEventUpdate = EventNotificationService.notifyEventUpdate;

  // Claim-related notifications
  static notifyClaimStatusUpdate = ClaimNotificationService.notifyClaimStatusUpdate;

  // Custom notifications
  static createCustomNotification = CustomNotificationService.createCustomNotification;
}

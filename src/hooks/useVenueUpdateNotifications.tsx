
import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { NotificationService } from '@/services/notificationService';

interface VenueUpdateNotificationOptions {
  venueId?: string;
  venueName?: string;
  updateType: 'hours' | 'happy_hours' | 'daily_specials' | 'general';
}

export const useVenueUpdateNotifications = () => {
  const { user } = useAuth();

  const triggerUpdateNotification = async (options: VenueUpdateNotificationOptions) => {
    if (!options.venueId || !options.venueName) {
      console.log('Missing venue information for notification');
      return;
    }

    console.log('Triggering venue update notification:', options);

    let notificationType: 'VENUE_HOURS_UPDATE' | 'HAPPY_HOURS_UPDATE' | 'DAILY_SPECIAL_UPDATE';
    let content: string;

    switch (options.updateType) {
      case 'hours':
        notificationType = 'VENUE_HOURS_UPDATE';
        content = `📅 ${options.venueName} has updated their hours`;
        break;
      case 'happy_hours':
        notificationType = 'HAPPY_HOURS_UPDATE';
        content = `🍻 ${options.venueName} has updated their happy hour specials`;
        break;
      case 'daily_specials':
        notificationType = 'DAILY_SPECIAL_UPDATE';
        content = `🍽️ ${options.venueName} has updated their daily specials`;
        break;
      default:
        notificationType = 'VENUE_HOURS_UPDATE';
        content = `📝 ${options.venueName} has been updated`;
    }

    await NotificationService.createVenueNotifications(
      options.venueId,
      notificationType,
      content,
      'venue'
    );
  };

  return {
    triggerUpdateNotification
  };
};

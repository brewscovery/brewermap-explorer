import React from 'react';
import { Bell, Check, CheckCheck, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNotifications } from '@/hooks/useNotifications';
import { formatDistanceToNow } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import VirtualNotificationList from './VirtualNotificationList';

// Use the Notification type from the hook
interface Notification {
  id: string;
  user_id: string;
  type: string;
  content: string;
  related_entity_id: string | null;
  related_entity_type: string | null;
  read_at: string | null;
  created_at: string;
  updated_at: string;
}

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
  onNotificationClick: (notification: Notification) => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onMarkAsRead,
  onDelete,
  onNotificationClick,
}) => {
  const isUnread = !notification.read_at;

  const handleNotificationClick = () => {
    // Mark as read when clicked
    if (isUnread) {
      onMarkAsRead(notification.id);
    }
    // Handle the notification click
    onNotificationClick(notification);
  };

  return (
    <div className={`p-3 ${isUnread ? 'bg-blue-50' : ''}`}>
      <div className="flex items-start justify-between gap-2">
        <div 
          className="flex-1 min-w-0 cursor-pointer hover:bg-gray-50 p-1 -m-1 rounded"
          onClick={handleNotificationClick}
        >
          <p className={`text-sm ${isUnread ? 'font-medium text-gray-900' : 'text-gray-600'}`}>
            {notification.content}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
          </p>
        </div>
        <div className="flex items-center gap-1">
          {isUnread && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onMarkAsRead(notification.id)}
              className="h-6 w-6 p-0"
            >
              <Check className="h-3 w-3" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(notification.id)}
            className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </div>
  );
};

const NotificationCenter: React.FC = () => {
  const navigate = useNavigate();
  const {
    notifications,
    unreadCount,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotifications();

  const handleNotificationClick = async (notification: Notification) => {
    console.log('Notification clicked:', notification);
    
    // Try to extract venue ID from either field, handling the case where data might be mixed up
    let venueId = notification.related_entity_id;
    let entityType = notification.related_entity_type;
    
    // If related_entity_id is null but related_entity_type looks like a UUID, it's probably the venue ID
    if (!venueId && entityType && entityType.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
      console.log('Venue ID found in related_entity_type field, using it as venue ID');
      venueId = entityType;
      entityType = 'venue'; // Assume it's a venue notification
    }
    
    console.log('Extracted venue ID:', venueId, 'Entity type:', entityType);
    
    // Check if this is a venue-related notification
    const isVenueNotification = entityType === 'venue' && venueId;

    // Check if this is an event-related notification
    const isEventNotification = entityType === 'event' && venueId;

    if (isVenueNotification) {
      console.log('Navigating to venue:', venueId);
      // Navigate to the main page with the venue selected and explicit action to open sidebar
      navigate(`/?venueId=${venueId}&action=open-venue`, { replace: true });
      
      // Close the notification popover by removing focus
      const popoverTrigger = document.querySelector('[data-state="open"]');
      if (popoverTrigger instanceof HTMLElement) {
        popoverTrigger.click();
      }
    } else if (isEventNotification) {
      try {
        console.log('Fetching event to get venue_id:', venueId);
        // Fetch the event to get its venue_id
        const { data: event, error } = await supabase
          .from('venue_events')
          .select('venue_id')
          .eq('id', venueId)
          .single();

        if (error) {
          console.error('Error fetching event:', error);
          return;
        }

        if (event?.venue_id) {
          console.log('Navigating to venue from event:', event.venue_id);
          // Navigate to the main page with the venue selected and explicit action to open sidebar
          navigate(`/?venueId=${event.venue_id}&action=open-venue`, { replace: true });
          
          // Close the notification popover
          const popoverTrigger = document.querySelector('[data-state="open"]');
          if (popoverTrigger instanceof HTMLElement) {
            popoverTrigger.click();
          }
        }
      } catch (error) {
        console.error('Error handling event notification click:', error);
      }
    } else {
      console.log('Notification does not have valid venue or event data:', {
        venueId,
        entityType,
        notification
      });
    }
  };

  const renderNotificationItem = (notification: Notification) => (
    <NotificationItem
      notification={notification}
      onMarkAsRead={markAsRead}
      onDelete={deleteNotification}
      onNotificationClick={handleNotificationClick}
    />
  );

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Notifications</h3>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => markAllAsRead()}
                className="text-xs"
              >
                <CheckCheck className="h-3 w-3 mr-1" />
                Mark all read
              </Button>
            )}
          </div>
        </div>
        
        <VirtualNotificationList
          notifications={notifications}
          isLoading={isLoading}
          hasNextPage={hasNextPage}
          isFetchingNextPage={isFetchingNextPage}
          fetchNextPage={fetchNextPage}
          renderItem={renderNotificationItem}
        />
      </PopoverContent>
    </Popover>
  );
};

export default NotificationCenter;

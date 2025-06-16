
import React, { useMemo } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';

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

interface VirtualNotificationListProps {
  notifications: Notification[];
  isLoading: boolean;
  renderItem: (notification: Notification) => React.ReactNode;
}

const VirtualNotificationList: React.FC<VirtualNotificationListProps> = ({
  notifications,
  isLoading,
  renderItem,
}) => {
  const virtualizedItems = useMemo(() => {
    // Since we're limiting to 5 notifications, we can render all of them
    // Virtual scrolling becomes more beneficial with larger datasets
    return notifications.slice(0, 5);
  }, [notifications]);

  if (isLoading) {
    return (
      <div className="p-4 text-center text-sm text-gray-500">
        Loading notifications...
      </div>
    );
  }

  if (virtualizedItems.length === 0) {
    return (
      <div className="p-4 text-center text-sm text-gray-500">
        No notifications yet
      </div>
    );
  }

  return (
    <ScrollArea className="max-h-96">
      <div>
        {virtualizedItems.map((notification) => (
          <div key={notification.id}>
            {renderItem(notification)}
          </div>
        ))}
      </div>
    </ScrollArea>
  );
};

export default VirtualNotificationList;


import React, { useEffect, useRef } from 'react';
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
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
  fetchNextPage?: () => void;
  renderItem: (notification: Notification) => React.ReactNode;
}

const VirtualNotificationList: React.FC<VirtualNotificationListProps> = ({
  notifications,
  isLoading,
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
  renderItem,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    
    // Load more when scrolled to bottom (with small buffer)
    if (scrollHeight - scrollTop <= clientHeight + 10 && hasNextPage && !isFetchingNextPage) {
      fetchNextPage?.();
    }
  };

  if (isLoading) {
    return (
      <div className="p-4 text-center text-sm text-gray-500">
        Loading notifications...
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className="p-4 text-center text-sm text-gray-500">
        No notifications yet
      </div>
    );
  }

  return (
    <ScrollArea className="h-80 overflow-y-auto">
      <div ref={scrollRef} onScroll={handleScroll} className="divide-y">
        {notifications.map((notification) => (
          <div key={notification.id} className="min-h-[64px]">
            {renderItem(notification)}
          </div>
        ))}
        {isFetchingNextPage && (
          <div className="p-4 text-center text-sm text-gray-500">
            Loading more notifications...
          </div>
        )}
      </div>
    </ScrollArea>
  );
};

export default VirtualNotificationList;

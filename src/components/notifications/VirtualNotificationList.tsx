
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
    
    console.log('Scroll event:', { scrollTop, scrollHeight, clientHeight, hasNextPage, isFetchingNextPage });
    
    // Load more when scrolled near the bottom (with 50px buffer)
    const isNearBottom = scrollHeight - scrollTop <= clientHeight + 50;
    
    if (isNearBottom && hasNextPage && !isFetchingNextPage) {
      console.log('Triggering fetchNextPage');
      fetchNextPage?.();
    }
  };

  // Also add an intersection observer for better detection
  useEffect(() => {
    const scrollElement = scrollRef.current;
    if (!scrollElement) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
          console.log('Intersection observer triggering fetchNextPage');
          fetchNextPage?.();
        }
      },
      {
        root: scrollElement,
        rootMargin: '100px',
        threshold: 0.1,
      }
    );

    // Create a sentinel element to observe
    const sentinel = document.createElement('div');
    sentinel.style.height = '1px';
    scrollElement.appendChild(sentinel);
    observer.observe(sentinel);

    return () => {
      observer.disconnect();
      if (scrollElement.contains(sentinel)) {
        scrollElement.removeChild(sentinel);
      }
    };
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

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
    <ScrollArea className="h-80">
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
        {hasNextPage && !isFetchingNextPage && (
          <div className="p-4 text-center text-sm text-gray-400">
            Scroll down for more notifications ({notifications.length} loaded)
          </div>
        )}
      </div>
    </ScrollArea>
  );
};

export default VirtualNotificationList;

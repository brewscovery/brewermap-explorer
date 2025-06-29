
import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useRealtime } from '@/contexts/RealtimeContext';
import { useAuth } from '@/contexts/AuthContext';
import { useInvalidationManager } from '@/contexts/InvalidationContext';
import { queryKeys } from '@/utils/queryKeys';
import { toast } from 'sonner';

export const useRealtimeBusinessUser = () => {
  const { user, userType } = useAuth();
  const { subscribe, unsubscribe } = useRealtime();
  const queryClient = useQueryClient();
  const invalidationManager = useInvalidationManager();
  const subscriptionIdsRef = useRef<string[]>([]);
  const updateTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Debounced update function
  const debouncedUpdate = (updateFn: () => void, delay = 300) => {
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current);
    }
    updateTimeoutRef.current = setTimeout(updateFn, delay);
  };

  useEffect(() => {
    if (!user?.id || userType !== 'business') return;

    console.log(`Setting up smart real-time subscriptions for business user: ${user.id}`);

    // Subscribe to brewery claim updates with smart handling
    const claimSubId = subscribe(
      'brewery_claims_updated',
      (payload) => {
        console.log('Brewery claim updated:', payload);
        
        if (payload.eventType === 'UPDATE' && payload.new) {
          const newStatus = payload.new.status;
          const breweryName = payload.new.brewery_name;

          // Show appropriate toast based on status
          debouncedUpdate(() => {
            if (newStatus === 'approved') {
              toast.success('Claim Approved! 🎉', {
                description: `Your claim for ${breweryName} has been approved. You can now manage this brewery.`
              });
            } else if (newStatus === 'rejected') {
              toast.error('Claim Rejected', {
                description: `Your claim for ${breweryName} has been rejected. Please contact support for more information.`
              });
            }

            // Smart invalidation - only invalidate specific queries
            invalidationManager.invalidateQueries(queryKeys.breweries.claims.byUser(user.id), { exact: true });
            
            // Only invalidate all breweries if claim was approved (new brewery access)
            if (newStatus === 'approved') {
              invalidationManager.invalidateQueries(queryKeys.breweries.all);
            }
          }, 100); // Short delay for important notifications
        }
      },
      { user_id: user.id }
    );

    subscriptionIdsRef.current = [claimSubId];

    return () => {
      console.log(`Cleaning up smart real-time subscriptions for business user: ${user.id}`);
      subscriptionIdsRef.current.forEach(id => unsubscribe(id));
      subscriptionIdsRef.current = [];
      
      // Clear any pending updates
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
        updateTimeoutRef.current = null;
      }
    };
  }, [user?.id, userType, subscribe, unsubscribe, queryClient, invalidationManager]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
    };
  }, []);
};

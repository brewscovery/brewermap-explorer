import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useRealtime } from '@/contexts/RealtimeContext';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export const useRealtimeBusinessUser = () => {
  const { user, userType } = useAuth();
  const { subscribe, unsubscribe } = useRealtime();
  const queryClient = useQueryClient();
  const subscriptionIdsRef = useRef<string[]>([]);

  useEffect(() => {
    if (!user?.id || userType !== 'business') return;

    console.log(`Setting up real-time subscriptions for business user: ${user.id}`);

    // Subscribe to brewery claim updates
    const claimSubId = subscribe(
      'brewery_claims_updated',
      (payload) => {
        console.log('Brewery claim updated:', payload);
        
        if (payload.eventType === 'UPDATE' && payload.new) {
          const newStatus = payload.new.status;
          const breweryName = payload.new.brewery_name;

          if (newStatus === 'approved') {
            toast.success('Claim Approved! 🎉', {
              description: `Your claim for ${breweryName} has been approved. You can now manage this brewery.`
            });
          } else if (newStatus === 'rejected') {
            toast.error('Claim Rejected', {
              description: `Your claim for ${breweryName} has been rejected. Please contact support for more information.`
            });
          }
        }
        
        queryClient.invalidateQueries({ queryKey: ['breweries'] });
        queryClient.invalidateQueries({ queryKey: ['brewery-claims'] });
      },
      { user_id: user.id }
    );

    subscriptionIdsRef.current = [claimSubId];

    return () => {
      console.log(`Cleaning up real-time subscriptions for business user: ${user.id}`);
      subscriptionIdsRef.current.forEach(id => unsubscribe(id));
      subscriptionIdsRef.current = [];
    };
  }, [user?.id, userType, subscribe, unsubscribe, queryClient]);
};
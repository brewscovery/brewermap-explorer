
import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useBreweryClaimNotifications = () => {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    // Subscribe to changes on brewery_claims table for this user
    const channel = supabase
      .channel('claim-updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'brewery_claims',
          filter: `user_id=eq.${user.id}`,
        },
        async (payload) => {
          const newStatus = payload.new.status;
          const breweryName = payload.new.brewery_name;

          // Get brewery name if not in payload
          if (!breweryName) {
            const { data: brewery } = await supabase
              .from('breweries')
              .select('name')
              .eq('id', payload.new.brewery_id)
              .single();
            
            if (brewery) {
              const message = getStatusMessage(newStatus, brewery.name);
              toast(message.title, {
                description: message.description,
              });
            }
          } else {
            const message = getStatusMessage(newStatus, breweryName);
            toast(message.title, {
              description: message.description,
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);
};

const getStatusMessage = (status: string, breweryName: string) => {
  switch (status) {
    case 'approved':
      return {
        title: 'Claim Approved! 🎉',
        description: `Your claim for ${breweryName} has been approved. You can now manage this brewery.`
      };
    case 'rejected':
      return {
        title: 'Claim Rejected',
        description: `Your claim for ${breweryName} has been rejected. Please contact support for more information.`
      };
    default:
      return {
        title: 'Claim Status Updated',
        description: `The status of your claim for ${breweryName} has been updated to ${status}.`
      };
  }
};

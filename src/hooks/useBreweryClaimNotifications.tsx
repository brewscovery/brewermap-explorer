
import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { NotificationService } from '@/services/notificationService';

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
          console.log('Brewery claim status updated:', payload);
          
          if (payload.new && typeof payload.new === 'object') {
            const claim = payload.new as any;
            const newStatus = claim.status;
            
            // Get brewery name if not in payload
            let breweryName = claim.brewery_name;
            if (!breweryName && claim.brewery_id) {
              const { data: brewery } = await supabase
                .from('breweries')
                .select('name')
                .eq('id', claim.brewery_id)
                .single();
              
              breweryName = brewery?.name || 'Unknown Brewery';
            }

            if (breweryName) {
              // Create notification using our service
              if (newStatus === 'approved' || newStatus === 'rejected') {
                await NotificationService.createClaimNotification(
                  user.id,
                  newStatus === 'approved' ? 'CLAIM_APPROVED' : 'CLAIM_REJECTED',
                  breweryName,
                  claim.admin_notes
                );
              }

              // Show toast notification as before
              const message = getStatusMessage(newStatus, breweryName);
              toast(message.title, {
                description: message.description,
              });
            }
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

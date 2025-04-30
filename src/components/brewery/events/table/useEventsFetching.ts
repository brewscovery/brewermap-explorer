
import { useState, useEffect } from 'react';
import { useQueryClient } from "@tanstack/react-query";
import { useVenueEvents } from "@/hooks/useVenueEvents";
import { supabase } from '@/integrations/supabase/client';
import { toast } from "sonner";
import type { VenueEvent } from "@/hooks/useVenueEvents";

export const useEventsFetching = (venueIds: string[]) => {
  const queryClient = useQueryClient();
  const [allEvents, setAllEvents] = useState<VenueEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const { data: eventsData, isLoading: eventsLoading } = useVenueEvents(venueIds.length > 0 ? venueIds[0] : null);

  useEffect(() => {
    if (venueIds.length === 0) {
      setAllEvents([]);
      setIsLoading(false);
      return;
    }
    
    setIsLoading(eventsLoading);
    
    if (eventsData) {
      const fetchAllEvents = async () => {
        const promises = venueIds.slice(1).map(async (venueId) => {
          const data = await queryClient.fetchQuery({
            queryKey: ['venueEvents', venueId],
            queryFn: async () => {
              const { data, error } = await supabase
                .from('venue_events')
                .select('*')
                .eq('venue_id', venueId)
                .order('start_time', { ascending: true });
              if (error) throw error;
              return data as VenueEvent[];
            }
          });
          return data || [];
        });
        
        try {
          const otherVenuesEvents = await Promise.all(promises);
          const allEventsCollection = [
            ...(eventsData || []),
            ...otherVenuesEvents.flat()
          ];
          
          allEventsCollection.sort((a, b) => b.start_time.localeCompare(a.start_time));
          
          setAllEvents(allEventsCollection);
        } catch (error) {
          console.error("Error fetching events for all venues:", error);
          toast.error("Failed to load some events");
        } finally {
          setIsLoading(false);
        }
      };
      
      fetchAllEvents();
    }
  }, [venueIds, eventsData, eventsLoading, queryClient]);

  return { allEvents, isLoading, setAllEvents };
};

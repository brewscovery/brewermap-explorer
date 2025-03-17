
import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { CheckInDialog } from '@/components/CheckInDialog';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { Venue } from '@/types/venue';
import { useVenueHours } from '@/hooks/useVenueHours';
import AboutSection from './sections/AboutSection';
import AddressSection from './sections/AddressSection';
import ContactSection from './sections/ContactSection';
import VenueHoursSection from './sections/VenueHoursSection';
import CheckInsSection from './sections/CheckInsSection';
import type { Brewery } from '@/types/brewery';

interface VenueSidebarProps {
  venue: Venue | null;
  onClose: () => void;
}

interface CheckIn {
  id: string;
  rating: number;
  comment: string | null;
  visited_at: string;
  created_at: string;
  user_id: string;
  first_name: string | null;
  last_name: string | null;
}

const VenueSidebar = ({ venue, onClose }: VenueSidebarProps) => {
  const { user, userType } = useAuth();
  const [isCheckInDialogOpen, setIsCheckInDialogOpen] = useState(false);
  const queryClient = useQueryClient();
  
  console.log(`VenueSidebar rendering with venue ID: ${venue?.id || 'none'}`);
  
  const { hours: venueHours = [], isLoading: isLoadingHours } = useVenueHours(venue?.id || null);
  
  console.log(`[DEBUG] VenueSidebar received hours data:`, venueHours);
  
  const { data: breweryInfo } = useQuery({
    queryKey: ['brewery', venue?.brewery_id],
    queryFn: async () => {
      if (!venue?.brewery_id) return null;
      
      const { data, error } = await supabase
        .from('breweries')
        .select('id, name, about, website_url, facebook_url, instagram_url')
        .eq('id', venue.brewery_id)
        .single();
      
      if (error) throw error;
      return data as Brewery;
    },
    enabled: !!venue?.brewery_id
  });
  
  const { data: checkins = [] } = useQuery({
    queryKey: ['venueCheckins', venue?.id],
    queryFn: async () => {
      if (!venue?.id) return [];
      if (!user) return []; // Only fetch if user is logged in
      
      let query = supabase
        .from('checkins')
        .select(`
          id, rating, comment, visited_at, created_at, user_id,
          profiles!inner(first_name, last_name)
        `)
        .eq('venue_id', venue.id)
        .order('created_at', { ascending: false });
      
      if (user) {
        const { data: userCheckins, error: userCheckinsError } = await query
          .eq('user_id', user.id);
          
        if (userCheckinsError) throw userCheckinsError;
        
        const { data: otherCheckins, error: otherCheckinsError } = await supabase
          .from('checkins')
          .select(`
            id, rating, comment, visited_at, created_at, user_id,
            profiles!inner(first_name, last_name)
          `)
          .eq('venue_id', venue.id)
          .neq('user_id', user.id)
          .order('created_at', { ascending: false });
          
        if (otherCheckinsError) throw otherCheckinsError;
        
        return [...(userCheckins || []), ...(otherCheckins || [])].map(item => ({
          ...item,
          first_name: item.profiles?.first_name || null,
          last_name: item.profiles?.last_name || null
        }));
      }
      
      const { data, error } = await query;
      if (error) throw error;
      
      return (data || []).map(item => ({
        ...item,
        first_name: item.profiles?.first_name || null,
        last_name: item.profiles?.last_name || null
      }));
    },
    enabled: !!venue?.id && !!user
  });
  
  const handleCheckInSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['venueCheckins', venue?.id] });
    queryClient.invalidateQueries({ queryKey: ['checkins', user?.id] });
  };
  
  if (!venue) return null;
  
  return (
    <div className="fixed left-0 top-[73px] z-30 flex h-[calc(100vh-73px)] w-full max-w-md flex-col bg-white shadow-lg animate-slide-in-left">
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="text-xl font-bold truncate pr-2">{venue.name}</h2>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X size={20} />
        </Button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-5">
          <AboutSection breweryInfo={breweryInfo} />
          <AddressSection venue={venue} />
          <ContactSection venue={venue} breweryInfo={breweryInfo} />
          <VenueHoursSection venueHours={venueHours} isLoadingHours={isLoadingHours} />
        </div>
        
        <Separator className="my-5" />
        
        <CheckInsSection 
          venue={venue}
          checkins={checkins}
          user={user}
          userType={userType}
          onOpenCheckInDialog={() => setIsCheckInDialogOpen(true)}
        />
      </div>
      
      {venue && user && (
        <CheckInDialog
          venue={venue}
          isOpen={isCheckInDialogOpen}
          onClose={() => setIsCheckInDialogOpen(false)}
          onSuccess={handleCheckInSuccess}
        />
      )}
    </div>
  );
};

export default VenueSidebar;

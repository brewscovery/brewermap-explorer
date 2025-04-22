import React, { useState } from 'react';
import { X, ShieldCheck, Navigation } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { CheckInDialog } from '@/components/CheckInDialog';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { Venue } from '@/types/venue';
import { useVenueHours } from '@/hooks/useVenueHours';
import { useVenueHappyHours } from '@/hooks/useVenueHappyHours';
import { useVenueDailySpecials } from '@/hooks/useVenueDailySpecials';
import BreweryLogo from '@/components/brewery/BreweryLogo';
import AboutSection from './sections/AboutSection';
import AddressSection from './sections/AddressSection';
import ContactSection from './sections/ContactSection';
import VenueHoursSection from './sections/VenueHoursSection';
import HappyHoursSection from './sections/HappyHoursSection';
import DailySpecialsSection from './sections/DailySpecialsSection';
import CheckInsSection from './sections/CheckInsSection';
import EventsSection from './sections/EventsSection';
import type { Brewery } from '@/types/brewery';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

interface VenueSidebarProps {
  venue: Venue | null;
  onClose: () => void;
}

const VenueSidebar = ({ venue, onClose }: VenueSidebarProps) => {
  const { user, userType } = useAuth();
  const [isCheckInDialogOpen, setIsCheckInDialogOpen] = useState(false);
  const queryClient = useQueryClient();
  
  const venueId = venue?.id || null;
  
  console.log(`VenueSidebar rendering with venue ID: ${venueId}`);
  
  const { hours: venueHours = [], isLoading: isLoadingHours } = useVenueHours(venueId);
  const { happyHours = [], isLoading: isLoadingHappyHours } = useVenueHappyHours(venueId);
  const { dailySpecials = [], isLoading: isLoadingDailySpecials } = useVenueDailySpecials(venueId);
  
  if (venueHours.length > 0) {
    console.log(`[DEBUG] VenueSidebar received hours data:`, venueHours);
  }
  
  const { data: breweryInfo } = useQuery({
    queryKey: ['brewery', venue?.brewery_id],
    queryFn: async () => {
      if (!venue?.brewery_id) return null;
      
      const { data, error } = await supabase
        .from('breweries')
        .select('id, name, about, website_url, facebook_url, instagram_url, logo_url, is_verified')
        .eq('id', venue.brewery_id)
        .single();
      
      if (error) throw error;
      return data as Brewery;
    },
    enabled: !!venue?.brewery_id
  });
  
  const { data: checkins = [] } = useQuery({
    queryKey: ['venueCheckins', venueId],
    queryFn: async () => {
      if (!venueId) return [];
      if (!user) return []; // Only fetch if user is logged in
      
      let query = supabase
        .from('checkins')
        .select(`
          id, rating, comment, visited_at, created_at, user_id,
          profiles!inner(first_name, last_name)
        `)
        .eq('venue_id', venueId)
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
          .eq('venue_id', venueId)
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
    enabled: !!venueId && !!user
  });

  const handleCheckInSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['venueCheckins', venueId] });
    queryClient.invalidateQueries({ queryKey: ['checkins', user?.id] });
  };

  const hasCoordinates = venue?.latitude && venue?.longitude;
  const handleGetDirections = () => {
    if (!hasCoordinates) return;
    const lat = venue!.latitude;
    const lng = venue!.longitude;
    const title = encodeURIComponent(venue!.name);

    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;

    let url = '';
    if (isIOS) {
      url = `maps://?daddr=${lat},${lng}&q=${title}`;
    } else {
      url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&destination_place_id=&travelmode=driving`;
    }
    window.open(url, '_blank', 'noopener');
  };

  if (!venue) return null;
  
  return (
    <div className="fixed left-0 top-[73px] z-30 flex h-[calc(100vh-73px)] w-full max-w-md flex-col bg-white shadow-lg animate-slide-in-left">
      <div className="flex flex-col p-6 border-b">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="flex flex-col items-center gap-2">
              <BreweryLogo 
                logoUrl={breweryInfo?.logo_url}
                name={breweryInfo?.name}
                size="medium"
              />
              {breweryInfo?.is_verified ? (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <ShieldCheck size={14} />
                  <span>Verified Brewery</span>
                </Badge>
              ) : (
                <Badge variant="outline" className="text-muted-foreground">
                  Unverified
                </Badge>
              )}
            </div>
            <div className="min-w-0">
              <h2 className="text-xl font-bold truncate">{venue.name}</h2>
              {breweryInfo?.name && (
                <p className="text-sm text-muted-foreground truncate">
                  {breweryInfo.name}
                </p>
              )}
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X size={20} />
          </Button>
        </div>
      </div>
      
      <div className="flex flex-col flex-1 overflow-hidden">
        <div className="px-4 border-b">
          <TabsList className="w-full justify-start">
            <TabsTrigger value="overview" className="flex-1">Overview</TabsTrigger>
            <TabsTrigger value="events" className="flex-1">Events</TabsTrigger>
          </TabsList>
        </div>
        
        <Tabs defaultValue="overview" className="flex-1 overflow-hidden flex flex-col">
          <TabsContent value="overview" className="h-full overflow-y-auto flex-1 p-0">
            <div className="p-4">
              <div className="space-y-5">
                <AboutSection breweryInfo={breweryInfo} />
                <div className="space-y-1">
                  <AddressSection venue={venue} />
                  {hasCoordinates && (
                    <Button
                      onClick={handleGetDirections}
                      variant="secondary"
                      size="sm"
                      className="mt-2"
                    >
                      <Navigation size={16} className="mr-1" />
                      Get Directions
                    </Button>
                  )}
                </div>
                <ContactSection venue={venue} breweryInfo={breweryInfo} />
                <VenueHoursSection venueHours={venueHours} isLoadingHours={isLoadingHours} />
                <HappyHoursSection happyHours={happyHours} isLoading={isLoadingHappyHours} />
                <DailySpecialsSection dailySpecials={dailySpecials} isLoading={isLoadingDailySpecials} />
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
          </TabsContent>
          
          <TabsContent value="events" className="h-full overflow-y-auto flex-1 p-0">
            <EventsSection venueId={venue.id} />
          </TabsContent>
        </Tabs>
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

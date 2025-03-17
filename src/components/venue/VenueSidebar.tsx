
import React, { useEffect, useState } from 'react';
import { X, Clock, MapPin, Phone, Globe, ChevronDown, ChevronUp, Star, Facebook, Instagram } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { CheckInDialog } from '@/components/CheckInDialog';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { Venue } from '@/types/venue';
import { DAYS_OF_WEEK } from '@/types/venueHours';
import { Badge } from '@/components/ui/badge';
import { getTodayDayOfWeek } from '@/utils/dateTimeUtils';
import { useVenueHours } from '@/hooks/useVenueHours';
import { formatTime } from '@/utils/dateTimeUtils';

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

interface BreweryInfo {
  id: string;
  name: string;
  about: string | null;
  website_url: string | null;
  facebook_url: string | null;
  instagram_url: string | null;
}

const HoursSection = ({ title, hours, showKitchenHours = false }: { 
  title: string; 
  hours: any[]; 
  showKitchenHours?: boolean;
}) => {
  const [expanded, setExpanded] = useState(false);
  const todayIndex = getTodayDayOfWeek();
  
  const todayHours = hours.find(h => h.day_of_week === todayIndex);
  
  if (!hours.length) {
    return (
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <h3 className="font-medium text-sm">{title}</h3>
        </div>
        <p className="text-sm text-muted-foreground">No hours available</p>
      </div>
    );
  }
  
  const getHoursText = (hour: any) => {
    if (hour.is_closed) return 'Closed';
    
    if (showKitchenHours) {
      if (!hour.kitchen_open_time || !hour.kitchen_close_time) return 'Closed';
      return `${formatTime(hour.kitchen_open_time)} - ${formatTime(hour.kitchen_close_time)}`;
    } else {
      if (!hour.venue_open_time || !hour.venue_close_time) return 'Closed';
      return `${formatTime(hour.venue_open_time)} - ${formatTime(hour.venue_close_time)}`;
    }
  };
  
  const todayHoursText = todayHours 
    ? getHoursText(todayHours)
    : 'Hours not available';
  
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <h3 className="font-medium text-sm">{title}</h3>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => setExpanded(!expanded)}
          className="h-6 w-6 p-0"
        >
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </Button>
      </div>
      
      <div className="text-sm">
        <div className="flex justify-between">
          <span className="font-medium">Today:</span>
          <span>{todayHoursText}</span>
        </div>
        
        {expanded && (
          <div className="mt-2 space-y-1.5">
            {hours
              .sort((a, b) => a.day_of_week - b.day_of_week)
              .map((hour) => (
                <div 
                  key={hour.day_of_week} 
                  className={`flex justify-between ${hour.day_of_week === todayIndex ? 'font-medium' : ''}`}
                >
                  <span>{DAYS_OF_WEEK[hour.day_of_week]}</span>
                  <span>{getHoursText(hour)}</span>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
};

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
      return data as BreweryInfo;
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
  
  const renderStars = (rating: number) => {
    return Array(5).fill(0).map((_, i) => (
      <Star 
        key={i} 
        size={14} 
        className={`${i < rating ? 'fill-amber-500 text-amber-500' : 'text-gray-300'}`} 
      />
    ));
  };
  
  const userCheckins = checkins.filter(checkin => user && checkin.user_id === user.id);
  const otherCheckins = checkins.filter(checkin => !user || checkin.user_id !== user.id);
  
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
          {breweryInfo?.about && (
            <div className="space-y-2">
              <h3 className="font-medium text-sm">About</h3>
              <p className="text-sm text-muted-foreground whitespace-pre-line">{breweryInfo.about}</p>
            </div>
          )}
          
          <div className="space-y-2">
            <h3 className="font-medium text-sm">Address</h3>
            <div className="flex items-start gap-2">
              <MapPin size={16} className="text-muted-foreground mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                {venue.street && <p>{venue.street}</p>}
                <p>{venue.city}, {venue.state} {venue.postal_code || ''}</p>
                {venue.country && venue.country !== 'United States' && <p>{venue.country}</p>}
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <h3 className="font-medium text-sm">Contact</h3>
            {venue.phone && (
              <div className="flex items-center gap-2">
                <Phone size={16} className="text-muted-foreground flex-shrink-0" />
                <span className="text-sm">{venue.phone}</span>
              </div>
            )}
            {breweryInfo?.website_url && (
              <div className="flex items-center gap-2">
                <Globe size={16} className="text-muted-foreground flex-shrink-0" />
                <a 
                  href={breweryInfo.website_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-blue-500 hover:text-blue-700 hover:underline"
                >
                  {breweryInfo.website_url.replace(/^https?:\/\//, '')}
                </a>
              </div>
            )}
            {breweryInfo?.facebook_url && (
              <div className="flex items-center gap-2">
                <Facebook size={16} className="text-muted-foreground flex-shrink-0" />
                <a 
                  href={breweryInfo.facebook_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-blue-500 hover:text-blue-700 hover:underline"
                >
                  Facebook
                </a>
              </div>
            )}
            {breweryInfo?.instagram_url && (
              <div className="flex items-center gap-2">
                <Instagram size={16} className="text-muted-foreground flex-shrink-0" />
                <a 
                  href={breweryInfo.instagram_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-blue-500 hover:text-blue-700 hover:underline"
                >
                  Instagram
                </a>
              </div>
            )}
          </div>
          
          <div className="space-y-2">
            <h3 className="font-medium text-sm">Hours</h3>
            {isLoadingHours ? (
              <p className="text-sm text-muted-foreground">Loading hours...</p>
            ) : venueHours.length === 0 ? (
              <p className="text-sm text-muted-foreground">No hours available</p>
            ) : (
              <div className="space-y-3">
                <HoursSection title="Operating Hours" hours={venueHours} />
                <HoursSection title="Kitchen Hours" hours={venueHours} showKitchenHours={true} />
              </div>
            )}
          </div>
        </div>
        
        <Separator className="my-5" />
        
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="font-medium">Check-ins</h3>
            {user && userType === 'regular' && (
              <Button 
                size="sm" 
                variant="default"
                onClick={() => setIsCheckInDialogOpen(true)}
              >
                Check In
              </Button>
            )}
          </div>
          
          {user ? (
            checkins.length === 0 ? (
              <p className="text-sm text-muted-foreground">No check-ins yet</p>
            ) : (
              <div className="space-y-4">
                {userCheckins.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium">Your Check-ins</h4>
                    {userCheckins.map(checkin => (
                      <div key={checkin.id} className="bg-muted/30 p-3 rounded-md space-y-2">
                        <div className="flex justify-between items-start">
                          <div className="flex">{renderStars(checkin.rating)}</div>
                          <Badge variant="outline" className="text-xs">
                            {new Date(checkin.visited_at).toLocaleDateString()}
                          </Badge>
                        </div>
                        {checkin.comment && (
                          <p className="text-sm">{checkin.comment}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                
                {otherCheckins.length > 0 && (
                  <div className="space-y-3">
                    {userCheckins.length > 0 && <h4 className="text-sm font-medium">Other Check-ins</h4>}
                    {otherCheckins.map(checkin => (
                      <div key={checkin.id} className="border border-border p-3 rounded-md space-y-2">
                        <div className="flex justify-between items-start">
                          <div className="space-y-1">
                            <div className="flex">{renderStars(checkin.rating)}</div>
                            <p className="text-xs text-muted-foreground">
                              {checkin.first_name ? `${checkin.first_name} ${checkin.last_name || ''}`.trim() : 'Anonymous'}
                            </p>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {new Date(checkin.visited_at).toLocaleDateString()}
                          </Badge>
                        </div>
                        {checkin.comment && (
                          <p className="text-sm">{checkin.comment}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          ) : (
            <p className="text-sm text-muted-foreground">Sign in to view and add check-ins</p>
          )}
        </div>
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

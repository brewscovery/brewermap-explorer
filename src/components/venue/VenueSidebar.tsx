
import React, { useEffect, useState } from 'react';
import { X, Clock, MapPin, Phone, Globe, ChevronDown, ChevronUp, Star } from 'lucide-react';
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

interface VenueHour {
  day_of_week: number;
  venue_open_time: string | null;
  venue_close_time: string | null;
  kitchen_open_time: string | null;
  kitchen_close_time: string | null;
  is_closed: boolean;
}

interface BreweryInfo {
  id: string;
  name: string;
  about: string | null;
}

const formatTime = (time: string | null) => {
  if (!time) return 'Closed';
  
  // Convert "HH:MM:SS" to a Date object to format it
  const [hours, minutes] = time.split(':');
  const date = new Date();
  date.setHours(parseInt(hours, 10));
  date.setMinutes(parseInt(minutes, 10));
  
  return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
};

const HoursSection = ({ title, hours, showKitchenHours = false }: { 
  title: string; 
  hours: VenueHour[]; 
  showKitchenHours?: boolean;
}) => {
  const [expanded, setExpanded] = useState(false);
  const todayIndex = getTodayDayOfWeek();
  
  // Find today's hours
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
  
  const getHoursText = (hour: VenueHour) => {
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
  
  // Fetch brewery information including the "about" section
  const { data: breweryInfo } = useQuery({
    queryKey: ['brewery', venue?.brewery_id],
    queryFn: async () => {
      if (!venue?.brewery_id) return null;
      
      const { data, error } = await supabase
        .from('breweries')
        .select('id, name, about')
        .eq('id', venue.brewery_id)
        .single();
      
      if (error) throw error;
      return data as BreweryInfo;
    },
    enabled: !!venue?.brewery_id
  });
  
  // Fetch venue hours
  const { data: venueHours = [] } = useQuery({
    queryKey: ['venueHours', venue?.id],
    queryFn: async () => {
      if (!venue?.id) return [];
      
      const { data, error } = await supabase
        .from('venue_hours')
        .select('day_of_week, venue_open_time, venue_close_time, kitchen_open_time, kitchen_close_time, is_closed')
        .eq('venue_id', venue.id)
        .order('day_of_week');
      
      if (error) throw error;
      return data as VenueHour[];
    },
    enabled: !!venue?.id
  });
  
  // Fetch check-ins for this venue
  const { data: checkins = [] } = useQuery({
    queryKey: ['venueCheckins', venue?.id],
    queryFn: async () => {
      if (!venue?.id) return [];
      
      let query = supabase
        .from('checkins')
        .select(`
          id, rating, comment, visited_at, created_at, user_id,
          profiles!inner(first_name, last_name)
        `)
        .eq('venue_id', venue.id)
        .order('created_at', { ascending: false });
      
      // If user is logged in, prioritize their check-ins
      if (user) {
        const { data: userCheckins, error: userCheckinsError } = await query
          .eq('user_id', user.id);
          
        if (userCheckinsError) throw userCheckinsError;
        
        // Get other users' check-ins
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
        
        // Combine and return user's check-ins first, then others
        return [...(userCheckins || []), ...(otherCheckins || [])].map(item => ({
          ...item,
          first_name: item.profiles?.first_name || null,
          last_name: item.profiles?.last_name || null
        }));
      }
      
      // If not logged in, just get all check-ins
      const { data, error } = await query;
      if (error) throw error;
      
      return (data || []).map(item => ({
        ...item,
        first_name: item.profiles?.first_name || null,
        last_name: item.profiles?.last_name || null
      }));
    },
    enabled: !!venue?.id
  });
  
  const handleCheckInSuccess = () => {
    // Invalidate checkins query to trigger a refresh
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
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="text-xl font-bold truncate pr-2">{venue.name}</h2>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X size={20} />
        </Button>
      </div>
      
      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {/* About section */}
        {breweryInfo?.about && (
          <div className="space-y-2">
            <h3 className="font-medium text-sm">About</h3>
            <p className="text-sm text-muted-foreground whitespace-pre-line">{breweryInfo.about}</p>
          </div>
        )}
        
        {/* Address */}
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
        
        {/* Contact */}
        {(venue.phone || venue.website_url) && (
          <div className="space-y-2">
            <h3 className="font-medium text-sm">Contact</h3>
            {venue.phone && (
              <div className="flex items-center gap-2">
                <Phone size={16} className="text-muted-foreground flex-shrink-0" />
                <span className="text-sm">{venue.phone}</span>
              </div>
            )}
            {venue.website_url && (
              <div className="flex items-center gap-2">
                <Globe size={16} className="text-muted-foreground flex-shrink-0" />
                <a 
                  href={venue.website_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-blue-500 hover:text-blue-700 hover:underline"
                >
                  {venue.website_url.replace(/^https?:\/\//, '')}
                </a>
              </div>
            )}
          </div>
        )}
        
        {/* Hours */}
        <HoursSection title="Operating Hours" hours={venueHours} />
        
        {/* Kitchen Hours */}
        <HoursSection title="Kitchen Hours" hours={venueHours} showKitchenHours={true} />
        
        <Separator />
        
        {/* Check-ins */}
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
          
          {checkins.length === 0 ? (
            <p className="text-sm text-muted-foreground">No check-ins yet</p>
          ) : (
            <div className="space-y-4">
              {/* User's check-ins */}
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
              
              {/* Other users' check-ins */}
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
          )}
        </div>
      </div>
      
      {/* Check-in Dialog */}
      {venue && (
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

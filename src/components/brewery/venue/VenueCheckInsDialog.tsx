
import React, { useState, useEffect, useRef } from 'react';
import { Star } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import type { Venue } from '@/types/venue';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';

interface CheckIn {
  id: string;
  rating: number;
  comment: string | null;
  visited_at: string;
  user: {
    first_name: string | null;
    last_name: string | null;
  };
}

interface VenueCheckInsDialogProps {
  venue: Venue | null;
  isOpen: boolean;
  onClose: () => void;
}

const PAGE_SIZE = 20;

export function VenueCheckInsDialog({ venue, isOpen, onClose }: VenueCheckInsDialogProps) {
  const [checkins, setCheckins] = useState<CheckIn[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadingRef = useRef<HTMLDivElement>(null);

  const fetchCheckins = async (from = 0) => {
    if (!venue || isLoading) return;
    
    setIsLoading(true);
    try {
      // First, get checkins for this venue
      const { data: checkinsData, error: checkinsError } = await supabase
        .from('checkins')
        .select('id, rating, comment, visited_at, user_id')
        .eq('venue_id', venue.id)
        .order('visited_at', { ascending: false })
        .range(from, from + PAGE_SIZE - 1);

      if (checkinsError) throw checkinsError;

      if (!checkinsData || checkinsData.length === 0) {
        if (from === 0) {
          setCheckins([]);
        }
        setHasMore(false);
        return;
      }

      if (checkinsData.length < PAGE_SIZE) {
        setHasMore(false);
      }

      // Get unique user IDs from the checkins
      const userIds = [...new Set(checkinsData.map(checkin => checkin.user_id).filter(Boolean))];
      
      // Fetch profile data for all users
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, first_name, last_name')
        .in('id', userIds);

      if (profilesError) throw profilesError;

      // Create a map of user profiles for quick lookup
      const profilesMap = new Map(
        (profilesData || []).map(profile => [profile.id, profile])
      );

      // Combine checkins with profile data
      const combinedCheckins = checkinsData.map(checkin => ({
        id: checkin.id,
        rating: checkin.rating,
        comment: checkin.comment,
        visited_at: checkin.visited_at,
        user: {
          first_name: profilesMap.get(checkin.user_id)?.first_name || null,
          last_name: profilesMap.get(checkin.user_id)?.last_name || null
        }
      }));

      if (from === 0) {
        setCheckins(combinedCheckins);
      } else {
        setCheckins(prevCheckins => [...prevCheckins, ...combinedCheckins]);
      }
    } catch (error) {
      console.error('Error fetching checkins:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    if (isOpen && venue) {
      setCheckins([]);
      setHasMore(true);
      fetchCheckins(0);
    }
  }, [isOpen, venue]);

  // Setup intersection observer for infinite scrolling
  useEffect(() => {
    if (!hasMore || isLoading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore) {
          fetchCheckins(checkins.length);
        }
      },
      { threshold: 0.5 }
    );

    const currentLoadingRef = loadingRef.current;
    if (currentLoadingRef) {
      observer.observe(currentLoadingRef);
    }

    observerRef.current = observer;

    return () => {
      if (currentLoadingRef && observerRef.current) {
        observerRef.current.unobserve(currentLoadingRef);
      }
    };
  }, [checkins.length, hasMore, isLoading]);

  // Render stars based on rating
  const renderStars = (rating: number) => {
    return Array(5).fill(0).map((_, i) => (
      <Star 
        key={i} 
        size={16} 
        className={`${i < rating ? 'fill-amber-500 text-amber-500' : 'text-gray-300'}`} 
      />
    ));
  };

  // Format the date for display
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM d, yyyy');
    } catch (e) {
      return 'Unknown date';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Check-ins for {venue?.name}</DialogTitle>
        </DialogHeader>
        
        <div className="overflow-y-auto flex-grow">
          {checkins.length > 0 ? (
            <div className="space-y-4 py-2">
              {checkins.map((checkin) => (
                <div 
                  key={checkin.id} 
                  className="border border-border rounded-md p-4 space-y-2"
                >
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <div className="flex space-x-1">
                        {renderStars(checkin.rating)}
                      </div>
                      <p className="text-sm font-medium">
                        {checkin.user?.first_name && checkin.user?.last_name
                          ? `${checkin.user.first_name} ${checkin.user.last_name}`
                          : 'Anonymous User'}
                      </p>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(checkin.visited_at)}
                    </span>
                  </div>
                  
                  {checkin.comment && (
                    <p className="text-sm text-muted-foreground">{checkin.comment}</p>
                  )}
                </div>
              ))}
              
              {hasMore && (
                <div 
                  ref={loadingRef} 
                  className="py-4 flex justify-center"
                >
                  {isLoading && (
                    <div className="space-y-2 w-full">
                      <Skeleton className="h-24 w-full" />
                      <Skeleton className="h-24 w-full" />
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : isLoading ? (
            <div className="space-y-2 p-4">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          ) : (
            <div className="flex items-center justify-center h-40">
              <p className="text-muted-foreground">No check-ins found for this venue</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default VenueCheckInsDialog;

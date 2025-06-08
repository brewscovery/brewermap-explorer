
import React from 'react';
import { X, ShieldCheck, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import BreweryLogo from '@/components/brewery/BreweryLogo';
import VenueSidebarActions from './VenueSidebarActions';
import type { Brewery } from '@/types/brewery';
import type { Venue } from '@/types/venue';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface VenueSidebarHeaderProps {
  venue: Venue;
  venueName: string;
  breweryInfo: Brewery | null;
  onClose: () => void;
  displayMode: 'full' | 'favorites';
  onOpenCheckInDialog: () => void;
  onOpenTodoListDialog: () => void;
}

const VenueSidebarHeader = ({ 
  venue,
  venueName, 
  breweryInfo, 
  onClose,
  displayMode,
  onOpenCheckInDialog,
  onOpenTodoListDialog
}: VenueSidebarHeaderProps) => {
  // Query to get venue check-in data
  const { data: checkInStats } = useQuery({
    queryKey: ['venueCheckInStats', venue.id],
    queryFn: async () => {
      const { data: checkinsCount, error: countError } = await supabase
        .from('checkins')
        .select('count')
        .eq('venue_id', venue.id);
        
      const { data: avgRating, error: avgError } = await supabase
        .from('checkins')
        .select('rating')
        .eq('venue_id', venue.id)
        .not('rating', 'is', null);
      
      if (countError || avgError) {
        console.error('Error fetching checkin stats:', countError || avgError);
        return { count: 0, avgRating: 0 };
      }
      
      const count = checkinsCount?.[0]?.count || 0;
      
      // Calculate average rating if we have ratings
      let avg = 0;
      if (avgRating && avgRating.length > 0) {
        const sum = avgRating.reduce((acc, curr) => acc + (curr.rating || 0), 0);
        avg = Math.round((sum / avgRating.length) * 10) / 10; // Round to 1 decimal
      }
      
      return { count, avgRating: avg };
    }
  });

  // Function to get the appropriate independent brewery logo based on country
  const getIndependentBreweryLogo = (country: string | null) => {
    if (country === 'United States' || country === 'United States of America') {
      return "/lovable-uploads/1f789c84-9f47-42b7-ad64-39aac10a72ea.png";
    } else if (country === 'Australia') {
      return "/lovable-uploads/5aa2675a-19ef-429c-b610-584fdabf6b1b.png";
    }
    // Default to Australia logo for other countries or if country is null
    return "/lovable-uploads/5aa2675a-19ef-429c-b610-584fdabf6b1b.png";
  };

  return (
    <div className="flex flex-col p-4 border-b relative">
      {/* Top row: venue name and close button */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold truncate pr-8">{venueName}</h2>
        <Button 
          variant="ghost" 
          size="icon"
          onClick={onClose}
          className="hover:bg-gray-100 absolute right-2 top-3"
        >
          <X size={20} />
          <span className="sr-only">Close</span>
        </Button>
      </div>
      
      {/* Two column layout */}
      <div className="flex">
        {/* Column 1: Logo */}
        <div className="flex-shrink-0 mr-4">
          <BreweryLogo 
            logoUrl={breweryInfo?.logo_url}
            name={breweryInfo?.name}
            size="large"
          />
        </div>
        
        {/* Column 2: Three rows of info */}
        <div className="flex flex-col flex-grow justify-between h-32">
          {/* Row 1: Check-in details */}
          <div className="flex items-center gap-2 mb-1">
              <span className="text-sm text-muted-foreground">
                My rating: 
              </span>
            {checkInStats && checkInStats.avgRating > 0 && (
              <div className="flex items-center bg-amber-50 px-3 py-1.5 rounded-md border border-amber-200">
                <Star size={18} className="text-amber-500 mr-1.5 fill-amber-500" />
                <span className="font-semibold text-base">{checkInStats.avgRating.toFixed(1)} ({checkInStats.count})</span>
              </div>
            )}
          </div>
          
          {/* Row 2: Verification badges */}
          <div className="flex items-center gap-2 mb-1">
            {breweryInfo?.is_verified ? (
              <Badge variant="secondary" className="flex items-center gap-1.5 bg-amber-100 text-amber-700 border border-amber-300 py-1.5 px-3 text-sm">
                <ShieldCheck size={18} className="text-amber-500" />
                <span>Verified</span>
              </Badge>
            ) : (
              <Badge variant="outline" className="flex items-center gap-1.5 text-muted-foreground py-1.5 px-3 text-sm">
                <ShieldCheck size={18} />
                <span>Unverified</span>
              </Badge>
            )}
            
            {/* Independent brewery badge */}
            {breweryInfo?.is_independent && (
              <div>
                <img 
                  src={getIndependentBreweryLogo(breweryInfo?.country)} 
                  alt="Certified Independent" 
                  className="h-8" 
                />
              </div>
            )}
          </div>
          
          {/* Row 3: Action buttons */}
          <div className="flex items-center mt-1">
            <VenueSidebarActions
              venue={venue}
              displayMode={displayMode}
              onOpenCheckInDialog={onOpenCheckInDialog}
              onOpenTodoListDialog={onOpenTodoListDialog}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default VenueSidebarHeader;

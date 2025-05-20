
import React from 'react';
import { X, ShieldCheck } from 'lucide-react';
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

  return (
    <div className="flex flex-col p-4 border-b relative">
      {/* Top row: venue name and close button */}
      <div className="flex items-center justify-between mb-3">
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
      
      {/* Main content area with logo, stats and actions */}
      <div className="flex items-start">
        {/* Logo column */}
        <div className="flex-shrink-0 mr-3">
          <BreweryLogo 
            logoUrl={breweryInfo?.logo_url}
            name={breweryInfo?.name}
            size="large"
          />
        </div>
        
        {/* Center column: stats and verification */}
        <div className="flex flex-col flex-1 min-w-0">
          
          {/* Verification status */}
          <div className="flex flex-wrap gap-2 items-center">
            {breweryInfo?.is_verified ? (
              <Badge variant="secondary" className="flex items-center gap-1 bg-amber-100 text-amber-700 border border-amber-300">
                <ShieldCheck size={14} className="text-amber-500" />
                <span>Verified</span>
              </Badge>
            ) : (
              <Badge variant="outline" className="flex items-center gap-1 text-muted-foreground">
                <ShieldCheck size={14} />
                <span>Unverified</span>
              </Badge>
            )}
            
            {/* Independent brewery badge */}
            {breweryInfo?.is_independent && (
              <div>
                <img 
                  src="/lovable-uploads/5aa2675a-19ef-429c-b610-584fdabf6b1b.png" 
                  alt="Certified Independent Brewery" 
                  className="h-8" 
                />
              </div>
            )}
          </div>
        </div>
        
        {/* Action buttons column */}
        <div className="flex items-center shrink-0 ml-auto">
          <VenueSidebarActions
            venue={venue}
            displayMode={displayMode}
            onOpenCheckInDialog={onOpenCheckInDialog}
            onOpenTodoListDialog={onOpenTodoListDialog}
          />
        </div>
      </div>
    </div>
  );
};

export default VenueSidebarHeader;

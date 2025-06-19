
import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ShieldCheck, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { VenueFollowButton } from './VenueFollowButton';

interface VenueCardProps {
  venue: {
    id: string;
    name: string;
    city: string;
    state: string;
    country?: string;
  };
  brewery: {
    name: string;
    logo_url?: string | null;
    is_verified?: boolean;
  };
  distance?: number; // Add optional distance prop
  onClick?: () => void;
}

export const VenueCard = ({ venue, brewery, distance, onClick }: VenueCardProps) => {
  const formatDistance = (distance: number, country?: string) => {
    if (country === 'United States' || country === 'United States of America') {
      const miles = distance * 0.621371;
      return `${miles.toFixed(1)} mi`;
    }
    return `${distance.toFixed(1)} km`;
  };

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow" onClick={onClick}>
      <div className="p-4 relative">
        {distance !== undefined && (
          <div className="absolute top-2 right-2 bg-background/90 backdrop-blur-sm rounded-md px-2 py-1 text-xs font-medium border">
            {formatDistance(distance, venue.country)}
          </div>
        )}
        
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            {brewery?.logo_url ? (
              <img 
                src={brewery.logo_url} 
                alt={brewery.name} 
                className="w-10 h-10 rounded-full object-cover border"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                <span className="text-muted-foreground text-lg font-bold">
                  {brewery?.name?.charAt(0) || 'B'}
                </span>
              </div>
            )}
            <div className={distance !== undefined ? "pr-16" : ""}>
              <h3 className="font-medium truncate">{venue.name}</h3>
              <p className="text-sm text-muted-foreground truncate">
                {brewery.name}
              </p>
            </div>
          </div>
        </div>

        {brewery?.is_verified && (
        <div className="flex items-start justify-between mb-3">
          <Badge variant="secondary" className="flex items-center gap-1">
            <ShieldCheck size={12} />
            <span>Verified</span>
          </Badge>
        </div>
        )}
        
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center text-sm text-muted-foreground">
            <MapPin size={14} className="mr-1" />
            <span>
              {venue.city}, {venue.state}
            </span>
          </div>
          
          <VenueFollowButton 
            venueId={venue.id}
            size="sm"
            showCount={false}
          />
        </div>
      </div>
    </Card>
  );
};

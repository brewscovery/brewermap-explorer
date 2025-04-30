
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
  };
  brewery: {
    name: string;
    logo_url?: string | null;
    is_verified?: boolean;
  };
  onClick?: () => void; // Add optional onClick handler
}

export const VenueCard = ({ venue, brewery, onClick }: VenueCardProps) => {
  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow" onClick={onClick}>
      <div className="p-4">
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
            <div>
              <h3 className="font-medium truncate">{venue.name}</h3>
              <p className="text-sm text-muted-foreground truncate">
                {brewery.name}
              </p>
            </div>
          </div>
          {brewery?.is_verified && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <ShieldCheck size={12} />
              <span>Verified</span>
            </Badge>
          )}
        </div>
        
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

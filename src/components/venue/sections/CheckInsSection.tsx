
import React from 'react';
import { Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Venue } from '@/types/venue';

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

interface CheckInsSectionProps {
  venue: Venue;
  checkins: CheckIn[];
  user: any;
  userType: string | null;
  onOpenCheckInDialog: () => void;
}

const CheckInsSection = ({ venue, checkins, user, userType, onOpenCheckInDialog }: CheckInsSectionProps) => {
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
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <h3 className="font-medium">Check-ins</h3>
        {user && userType === 'regular' && (
          <Button 
            size="sm" 
            variant="default"
            onClick={onOpenCheckInDialog}
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
  );
};

export default CheckInsSection;

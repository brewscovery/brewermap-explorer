
import { useState, useEffect } from 'react';
import { Clock, ChevronDown, ChevronUp, Utensils } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useVenueHours } from '@/hooks/useVenueHours';
import { DAYS_OF_WEEK } from '@/types/venueHours';
import type { VenueHour } from '@/types/venueHours';

interface VenueHoursDisplayProps {
  venueId: string;
}

const VenueHoursDisplay = ({ venueId }: VenueHoursDisplayProps) => {
  const [expanded, setExpanded] = useState(false);
  const { hours, isLoading } = useVenueHours(venueId);
  const [todayHours, setTodayHours] = useState<VenueHour | null>(null);
  
  useEffect(() => {
    if (hours && hours.length > 0) {
      const today = new Date().getDay(); // 0 = Sunday, 6 = Saturday
      const todayData = hours.find(h => h.day_of_week === today);
      setTodayHours(todayData || null);
    }
  }, [hours]);

  const formatTime = (time: string | null) => {
    if (!time) return 'Closed';
    
    try {
      // Convert 24-hour time string to 12-hour time with AM/PM
      const [hours, minutes] = time.split(':');
      const hour = parseInt(hours, 10);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const formattedHour = hour % 12 || 12; // Convert 0 to 12 for 12 AM
      
      return `${formattedHour}:${minutes} ${ampm}`;
    } catch (e) {
      return time;
    }
  };

  if (isLoading) {
    return (
      <div className="text-sm text-muted-foreground flex items-center gap-2 mt-2">
        <Clock size={14} />
        <span>Loading hours...</span>
      </div>
    );
  }

  if (hours.length === 0) {
    return (
      <div className="text-sm text-muted-foreground flex items-center gap-2 mt-2">
        <Clock size={14} />
        <span>No hours available</span>
      </div>
    );
  }

  return (
    <div className="mt-2 space-y-2">
      {/* Today's hours summary */}
      {todayHours && (
        <div className="flex justify-between items-start">
          <div className="text-sm flex items-center gap-2">
            <Clock size={14} className="text-muted-foreground" />
            {todayHours.is_closed ? (
              <span className="text-muted-foreground">Closed today</span>
            ) : (
              <span>Open today: {formatTime(todayHours.venue_open_time)} - {formatTime(todayHours.venue_close_time)}</span>
            )}
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setExpanded(!expanded)}
            className="h-6 px-1"
          >
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </Button>
        </div>
      )}
      
      {/* Expanded hours view */}
      {expanded && (
        <div className="pt-2 text-sm space-y-2">
          {hours.sort((a, b) => a.day_of_week - b.day_of_week).map((hour) => (
            <div key={hour.id} className="grid grid-cols-[80px_1fr] gap-1">
              <div className="font-medium">{DAYS_OF_WEEK[hour.day_of_week]}</div>
              {hour.is_closed ? (
                <div className="text-muted-foreground">Closed</div>
              ) : (
                <div className="space-y-1">
                  <div className="flex items-center gap-1">
                    <Clock size={12} className="text-muted-foreground" />
                    <span>{formatTime(hour.venue_open_time)} - {formatTime(hour.venue_close_time)}</span>
                  </div>
                  
                  {(hour.kitchen_open_time || hour.kitchen_close_time) && (
                    <div className="flex items-center gap-1">
                      <Utensils size={12} className="text-muted-foreground" />
                      <span>Kitchen: {formatTime(hour.kitchen_open_time)} - {formatTime(hour.kitchen_close_time)}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default VenueHoursDisplay;

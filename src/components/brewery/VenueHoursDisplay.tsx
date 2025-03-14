
import { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useVenueHours } from '@/hooks/useVenueHours';
import { DAYS_OF_WEEK } from '@/types/venueHours';
import type { VenueHour } from '@/types/venueHours';
import { getTodayDayOfWeek } from '@/utils/dateTimeUtils';
import TodayHours from './hours/TodayHours';
import HoursRow from './hours/HoursRow';

interface VenueHoursDisplayProps {
  venueId: string;
}

const VenueHoursDisplay = ({ venueId }: VenueHoursDisplayProps) => {
  const [expanded, setExpanded] = useState(false);
  const { hours, isLoading } = useVenueHours(venueId);
  const [todayHours, setTodayHours] = useState<VenueHour | null>(null);
  
  useEffect(() => {
    if (hours && hours.length > 0) {
      const today = getTodayDayOfWeek();
      const todayData = hours.find(h => h.day_of_week === today);
      setTodayHours(todayData || null);
    }
  }, [hours]);

  if (isLoading) {
    return (
      <div className="text-sm text-muted-foreground flex items-center gap-2 mt-2">
        <span>Loading hours...</span>
      </div>
    );
  }

  if (hours.length === 0) {
    return (
      <div className="text-sm text-muted-foreground flex items-center gap-2 mt-2">
        <span>No hours available</span>
      </div>
    );
  }

  return (
    <div className="mt-2 space-y-2">
      {/* Today's hours summary */}
      <div className="flex justify-between items-start">
        <TodayHours todayHours={todayHours} />
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => setExpanded(!expanded)}
          className="h-6 px-1"
        >
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </Button>
      </div>
      
      {/* Expanded hours view */}
      {expanded && (
        <div className="pt-2 text-sm space-y-2">
          {hours
            .sort((a, b) => a.day_of_week - b.day_of_week)
            .map((hour) => (
              <HoursRow 
                key={hour.id} 
                day={DAYS_OF_WEEK[hour.day_of_week]} 
                hourData={hour} 
              />
            ))}
        </div>
      )}
    </div>
  );
};

export default VenueHoursDisplay;

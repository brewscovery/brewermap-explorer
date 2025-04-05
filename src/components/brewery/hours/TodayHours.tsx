
import { Clock, Utensils } from 'lucide-react';
import type { VenueHour } from '@/types/venueHours';
import { formatTime } from '@/utils/dateTimeUtils';

interface TodayHoursProps {
  todayHours: VenueHour | null;
}

const TodayHours = ({ todayHours }: TodayHoursProps) => {
  if (!todayHours) {
    return (
      <div className="text-sm flex items-center gap-2">
        <Clock size={14} className="text-muted-foreground" />
        <span className="text-muted-foreground">Hours not available</span>
      </div>
    );
  }
  
  const hasKitchenHours = todayHours.kitchen_open_time !== null && todayHours.kitchen_close_time !== null;

  return (
    <div className="text-sm">
      <div className="flex items-center gap-2">
        <Clock size={14} className="text-muted-foreground" />
        {todayHours.is_closed ? (
          <span className="text-muted-foreground">Closed today</span>
        ) : (
          <span>
            Open today: {formatTime(todayHours.venue_open_time)} - {formatTime(todayHours.venue_close_time)}
          </span>
        )}
      </div>
      
      {hasKitchenHours && !todayHours.is_closed && (
        <div className="flex items-center gap-2 mt-1">
          <Utensils size={14} className="text-muted-foreground" />
          <span>
            Kitchen: {formatTime(todayHours.kitchen_open_time)} - {formatTime(todayHours.kitchen_close_time)}
          </span>
        </div>
      )}
    </div>
  );
};

export default TodayHours;

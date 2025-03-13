
import { Clock, Utensils } from 'lucide-react';
import type { VenueHour } from '@/types/venueHours';
import { formatTime } from '@/utils/dateTimeUtils';

interface HoursRowProps {
  day: string;
  hourData: VenueHour;
}

const HoursRow = ({ day, hourData }: HoursRowProps) => {
  if (hourData.is_closed) {
    return (
      <div className="grid grid-cols-[80px_1fr] gap-1">
        <div className="font-medium">{day}</div>
        <div className="text-muted-foreground">Closed</div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-[80px_1fr] gap-1">
      <div className="font-medium">{day}</div>
      <div className="space-y-1">
        <div className="flex items-center gap-1">
          <Clock size={12} className="text-muted-foreground" />
          <span>
            {formatTime(hourData.venue_open_time)} - {formatTime(hourData.venue_close_time)}
          </span>
        </div>
        
        {(hourData.kitchen_open_time || hourData.kitchen_close_time) && (
          <div className="flex items-center gap-1">
            <Utensils size={12} className="text-muted-foreground" />
            <span>
              Kitchen: {formatTime(hourData.kitchen_open_time)} - {formatTime(hourData.kitchen_close_time)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default HoursRow;

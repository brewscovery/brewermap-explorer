
import { Clock } from 'lucide-react';
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

  return (
    <div className="text-sm flex items-center gap-2">
      <Clock size={14} className="text-muted-foreground" />
      {todayHours.is_closed ? (
        <span className="text-muted-foreground">Closed today</span>
      ) : (
        <span>
          Open today: {formatTime(todayHours.venue_open_time)} - {formatTime(todayHours.venue_close_time)}
        </span>
      )}
    </div>
  );
};

export default TodayHours;

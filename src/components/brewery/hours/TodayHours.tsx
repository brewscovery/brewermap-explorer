
import { Clock, Utensils, XCircle } from 'lucide-react';
import type { VenueHour } from '@/types/venueHours';
import { formatTime, getVenueOpenStatus, getKitchenOpenStatus } from '@/utils/dateTimeUtils';

interface TodayHoursProps {
  todayHours: VenueHour | null;
  venueHours: VenueHour[];
}

const TodayHours = ({ todayHours, venueHours }: TodayHoursProps) => {
  const venueStatus = getVenueOpenStatus(venueHours);
  const kitchenStatus = getKitchenOpenStatus(venueHours);
  
  if (!todayHours) {
    return (
      <div className="text-sm flex items-center gap-2">
        <Clock size={14} className="text-muted-foreground" />
        <span className="text-muted-foreground">Hours not available</span>
      </div>
    );
  }
  
  const hasKitchenHours = todayHours.kitchen_open_time !== null && todayHours.kitchen_close_time !== null;
  const kitchenClosedToday = !todayHours.is_closed && !hasKitchenHours;

  return (
    <div className="text-sm">
      <div className="flex items-center gap-2">
        <Clock size={14} className={venueStatus.isOpen ? "text-green-600" : "text-muted-foreground"} />
        <div>
          <span className={venueStatus.isOpen ? "text-green-600 font-medium" : "text-muted-foreground"}>
            {venueStatus.statusText}
          </span>
          
          {/* Show next opening info if closed */}
          {!venueStatus.isOpen && venueStatus.nextOpenInfo && (
            <div className="text-muted-foreground text-xs mt-0.5">
              Opens {venueStatus.nextOpenInfo.isToday ? "today" : venueStatus.nextOpenInfo.day} at {venueStatus.nextOpenInfo.time}
            </div>
          )}
        </div>
      </div>
      
      {kitchenClosedToday && !todayHours.is_closed && (
        <div className="flex items-center gap-2 mt-1">
          <XCircle size={14} className="text-muted-foreground" />
          <span className="text-muted-foreground">
            Kitchen closed today
          </span>
        </div>
      )}
      
      {hasKitchenHours && !todayHours.is_closed && (
        <div className="flex items-center gap-2 mt-1">
          <Utensils size={14} className={kitchenStatus.isOpen ? "text-green-600" : "text-muted-foreground"} />
          <div>
            <span className={kitchenStatus.isOpen ? "text-green-600 font-medium" : "text-muted-foreground"}>
              {kitchenStatus.statusText}
            </span>
            
            {/* Show next kitchen opening info if closed */}
            {!kitchenStatus.isOpen && kitchenStatus.nextOpenInfo && (
              <div className="text-muted-foreground text-xs mt-0.5">
                Opens {kitchenStatus.nextOpenInfo.isToday ? "today" : kitchenStatus.nextOpenInfo.day} at {kitchenStatus.nextOpenInfo.time}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TodayHours;

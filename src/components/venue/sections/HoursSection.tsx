
import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, Clock, Utensils, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatTime, sortHoursStartingWithToday, getTodayDayOfWeek, getVenueOpenStatus, getKitchenOpenStatus } from '@/utils/dateTimeUtils';
import { DAYS_OF_WEEK } from '@/types/venueHours';

interface HoursSectionProps { 
  title: string; 
  hours: any[]; 
  showKitchenHours?: boolean;
}

const HoursSection = ({ title, hours, showKitchenHours = false }: HoursSectionProps) => {
  const [expanded, setExpanded] = useState(false);
  const [, setUpdateTime] = useState(new Date());
  const todayIndex = getTodayDayOfWeek();
  
  // Timer to update status every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setUpdateTime(new Date()); // Force re-render
    }, 60000); // Update every minute
    
    return () => clearInterval(timer);
  }, []);
  
  const todayHours = hours.find(h => h.day_of_week === todayIndex);
  
  // Get real-time status
  const status = showKitchenHours ? 
    getKitchenOpenStatus(hours) : 
    getVenueOpenStatus(hours);
  
  if (!hours.length) {
    return (
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <h3 className="font-medium text-sm">{title}</h3>
        </div>
        <p className="text-sm text-muted-foreground">No hours available</p>
      </div>
    );
  }
  
  const getHoursText = (hour: any) => {
    if (hour.is_closed) return 'Closed';
    
    if (showKitchenHours) {
      if (!hour.kitchen_open_time || !hour.kitchen_close_time) return 'Kitchen closed';
      return `${formatTime(hour.kitchen_open_time)} - ${formatTime(hour.kitchen_close_time)}`;
    } else {
      if (!hour.venue_open_time || !hour.venue_close_time) return 'Closed';
      return `${formatTime(hour.venue_open_time)} - ${formatTime(hour.venue_close_time)}`;
    }
  };
  
  // Sort hours to start with today
  const sortedHours = sortHoursStartingWithToday(hours);
  
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <h3 className="font-medium text-sm flex items-center">
          {showKitchenHours ? (
            <Utensils size={14} className={status.isOpen ? "mr-1 text-green-600" : "mr-1 text-muted-foreground"} />
          ) : (
            <Clock size={14} className={status.isOpen ? "mr-1 text-green-600" : "mr-1 text-muted-foreground"} />
          )}
          {title}
        </h3>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => setExpanded(!expanded)}
          className="h-6 w-6 p-0"
        >
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </Button>
      </div>
      
      <div className="text-sm">
        {/* Show status instead of hours when collapsed */}
        <div className="flex flex-col">
          <div className={status.isOpen ? "text-green-600 font-medium" : "text-muted-foreground"}>
            {status.statusText}
          </div>
          
          {/* Show next opening info if closed */}
          {!status.isOpen && status.nextOpenInfo && (
            <div className="text-muted-foreground text-xs mt-0.5">
              Opens {status.nextOpenInfo.isToday ? "today" : status.nextOpenInfo.day} at {status.nextOpenInfo.time}
            </div>
          )}
        </div>
        
        {expanded && (
          <div className="mt-2 space-y-1.5">
            {sortedHours.map((hour) => (
              <div 
                key={hour.day_of_week} 
                className={`flex justify-between ${hour.day_of_week === todayIndex ? 'font-medium' : ''}`}
              >
                <span>{DAYS_OF_WEEK[hour.day_of_week]}</span>
                <span className="flex items-center gap-1">
                  {showKitchenHours && !hour.is_closed && (!hour.kitchen_open_time || !hour.kitchen_close_time) && (
                    <XCircle size={12} className="text-muted-foreground" />
                  )}
                  {getHoursText(hour)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HoursSection;

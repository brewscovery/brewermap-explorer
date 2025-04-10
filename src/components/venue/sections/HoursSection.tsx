
import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Clock, Utensils, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatTime, sortHoursStartingWithToday, getTodayDayOfWeek } from '@/utils/dateTimeUtils';
import { DAYS_OF_WEEK } from '@/types/venueHours';

interface HoursSectionProps { 
  title: string; 
  hours: any[]; 
  showKitchenHours?: boolean;
}

const HoursSection = ({ title, hours, showKitchenHours = false }: HoursSectionProps) => {
  const [expanded, setExpanded] = useState(false);
  const todayIndex = getTodayDayOfWeek();
  
  const todayHours = hours.find(h => h.day_of_week === todayIndex);
  
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
  
  const todayHoursText = todayHours 
    ? getHoursText(todayHours)
    : 'Hours not available';
  
  // Sort hours to start with today
  const sortedHours = sortHoursStartingWithToday(hours);
  
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <h3 className="font-medium text-sm flex items-center">
          {showKitchenHours ? (
            <Utensils size={14} className="mr-1 text-muted-foreground" />
          ) : (
            <Clock size={14} className="mr-1 text-muted-foreground" />
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
        <div className="flex justify-between">
          <span className="font-medium">Today:</span>
          <span className="flex items-center gap-1">
            {showKitchenHours && todayHours && !todayHours.is_closed && (!todayHours.kitchen_open_time || !todayHours.kitchen_close_time) && (
              <XCircle size={12} className="text-muted-foreground" />
            )}
            {todayHoursText}
          </span>
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

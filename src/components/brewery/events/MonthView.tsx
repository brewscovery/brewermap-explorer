
import React from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { format, isSameMonth, isToday, isSameDay } from "date-fns";
import { cn } from "@/lib/utils";
import { VenueEvent } from "@/hooks/useVenueEvents";
import { getVenueColor } from "./utils/calendarViewUtils";
import type { Venue } from "@/types/venue";

interface MonthViewProps {
  currentDate: Date;
  monthDays: Date[];
  monthWeeks: Date[][];
  eventsByDate: Map<string, VenueEvent[]>;
  venueMap: Record<string, string>;
  onCreateEvent: (date: Date) => void;
  onEditEvent: (event: VenueEvent) => void;
  goToToday: () => void;
  prevMonth: () => void;
  nextMonth: () => void;
}

const MonthView: React.FC<MonthViewProps> = ({
  currentDate,
  monthDays,
  monthWeeks,
  eventsByDate,
  venueMap,
  onCreateEvent,
  onEditEvent,
  goToToday,
  prevMonth,
  nextMonth,
}) => {
  const renderMonthEvent = (event: VenueEvent, isFirst: boolean, isLast: boolean, dayEvents: VenueEvent[]) => {
    const startTime = new Date(event.start_time);
    const venueName = venueMap[event.venue_id] || 'Unknown venue';
    const bgColor = getVenueColor(event.venue_id, 0.8, event.is_published);
    const displayTime = format(startTime, 'h:mm a');
    const eventTitle = event.is_published ? event.title : `[Unpublished] ${event.title}`;
    
    return (
      <div 
        key={event.id}
        onClick={(e) => {
          e.stopPropagation();
          onEditEvent(event);
        }}
        className={cn(
          "px-1 py-0.5 text-xs font-medium truncate cursor-pointer border-l-2 hover:opacity-90",
          isFirst ? "rounded-t" : "",
          isLast ? "rounded-b" : "",
          !event.is_published && "italic"
        )}
        style={{ 
          backgroundColor: bgColor,
          borderLeftColor: getVenueColor(event.venue_id, 1, event.is_published),
          color: "#000",
        }}
      >
        {isFirst && <span className="font-semibold">{displayTime}</span>} {eventTitle}
      </div>
    );
  };

  return (
    <div className="border rounded">
      <div className="flex justify-between items-center p-2 border-b bg-background">
        <Button variant="outline" size="sm" onClick={prevMonth}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="font-medium text-lg">
          {format(currentDate, 'MMMM yyyy')}
        </div>
        <div className="space-x-1">
          <Button variant="outline" size="sm" onClick={goToToday}>
            Today
          </Button>
          <Button variant="outline" size="sm" onClick={nextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 border-b bg-muted/20">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div key={day} className="p-2 text-center font-medium">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7">
        {monthWeeks.map((week, weekIndex) => (
          <React.Fragment key={weekIndex}>
            {week.map((day, dayIndex) => {
              const dateKey = format(day, 'yyyy-MM-dd');
              const dayEvents = eventsByDate.get(dateKey) || [];
              const isCurrentMonth = isSameMonth(day, currentDate);
              const isCurrentDay = isToday(day);
              
              const sortedEvents = [...dayEvents].sort((a, b) => {
                return new Date(a.start_time).getTime() - new Date(b.start_time).getTime();
              });

              const maxVisibleEvents = 3;
              const visibleEvents = sortedEvents.slice(0, maxVisibleEvents);
              const hiddenCount = sortedEvents.length - maxVisibleEvents;

              return (
                <div 
                  key={dateKey} 
                  className={cn(
                    "min-h-[130px] border-r border-b p-1 overflow-hidden",
                    !isCurrentMonth && "bg-muted/10 text-muted-foreground",
                    isCurrentDay && "bg-muted/30"
                  )}
                  onClick={() => onCreateEvent(day)}
                >
                  <div className={cn(
                    "flex justify-between items-start mb-1",
                    isCurrentDay && "font-bold text-primary"
                  )}>
                    <span className={cn(
                      "text-sm",
                      isCurrentDay && "bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center"
                    )}>
                      {format(day, 'd')}
                    </span>
                    {dayEvents.length > 0 && (
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-5 w-5" 
                        onClick={(e) => {
                          e.stopPropagation();
                          onCreateEvent(day);
                        }}
                      >
                        <span className="sr-only">Add event</span>
                        <span className="text-xs">+</span>
                      </Button>
                    )}
                  </div>
                  
                  <div className="space-y-1">
                    {visibleEvents.map((event, index) => (
                      renderMonthEvent(
                        event, 
                        index === 0, 
                        index === visibleEvents.length - 1 && hiddenCount === 0,
                        sortedEvents
                      )
                    ))}
                    
                    {hiddenCount > 0 && (
                      <div 
                        className="text-xs text-center py-0.5 bg-muted/30 cursor-pointer rounded"
                        onClick={(e) => e.stopPropagation()}
                      >
                        +{hiddenCount} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default MonthView;

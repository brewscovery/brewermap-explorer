
import React from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { format, isToday } from "date-fns";
import { cn } from "@/lib/utils";
import { VenueEvent } from "@/hooks/useVenueEvents";
import { getVenueColor } from "./utils/calendarViewUtils";
import type { Venue } from "@/types/venue";

interface WeekViewProps {
  weekStart: Date;
  weekDays: Date[];
  eventsByDate: Map<string, VenueEvent[]>;
  venueMap: Record<string, string>;
  onCreateEvent: (date: Date) => void;
  onEditEvent: (event: VenueEvent) => void;
  onDeleteEvent: (event: VenueEvent) => void;
  goToToday: () => void;
  prevWeek: () => void;
  nextWeek: () => void;
}

const WeekView: React.FC<WeekViewProps> = ({
  weekStart,
  weekDays,
  eventsByDate,
  venueMap,
  onCreateEvent,
  onEditEvent,
  onDeleteEvent,
  goToToday,
  prevWeek,
  nextWeek,
}) => {
  return (
    <div className="border rounded">
      <div className="flex justify-between items-center p-2 border-b">
        <Button variant="outline" size="sm" onClick={prevWeek}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="font-medium">
          {format(weekStart, 'MMM d')} - {format(weekDays[6], 'MMM d, yyyy')}
        </div>
        <div className="space-x-1">
          <Button variant="outline" size="sm" onClick={goToToday}>
            Today
          </Button>
          <Button variant="outline" size="sm" onClick={nextWeek}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {/* Day headers - horizontal row */}
      <div className="grid grid-cols-7 border-b">
        {weekDays.map((day) => (
          <div 
            key={`header-${day.toString()}`}
            className={cn(
              "p-2 text-center bg-muted/10 border-r last:border-r-0",
              isToday(day) && "bg-muted/30 font-bold"
            )}
          >
            <div className="font-medium text-sm">{format(day, 'EEE')}</div>
            <div className={cn(
              "text-lg font-semibold",
              isToday(day) && "bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center mx-auto text-sm"
            )}>
              {format(day, 'd')}
            </div>
          </div>
        ))}
      </div>
      
      {/* Events grid - each day in a column */}
      <div className="grid grid-cols-7 min-h-[300px]">
        {weekDays.map((day) => {
          const dateKey = format(day, 'yyyy-MM-dd');
          const dayEvents = eventsByDate.get(dateKey) || [];
          
          return (
            <div 
              key={day.toString()}
              className={cn(
                "border-r last:border-r-0 p-2 cursor-pointer",
                isToday(day) && "bg-muted/10"
              )}
              onClick={() => onCreateEvent(day)}
            >
              <div className="space-y-2">
                {dayEvents.map((event) => {
                  const eventTitle = event.is_published ? event.title : `[Unpublished] ${event.title}`;
                  return (
                    <div 
                      key={event.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditEvent(event);
                      }}
                      className={cn(
                        "p-2 rounded cursor-pointer text-xs relative group",
                        !event.is_published && "italic"
                      )}
                      style={{ 
                        backgroundColor: getVenueColor(event.venue_id, 0.7, event.is_published),
                        borderLeft: `3px solid ${getVenueColor(event.venue_id, 1, event.is_published)}` 
                      }}
                    >
                      <div className="font-medium truncate text-xs">{eventTitle}</div>
                      <div className="text-xs opacity-80">
                        {format(new Date(event.start_time), 'h:mm a')}
                      </div>
                      <div className="text-xs opacity-70 truncate">
                        {venueMap[event.venue_id] || 'Unknown venue'}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-4 w-4 absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteEvent(event);
                        }}
                      >
                        <span className="sr-only">Delete</span>
                        <span className="text-xs">×</span>
                      </Button>
                    </div>
                  );
                })}
                {dayEvents.length === 0 && (
                  <div className="text-center text-xs text-muted-foreground h-full flex items-center justify-center pt-8">
                    <div>Click to add event</div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WeekView;

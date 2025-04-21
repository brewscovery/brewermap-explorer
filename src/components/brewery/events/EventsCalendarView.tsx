
import React, { useState, useMemo } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { CalendarDays, List, ChevronLeft, ChevronRight } from "lucide-react";
import { VenueEvent } from "@/hooks/useVenueEvents";
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, addWeeks, subWeeks } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Venue {
  id: string;
  name: string;
}

interface EventsCalendarViewProps {
  events: VenueEvent[];
  venues: Venue[];
  onEditEvent: (event: VenueEvent) => void;
  onDeleteEvent: (event: VenueEvent) => void;
  onCreateEvent: (date: Date) => void;
}

// Generate a consistent color based on venue ID
const getVenueColor = (venueId: string, alpha: number = 1): string => {
  // Simple hash function for the venue ID
  const hash = venueId.split('').reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc);
  }, 0);
  
  // Generate HSL color with fixed saturation and lightness
  const h = Math.abs(hash % 360);
  return `hsla(${h}, 70%, 65%, ${alpha})`;
};

const EventsCalendarView: React.FC<EventsCalendarViewProps> = ({
  events,
  venues,
  onEditEvent,
  onDeleteEvent,
  onCreateEvent,
}) => {
  const [viewType, setViewType] = useState<"month" | "week">("month");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [weekStart, setWeekStart] = useState<Date>(startOfWeek(new Date(), { weekStartsOn: 0 }));
  
  // Get venue name map for quick lookup
  const venueMap = useMemo(() => {
    return Object.fromEntries(venues.map(v => [v.id, v.name]));
  }, [venues]);

  // Group events by date
  const eventsByDate = useMemo(() => {
    const map = new Map<string, VenueEvent[]>();
    
    events.forEach(event => {
      const date = format(new Date(event.start_time), 'yyyy-MM-dd');
      if (!map.has(date)) {
        map.set(date, []);
      }
      map.get(date)?.push(event);
    });
    
    return map;
  }, [events]);

  // Handle day render in the month view
  const dayRenderer = (day: Date) => {
    const dateKey = format(day, 'yyyy-MM-dd');
    const dayEvents = eventsByDate.get(dateKey) || [];
    
    return (
      <div className="h-full w-full">
        <time dateTime={dateKey}>{format(day, 'd')}</time>
        {dayEvents.length > 0 && (
          <div className="mt-1 max-h-[80px] overflow-auto text-xs space-y-1">
            {dayEvents.map((event) => (
              <div 
                key={event.id}
                onClick={(e) => {
                  e.stopPropagation();
                  onEditEvent(event);
                }}
                className="px-1 py-0.5 rounded cursor-pointer truncate"
                style={{ backgroundColor: getVenueColor(event.venue_id, 0.7) }}
              >
                {event.title}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // Generate days for week view
  const weekDays = useMemo(() => {
    return eachDayOfInterval({
      start: weekStart,
      end: endOfWeek(weekStart, { weekStartsOn: 0 })
    });
  }, [weekStart]);

  // Navigate between weeks
  const prevWeek = () => setWeekStart(subWeeks(weekStart, 1));
  const nextWeek = () => setWeekStart(addWeeks(weekStart, 1));
  const currentWeek = () => setWeekStart(startOfWeek(new Date(), { weekStartsOn: 0 }));

  return (
    <div className="bg-white shadow rounded p-4">
      <div className="flex justify-between items-center mb-4">
        <ToggleGroup type="single" value={viewType} onValueChange={(value) => value && setViewType(value as "month" | "week")}>
          <ToggleGroupItem value="month" aria-label="Month view">
            <CalendarDays className="h-4 w-4" />
            <span className="ml-2">Month</span>
          </ToggleGroupItem>
          <ToggleGroupItem value="week" aria-label="Week view">
            <List className="h-4 w-4" />
            <span className="ml-2">Week</span>
          </ToggleGroupItem>
        </ToggleGroup>
        
        {/* Legend for venue colors */}
        <div className="flex items-center space-x-2">
          {venues.map(venue => (
            <Badge 
              key={venue.id} 
              style={{ backgroundColor: getVenueColor(venue.id) }} 
              className="text-xs"
            >
              {venue.name}
            </Badge>
          ))}
        </div>
      </div>

      {viewType === "month" ? (
        <div onClick={(e) => e.stopPropagation()}>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(date) => {
              if (date) {
                setSelectedDate(date);
                onCreateEvent(date);
              }
            }}
            className="rounded border"
            components={{
              Day: ({ day, ...props }) => (
                <div
                  {...props}
                  className={cn(
                    "h-14 w-full p-1 relative",
                    props.className
                  )}
                >
                  {dayRenderer(day)}
                </div>
              ),
            }}
          />
          <div className="mt-2 text-center text-sm text-muted-foreground">
            Click on any day to create a new event
          </div>
        </div>
      ) : (
        <div className="border rounded">
          <div className="flex justify-between items-center p-2 border-b">
            <Button variant="outline" size="sm" onClick={prevWeek}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="font-medium">
              {format(weekStart, 'MMM d')} - {format(endOfWeek(weekStart, { weekStartsOn: 0 }), 'MMM d, yyyy')}
            </div>
            <div className="space-x-1">
              <Button variant="outline" size="sm" onClick={currentWeek}>
                Today
              </Button>
              <Button variant="outline" size="sm" onClick={nextWeek}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-7 border-b">
            {weekDays.map((day) => (
              <div key={day.toString()} className="p-2 text-center border-r last:border-r-0">
                <div className="font-medium">{format(day, 'EEE')}</div>
                <div className="text-sm">{format(day, 'd')}</div>
              </div>
            ))}
          </div>
          
          <div className="grid grid-cols-7 h-96 overflow-y-auto">
            {weekDays.map((day) => {
              const dateKey = format(day, 'yyyy-MM-dd');
              const dayEvents = eventsByDate.get(dateKey) || [];
              
              return (
                <div 
                  key={day.toString()} 
                  className="p-2 border-r last:border-r-0 min-h-full"
                  onClick={() => onCreateEvent(day)}
                >
                  <div className="space-y-1">
                    {dayEvents.map((event) => (
                      <div 
                        key={event.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditEvent(event);
                        }}
                        className="p-2 rounded cursor-pointer text-sm"
                        style={{ backgroundColor: getVenueColor(event.venue_id, 0.7) }}
                      >
                        <div className="font-medium truncate">{event.title}</div>
                        <div className="text-xs">
                          {format(new Date(event.start_time), 'h:mm a')} - {format(new Date(event.end_time), 'h:mm a')}
                        </div>
                        <div className="text-xs truncate">
                          {venueMap[event.venue_id] || 'Unknown venue'}
                        </div>
                      </div>
                    ))}
                    {dayEvents.length === 0 && (
                      <div className="text-center text-sm text-muted-foreground h-full flex items-center justify-center">
                        <div>Click to add event</div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default EventsCalendarView;

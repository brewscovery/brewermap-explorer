import React, { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { CalendarDays, List, ChevronLeft, ChevronRight } from "lucide-react";
import { VenueEvent } from "@/hooks/useVenueEvents";
import { 
  format, 
  startOfWeek, 
  endOfWeek, 
  startOfMonth,
  endOfMonth,
  eachDayOfInterval, 
  isSameDay, 
  addWeeks, 
  subWeeks,
  addMonths,
  subMonths,
  isToday,
  isSameMonth,
  parseISO
} from "date-fns";
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

const getVenueColor = (venueId: string, alpha: number = 1, isPublished: boolean = true): string => {
  const hash = venueId.split('').reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc);
  }, 0);
  
  const h = Math.abs(hash % 360);
  const finalAlpha = isPublished ? alpha : alpha * 0.6;
  return `hsla(${h}, 70%, 65%, ${finalAlpha})`;
};

const EventsCalendarView: React.FC<EventsCalendarViewProps> = ({
  events,
  venues,
  onEditEvent,
  onDeleteEvent,
  onCreateEvent,
}) => {
  const [viewType, setViewType] = useState<"month" | "week">("month");
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [weekStart, setWeekStart] = useState<Date>(startOfWeek(new Date(), { weekStartsOn: 0 }));

  const venueMap = useMemo(() => {
    return Object.fromEntries(venues.map(v => [v.id, v.name]));
  }, [venues]);

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

  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevWeek = () => setWeekStart(subWeeks(weekStart, 1));
  const nextWeek = () => setWeekStart(addWeeks(weekStart, 1));
  const goToToday = () => {
    setCurrentDate(new Date());
    setWeekStart(startOfWeek(new Date(), { weekStartsOn: 0 }));
  };

  const monthDays = useMemo(() => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
    
    return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  }, [currentDate]);

  const monthWeeks = useMemo(() => {
    const weeks = [];
    let week = [];
    
    for (let i = 0; i < monthDays.length; i++) {
      week.push(monthDays[i]);
      
      if (week.length === 7) {
        weeks.push(week);
        week = [];
      }
    }
    
    return weeks;
  }, [monthDays]);

  const weekDays = useMemo(() => {
    return eachDayOfInterval({
      start: weekStart,
      end: endOfWeek(weekStart, { weekStartsOn: 0 })
    });
  }, [weekStart]);

  const renderMonthEvent = (event: VenueEvent, isFirst: boolean, isLast: boolean, dayEvents: VenueEvent[]) => {
    const startTime = parseISO(event.start_time);
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

  const renderMonthView = () => {
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
                          onClick={(e) => {
                            e.stopPropagation();
                            // Could show a modal with all events in the future
                          }}
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

  const renderWeekView = () => {
    return (
      <div className="border rounded">
        <div className="flex justify-between items-center p-2 border-b">
          <Button variant="outline" size="sm" onClick={prevWeek}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="font-medium">
            {format(weekStart, 'MMM d')} - {format(endOfWeek(weekStart, { weekStartsOn: 0 }), 'MMM d, yyyy')}
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
        
        <div className="grid grid-cols-7 border-b">
          {weekDays.map((day) => (
            <div key={day.toString()} className={cn(
              "p-2 text-center border-r last:border-r-0",
              isToday(day) && "bg-muted/30 font-bold"
            )}>
              <div className="font-medium">{format(day, 'EEE')}</div>
              <div className={cn(
                "text-sm",
                isToday(day) && "bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center mx-auto"
              )}>
                {format(day, 'd')}
              </div>
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
                className={cn(
                  "p-2 border-r last:border-r-0 min-h-full",
                  isToday(day) && "bg-muted/20"
                )}
                onClick={() => onCreateEvent(day)}
              >
                <div className="space-y-1">
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
                          "p-2 rounded cursor-pointer text-sm relative group",
                          !event.is_published && "italic"
                        )}
                        style={{ 
                          backgroundColor: getVenueColor(event.venue_id, 0.7, event.is_published),
                          borderLeft: `3px solid ${getVenueColor(event.venue_id, 1, event.is_published)}` 
                        }}
                      >
                        <div className="font-medium truncate">{eventTitle}</div>
                        <div className="text-xs">
                          {format(new Date(event.start_time), 'h:mm a')} - {format(new Date(event.end_time), 'h:mm a')}
                        </div>
                        <div className="text-xs truncate">
                          {venueMap[event.venue_id] || 'Unknown venue'}
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
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
    );
  };

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
        
        <div className="flex flex-wrap items-center gap-2 max-w-[60%]">
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

      {viewType === "month" ? renderMonthView() : renderWeekView()}
      
      <div className="mt-2 text-center text-sm text-muted-foreground">
        Click on any day to create a new event
      </div>
    </div>
  );
};

export default EventsCalendarView;

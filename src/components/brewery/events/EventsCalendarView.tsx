
import React, { useState, useMemo } from "react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { CalendarDays, List } from "lucide-react";
import { VenueEvent } from "@/hooks/useVenueEvents";
import { Badge } from "@/components/ui/badge";
import { 
  format, 
  startOfWeek, 
  endOfWeek, 
  startOfMonth,
  endOfMonth,
  eachDayOfInterval, 
  addWeeks, 
  subWeeks,
  addMonths,
  subMonths,
} from "date-fns";
import { getVenueColor } from "./utils/calendarViewUtils";
import MonthView from "./MonthView";
import WeekView from "./WeekView";

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

  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevWeek = () => setWeekStart(subWeeks(weekStart, 1));
  const nextWeek = () => setWeekStart(addWeeks(weekStart, 1));
  const goToToday = () => {
    setCurrentDate(new Date());
    setWeekStart(startOfWeek(new Date(), { weekStartsOn: 0 }));
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

      {viewType === "month" ? (
        <MonthView
          currentDate={currentDate}
          monthDays={monthDays}
          monthWeeks={monthWeeks}
          eventsByDate={eventsByDate}
          venueMap={venueMap}
          onCreateEvent={onCreateEvent}
          onEditEvent={onEditEvent}
          goToToday={goToToday}
          prevMonth={prevMonth}
          nextMonth={nextMonth}
        />
      ) : (
        <WeekView
          weekStart={weekStart}
          weekDays={weekDays}
          eventsByDate={eventsByDate}
          venueMap={venueMap}
          onCreateEvent={onCreateEvent}
          onEditEvent={onEditEvent}
          onDeleteEvent={onDeleteEvent}
          goToToday={goToToday}
          prevWeek={prevWeek}
          nextWeek={nextWeek}
        />
      )}
      
      <div className="mt-2 text-center text-sm text-muted-foreground">
        Click on any day to create a new event
      </div>
    </div>
  );
};

export default EventsCalendarView;

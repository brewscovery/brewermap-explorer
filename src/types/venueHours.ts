
export interface VenueHour {
  id: string;
  venue_id: string;
  day_of_week: number;
  venue_open_time: string | null;
  venue_close_time: string | null;
  kitchen_open_time: string | null;
  kitchen_close_time: string | null;
  is_closed: boolean;
  created_at: string;
  updated_at: string;
}

export const DAYS_OF_WEEK = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday'
];


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
  updated_by: string | null;
}

// Days of week array (0 = Monday, 6 = Sunday)
// This matches the database storage format
export const DAYS_OF_WEEK = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday'
];

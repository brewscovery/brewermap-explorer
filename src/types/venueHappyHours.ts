
/**
 * VenueHappyHour represents a happy hour record from the database
 */
export interface VenueHappyHour {
  id: string;
  venue_id: string;
  day_of_week: number;
  start_time: string | null;
  end_time: string | null;
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Interface for creating or updating a happy hour - requires day_of_week
 */
export interface VenueHappyHourInput {
  id?: string;
  venue_id: string;
  day_of_week: number;
  start_time?: string | null;
  end_time?: string | null;
  description?: string | null;
  is_active?: boolean;
  updated_at?: string;
}

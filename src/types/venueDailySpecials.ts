
/**
 * VenueDailySpecial represents a daily special record from the database
 */
export interface VenueDailySpecial {
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
 * Interface for creating or updating a daily special - requires day_of_week
 */
export interface VenueDailySpecialInput {
  id?: string;
  venue_id: string;
  day_of_week: number;
  start_time?: string | null;
  end_time?: string | null;
  description?: string | null;
  is_active?: boolean;
  updated_at?: string;
}

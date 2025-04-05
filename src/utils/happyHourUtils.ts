
import type { VenueHappyHour, VenueHappyHourInput } from '@/types/venueHappyHours';
import { formatTimeForDatabase } from '@/utils/dateTimeUtils';

/**
 * Categorizes happy hours into records to update and records to insert based on existing data
 */
export const categorizeHappyHours = (
  venueId: string,
  happyHoursData: Partial<VenueHappyHour>[],
  existingHappyHours: VenueHappyHour[]
): {
  recordsToUpdate: VenueHappyHourInput[];
  recordsToInsert: VenueHappyHourInput[];
  idsToDelete: string[];
} => {
  // Map existing happy hours to a lookup object by day_of_week
  const existingHappyHoursByDay = new Map<number, VenueHappyHour>();
  existingHappyHours.forEach(hour => {
    existingHappyHoursByDay.set(hour.day_of_week, hour);
  });
  
  // Process each happy hour record to determine if it's new or existing
  const recordsToUpdate: VenueHappyHourInput[] = [];
  const recordsToInsert: VenueHappyHourInput[] = [];
  
  for (const hour of happyHoursData) {
    if (typeof hour.day_of_week !== 'number') {
      console.error(`Missing required day_of_week for happy hour:`, hour);
      throw new Error(`Missing required field 'day_of_week' for happy hour`);
    }
    
    // Check if we have an existing record for this day
    const existingHour = existingHappyHoursByDay.get(hour.day_of_week);
    
    // Format time strings for database
    const formattedStartTime = formatTimeForDatabase(hour.start_time);
    const formattedEndTime = formatTimeForDatabase(hour.end_time);
    
    const record: VenueHappyHourInput = {
      venue_id: venueId,
      day_of_week: hour.day_of_week,
      start_time: formattedStartTime,
      end_time: formattedEndTime,
      description: hour.description,
      is_active: hour.is_active !== undefined ? hour.is_active : true,
      updated_at: new Date().toISOString()
    };
    
    if (existingHour) {
      // This is an update to an existing record
      recordsToUpdate.push({
        ...record,
        id: existingHour.id
      });
    } else {
      // This is a new record
      recordsToInsert.push(record);
    }
  }

  // Find happy hours that exist in the database but aren't in the updated data
  // (these need to be deleted)
  const daysInUpdate = new Set(happyHoursData.map(hour => hour.day_of_week));
  const happyHoursToDelete = existingHappyHours.filter(hour => !daysInUpdate.has(hour.day_of_week));
  const idsToDelete = happyHoursToDelete.map(hour => hour.id);
  
  return {
    recordsToUpdate,
    recordsToInsert,
    idsToDelete
  };
};


import type { VenueDailySpecial, VenueDailySpecialInput } from '@/types/venueDailySpecials';
import { formatTimeForDatabase } from '@/utils/dateTimeUtils';

/**
 * Categorizes daily specials into records to update and records to insert based on existing data
 */
export const categorizeDailySpecials = (
  venueId: string,
  dailySpecialsData: Partial<VenueDailySpecial>[],
  existingDailySpecials: VenueDailySpecial[]
): {
  recordsToUpdate: VenueDailySpecialInput[];
  recordsToInsert: VenueDailySpecialInput[];
  idsToDelete: string[];
} => {
  // Map existing daily specials to a lookup object by day_of_week
  const existingDailySpecialsByDay = new Map<number, VenueDailySpecial>();
  existingDailySpecials.forEach(special => {
    existingDailySpecialsByDay.set(special.day_of_week, special);
  });
  
  // Process each daily special record to determine if it's new or existing
  const recordsToUpdate: VenueDailySpecialInput[] = [];
  const recordsToInsert: VenueDailySpecialInput[] = [];
  
  for (const special of dailySpecialsData) {
    if (typeof special.day_of_week !== 'number') {
      console.error(`Missing required day_of_week for daily special:`, special);
      throw new Error(`Missing required field 'day_of_week' for daily special`);
    }
    
    // Check if we have an existing record for this day
    const existingSpecial = existingDailySpecialsByDay.get(special.day_of_week);
    
    // Format time strings for database
    const formattedStartTime = formatTimeForDatabase(special.start_time);
    const formattedEndTime = formatTimeForDatabase(special.end_time);
    
    const record: VenueDailySpecialInput = {
      venue_id: venueId,
      day_of_week: special.day_of_week,
      start_time: formattedStartTime,
      end_time: formattedEndTime,
      description: special.description,
      is_active: special.is_active !== undefined ? special.is_active : true,
      updated_at: new Date().toISOString()
    };
    
    if (existingSpecial) {
      // This is an update to an existing record
      recordsToUpdate.push({
        ...record,
        id: existingSpecial.id
      });
    } else {
      // This is a new record
      recordsToInsert.push(record);
    }
  }

  // Find daily specials that exist in the database but aren't in the updated data
  // (these need to be deleted)
  const daysInUpdate = new Set(dailySpecialsData.map(special => special.day_of_week));
  const dailySpecialsToDelete = existingDailySpecials.filter(special => !daysInUpdate.has(special.day_of_week));
  const idsToDelete = dailySpecialsToDelete.map(special => special.id);
  
  return {
    recordsToUpdate,
    recordsToInsert,
    idsToDelete
  };
};

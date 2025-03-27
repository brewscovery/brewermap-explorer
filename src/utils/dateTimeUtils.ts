
/**
 * Utility functions for date and time formatting
 */

/**
 * Formats a time string from 24-hour format to 12-hour format with AM/PM
 * @param time Time string in format "HH:MM"
 * @returns Formatted time string or "Closed" if null
 */
export const formatTime = (time: string | null): string => {
  if (!time) return 'Closed';
  
  try {
    // Convert 24-hour time string to 12-hour time with AM/PM
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const formattedHour = hour % 12 || 12; // Convert 0 to 12 for 12 AM
    
    return `${formattedHour}:${minutes} ${ampm}`;
  } catch (e) {
    console.error('Error formatting time:', e);
    return time;
  }
};

/**
 * Gets the day of week index for today (0 = Sunday, 6 = Saturday)
 * @returns Today's day of week index
 */
export const getTodayDayOfWeek = (): number => {
  return new Date().getDay();
};

/**
 * Sorts an array of venue hours so that today's day appears first,
 * followed by the rest of the week in order
 * @param hours Array of venue hours with day_of_week property
 * @returns Sorted array with today first, then the rest in order
 */
export const sortHoursStartingWithToday = <T extends { day_of_week: number }>(hours: T[]): T[] => {
  if (!hours.length) return hours;
  
  const todayIndex = getTodayDayOfWeek();
  
  return [...hours].sort((a, b) => {
    // Calculate distance from today for each day (0 = today, 1 = tomorrow, etc.)
    const distanceA = (a.day_of_week - todayIndex + 7) % 7;
    const distanceB = (b.day_of_week - todayIndex + 7) % 7;
    
    // Sort by distance from today
    return distanceA - distanceB;
  });
};

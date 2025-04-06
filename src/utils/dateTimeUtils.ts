
/**
 * Format a time string from database format (HH:MM:SS) to display format (h:MM AM/PM)
 */
export const formatTime = (timeString: string | null): string => {
  if (!timeString) return '';
  
  // Parse the time string (expected format: "HH:MM:SS")
  const [hours, minutes] = timeString.split(':').map(Number);
  
  // Convert to 12-hour format
  const period = hours >= 12 ? 'PM' : 'AM';
  const hours12 = hours % 12 || 12; // Convert 0 to 12 for 12 AM
  
  // Format and return the time
  return `${hours12}:${minutes.toString().padStart(2, '0')} ${period}`;
};

/**
 * Get the current day of week (0 = Monday, 6 = Sunday)
 * Note: JavaScript's getDay() returns 0 for Sunday, 1 for Monday, etc.
 * But our application uses 0 for Monday, 6 for Sunday
 */
export const getTodayDayOfWeek = (): number => {
  const jsDay = new Date().getDay(); // 0 = Sunday, 1 = Monday, etc.
  // Convert JS day (0-6, Sunday-Saturday) to our format (0-6, Monday-Sunday)
  return jsDay === 0 ? 6 : jsDay - 1;
};

/**
 * Sort hours array to start with today's day
 */
export const sortHoursStartingWithToday = (hours: any[]): any[] => {
  const today = getTodayDayOfWeek();
  
  return [...hours].sort((a, b) => {
    const aDiff = (a.day_of_week - today + 7) % 7;
    const bDiff = (b.day_of_week - today + 7) % 7;
    return aDiff - bDiff;
  });
};

/**
 * Convert database time format (HH:MM:SS) to form input format (HH:MM)
 */
export const formatTimeForForm = (timeString: string | null): string => {
  if (!timeString) return '';
  
  // If the time already has seconds, remove them
  if (timeString.includes(':')) {
    const parts = timeString.split(':');
    if (parts.length >= 2) {
      return `${parts[0]}:${parts[1]}`;
    }
  }
  
  return timeString;
};

/**
 * Ensure time string is in proper format for database (HH:MM:SS)
 */
export const formatTimeForDatabase = (timeString: string | null): string | null => {
  if (!timeString) return null;
  
  // If the time already has seconds, return as is
  if (timeString.match(/^\d{2}:\d{2}:\d{2}$/)) {
    return timeString;
  }
  
  // If the time has hours and minutes but no seconds, add :00 for seconds
  if (timeString.match(/^\d{2}:\d{2}$/)) {
    return `${timeString}:00`;
  }
  
  // Return null for invalid formats
  if (!timeString.match(/^\d{2}:\d{2}$/)) {
    console.warn(`Invalid time format: ${timeString}`);
    return null;
  }
  
  return timeString;
};

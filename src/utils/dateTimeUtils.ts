
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
  const day = new Date().getDay(); // 0 = Sunday, 1 = Monday, etc.
  return day === 0 ? 6 : day - 1; // Convert to 0 = Monday, 6 = Sunday
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

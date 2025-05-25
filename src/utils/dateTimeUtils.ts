
/**
 * Format a time string from database format (HH:MM:SS) to display format using device locale
 */
export const formatTime = (timeString: string | null): string => {
  if (!timeString) return '';
  
  // Parse the time string (expected format: "HH:MM:SS")
  const [hours, minutes] = timeString.split(':').map(Number);
  
  // Create a date object for today with the specified time
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  
  // Use device locale for time formatting
  return date.toLocaleTimeString([], { 
    hour: 'numeric', 
    minute: '2-digit',
    hour12: undefined // Let the locale decide 12/24 hour format
  });
};

/**
 * Format a date using device locale
 */
export const formatDate = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  return dateObj.toLocaleDateString([], {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

/**
 * Format date and time together using device locale
 */
export const formatDateTime = (datetime: Date | string): string => {
  const dateObj = typeof datetime === 'string' ? new Date(datetime) : datetime;
  
  return dateObj.toLocaleString([], {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: undefined // Let the locale decide 12/24 hour format
  });
};

/**
 * Get the current day of week (0 = Monday, 6 = Sunday)
 * This matches our database storage format and DAYS_OF_WEEK array indexing
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

/**
 * Check if a venue is currently open based on its hours
 * @returns Object with status information
 */
export const getVenueOpenStatus = (venueHours: any[]) => {
  if (!venueHours || venueHours.length === 0) {
    return { isOpen: false, statusText: "No hours available" };
  }

  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const todayIndex = getTodayDayOfWeek();
  
  // Find today's hours
  const todayHours = venueHours.find(h => h.day_of_week === todayIndex);
  
  if (!todayHours) {
    return { isOpen: false, statusText: "Hours not available for today" };
  }
  
  if (todayHours.is_closed) {
    return { isOpen: false, statusText: "Closed today", nextOpenInfo: getNextOpeningInfo(venueHours, todayIndex) };
  }
  
  // Parse venue hours
  const venueOpenTime = parseTimeString(todayHours.venue_open_time);
  const venueCloseTime = parseTimeString(todayHours.venue_close_time);
  
  if (!venueOpenTime || !venueCloseTime) {
    return { isOpen: false, statusText: "Invalid hours" };
  }
  
  // Current time in minutes since midnight
  const currentTimeInMinutes = currentHour * 60 + currentMinute;
  
  // Check if venue is open now
  if (currentTimeInMinutes >= venueOpenTime && currentTimeInMinutes < venueCloseTime) {
    // Calculate closing in X hours/minutes
    const minutesUntilClose = venueCloseTime - currentTimeInMinutes;
    const closingText = formatTimeRemaining(minutesUntilClose, "Closes");
    
    return { 
      isOpen: true, 
      statusText: `Open now · ${closingText}`,
      closingTime: formatTime(todayHours.venue_close_time)
    };
  } else {
    // Venue is closed now
    return { 
      isOpen: false, 
      statusText: "Closed now",
      nextOpenInfo: getNextOpeningInfo(venueHours, todayIndex, currentTimeInMinutes)
    };
  }
};

/**
 * Check if a kitchen is currently open based on venue hours
 * @returns Object with status information
 */
export const getKitchenOpenStatus = (venueHours: any[]) => {
  if (!venueHours || venueHours.length === 0) {
    return { isOpen: false, statusText: "No hours available" };
  }

  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const todayIndex = getTodayDayOfWeek();
  
  // Find today's hours
  const todayHours = venueHours.find(h => h.day_of_week === todayIndex);
  
  if (!todayHours) {
    return { isOpen: false, statusText: "Hours not available for today" };
  }
  
  if (todayHours.is_closed) {
    return { isOpen: false, statusText: "Closed today" };
  }
  
  // Check if kitchen hours are available
  if (!todayHours.kitchen_open_time || !todayHours.kitchen_close_time) {
    return { isOpen: false, statusText: "Kitchen closed today" };
  }
  
  // Parse kitchen hours
  const kitchenOpenTime = parseTimeString(todayHours.kitchen_open_time);
  const kitchenCloseTime = parseTimeString(todayHours.kitchen_close_time);
  
  if (!kitchenOpenTime || !kitchenCloseTime) {
    return { isOpen: false, statusText: "Invalid kitchen hours" };
  }
  
  // Current time in minutes since midnight
  const currentTimeInMinutes = currentHour * 60 + currentMinute;
  
  // Check if kitchen is open now
  if (currentTimeInMinutes >= kitchenOpenTime && currentTimeInMinutes < kitchenCloseTime) {
    // Calculate closing in X hours/minutes
    const minutesUntilClose = kitchenCloseTime - currentTimeInMinutes;
    const closingText = formatTimeRemaining(minutesUntilClose, "Closes");
    
    return { 
      isOpen: true, 
      statusText: `Open now · ${closingText}`,
      closingTime: formatTime(todayHours.kitchen_close_time)
    };
  } else {
    // Kitchen is closed now
    return { 
      isOpen: false, 
      statusText: "Closed now",
      nextOpenInfo: getNextKitchenOpeningInfo(venueHours, todayIndex, currentTimeInMinutes)
    };
  }
};

/**
 * Helper function to parse time string into minutes since midnight
 */
const parseTimeString = (timeString: string | null): number | null => {
  if (!timeString) return null;
  
  const [hours, minutes] = timeString.split(':').map(Number);
  return hours * 60 + minutes;
};

/**
 * Get information about when the venue will next be open
 */
const getNextOpeningInfo = (venueHours: any[], todayIndex: number, currentTimeInMinutes?: number) => {
  // Sort hours starting with today
  const sortedHours = sortHoursStartingWithToday(venueHours);
  
  // Find today's hours
  const todayHours = sortedHours[0];
  
  // If the venue is closed today, check the next day
  if (todayHours.is_closed || !todayHours.venue_open_time) {
    // Find the next day that's open
    for (let i = 1; i < sortedHours.length; i++) {
      const nextDay = sortedHours[i];
      if (!nextDay.is_closed && nextDay.venue_open_time) {
        const dayName = getDayName(nextDay.day_of_week);
        return { 
          day: dayName, 
          time: formatTime(nextDay.venue_open_time),
          isToday: false
        };
      }
    }
    return { day: "Unknown", time: "", isToday: false };
  }
  
  // If it's today but we haven't opened yet
  if (currentTimeInMinutes && parseTimeString(todayHours.venue_open_time)! > currentTimeInMinutes) {
    return {
      day: "Today",
      time: formatTime(todayHours.venue_open_time),
      isToday: true
    };
  }
  
  // If we're closed now but open earlier today, check the next day
  for (let i = 1; i < sortedHours.length; i++) {
    const nextDay = sortedHours[i];
    if (!nextDay.is_closed && nextDay.venue_open_time) {
      const dayName = getDayName(nextDay.day_of_week);
      return { 
        day: dayName, 
        time: formatTime(nextDay.venue_open_time),
        isToday: false
      };
    }
  }
  
  return { day: "Unknown", time: "", isToday: false };
};

/**
 * Get information about when the kitchen will next be open
 */
const getNextKitchenOpeningInfo = (venueHours: any[], todayIndex: number, currentTimeInMinutes?: number) => {
  // Sort hours starting with today
  const sortedHours = sortHoursStartingWithToday(venueHours);
  
  // Find today's hours
  const todayHours = sortedHours[0];
  
  // If the venue is closed today or kitchen hours aren't available, check the next day
  if (todayHours.is_closed || !todayHours.kitchen_open_time) {
    // Find the next day that has kitchen hours
    for (let i = 1; i < sortedHours.length; i++) {
      const nextDay = sortedHours[i];
      if (!nextDay.is_closed && nextDay.kitchen_open_time) {
        const dayName = getDayName(nextDay.day_of_week);
        return { 
          day: dayName, 
          time: formatTime(nextDay.kitchen_open_time),
          isToday: false
        };
      }
    }
    return { day: "Unknown", time: "", isToday: false };
  }
  
  // If it's today but kitchen hasn't opened yet
  if (currentTimeInMinutes && parseTimeString(todayHours.kitchen_open_time)! > currentTimeInMinutes) {
    return {
      day: "Today",
      time: formatTime(todayHours.kitchen_open_time),
      isToday: true
    };
  }
  
  // If kitchen is closed now but was open earlier today, check the next day
  for (let i = 1; i < sortedHours.length; i++) {
    const nextDay = sortedHours[i];
    if (!nextDay.is_closed && nextDay.kitchen_open_time) {
      const dayName = getDayName(nextDay.day_of_week);
      return { 
        day: dayName, 
        time: formatTime(nextDay.kitchen_open_time),
        isToday: false
      };
    }
  }
  
  return { day: "Unknown", time: "", isToday: false };
};

/**
 * Helper to get day name
 */
const getDayName = (dayIndex: number): string => {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  return days[dayIndex];
};

/**
 * Format time remaining in a human-readable string
 */
const formatTimeRemaining = (minutesRemaining: number, prefix: string): string => {
  if (minutesRemaining < 60) {
    return `${prefix} in ${minutesRemaining} min`;
  } else {
    const hours = Math.floor(minutesRemaining / 60);
    const minutes = minutesRemaining % 60;
    if (minutes === 0) {
      return `${prefix} in ${hours} hr`;
    } else {
      return `${prefix} in ${hours} hr ${minutes} min`;
    }
  }
};

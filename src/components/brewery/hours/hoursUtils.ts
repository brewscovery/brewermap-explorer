
/**
 * Generate an array of hour options for the time selectors
 */
export const generateHourOptions = () => {
  return Array.from({ length: 24 }, (_, i) => {
    const hour = i % 12 || 12;
    const ampm = i < 12 ? 'AM' : 'PM';
    return { value: `${i.toString().padStart(2, '0')}:00`, label: `${hour}:00 ${ampm}` };
  });
};

/**
 * Format a time string from database format for form display
 * @param time Time string (HH:MM:SS)
 * @returns Formatted time string (HH:MM)
 */
export const formatTimeForForm = (time: string | null) => {
  if (!time) return null;
  return time.substring(0, 5); // Convert "HH:MM:SS" to "HH:MM"
};

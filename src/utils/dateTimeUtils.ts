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

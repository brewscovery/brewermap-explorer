
// Add generateHourOptions function if it doesn't exist already
export const formatTimeForForm = (timeString: string | null): string | null => {
  if (!timeString) return null;
  
  // Format time string from "HH:MM:SS" to "HH:MM" for form inputs
  return timeString.slice(0, 5);
};

export const generateHourOptions = () => {
  const hours = [];
  for (let i = 0; i < 24; i++) {
    for (let j = 0; j < 60; j += 30) {
      const hour = i.toString().padStart(2, '0');
      const minute = j.toString().padStart(2, '0');
      const time = `${hour}:${minute}`;
      hours.push({
        value: time,
        label: time
      });
    }
  }
  return hours;
};

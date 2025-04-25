
import { VenueEvent } from "@/hooks/useVenueEvents";

export const getVenueColor = (venueId: string, alpha: number = 1, isPublished: boolean = true): string => {
  const hash = venueId.split('').reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc);
  }, 0);
  
  const h = Math.abs(hash % 360);
  const finalAlpha = isPublished ? alpha : alpha * 0.6;
  return `hsla(${h}, 70%, 65%, ${finalAlpha})`;
};


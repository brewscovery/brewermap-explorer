
import type { VenueEvent } from "@/hooks/useVenueEvents";

export interface Venue {
  id: string;
  name: string;
}

export interface EventsTableProps {
  venueIds: string[];
  venues: Venue[];
}

export interface EventRowProps {
  event: VenueEvent;
  venueMap: Record<string, string>;
  onEdit: () => void;
  onDelete: () => void;
}

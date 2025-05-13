
export interface Venue {
  id: string;
  brewery_id: string;
  name: string;
  street: string | null;
  city: string;
  state: string;
  postal_code: string | null;
  country: string | null;
  longitude: string | null;
  latitude: string | null;
  phone: string | null;
  website_url?: string | null;
  created_at: string;
  updated_at: string;
}

export interface VenueEvent {
  id: string;
  venue_id: string;
  title: string;
  description: string | null;
  start_time: string;
  end_time: string;
  created_at: string;
  updated_at: string;
  max_attendees: number | null;
  is_published: boolean;
  ticket_price: number | null;
  ticket_url: string | null;
  venue_name?: string;
  categories?: string[];
  start_date?: string;
  end_date?: string;
}

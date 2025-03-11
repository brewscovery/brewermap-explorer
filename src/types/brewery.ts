
export interface Brewery {
  id: string;
  name: string;
  brewery_type: string | null;
  street: string | null;
  city: string;
  state: string;
  postal_code: string | null;
  country: string | null;
  longitude: string | null;
  latitude: string | null;
  phone: string | null;
  website_url: string | null;
  created_at: string;
  updated_at: string;
}

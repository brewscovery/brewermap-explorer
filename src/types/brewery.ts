
export interface Brewery {
  id: string;
  name: string;
  brewery_type: string | null;
  website_url: string | null;
  about: string | null;
  facebook_url: string | null;
  instagram_url: string | null;
  logo_url: string | null;
  created_at: string;
  updated_at: string;
  is_verified: boolean | null;
  country: string | null;
}

export interface BreweryFormData {
  name: string;
  brewery_type: string | null;
  website_url: string | null;
  about: string | null;
  facebook_url: string | null;
  instagram_url: string | null;
  logo_url: string | null;
  is_verified: boolean;
  country: string | null;
}


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
}

export interface BreweryFormData {
  name: string;
  brewery_type: string;
  website_url: string;
  about: string;
  facebook_url: string;
  instagram_url: string;
  logo_url: string;
  is_verified: boolean;
}

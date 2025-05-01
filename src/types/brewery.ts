
export interface Brewery {
  id: string;
  name: string;
  website_url: string | null;
  about: string | null;
  facebook_url: string | null;
  instagram_url: string | null;
  logo_url: string | null;
  created_at: string;
  updated_at: string;
  is_verified: boolean | null;
  country: string | null;
  is_independent: boolean | null;
}

export interface BreweryFormData {
  name: string;
  website_url: string | null;
  about: string | null;
  facebook_url: string | null;
  instagram_url: string | null;
  logo_url: string | null;
  is_verified: boolean;
  country: string | null;
  is_independent: boolean | null;
}

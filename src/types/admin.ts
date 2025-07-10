
export interface BreweryData {
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
  venue_count: number;
  owner_name: string;
  country: string | null;
  state: string | null;
}

export interface UserData {
  id: string;
  user_type: string;
  first_name: string | null;
  last_name: string | null;
  created_at: string;
}

export interface BreweryClaim {
  id: string;
  brewery_id: string;
  user_id: string;
  brewery_name: string;
  user_name: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  contact_email: string | null;
  contact_phone: string | null;
  admin_notes: string | null;
  decision_at: string | null;
}

export interface AdminStats {
  totalUsers: number;
  totalBreweries: number;
  pendingClaims: number;
}

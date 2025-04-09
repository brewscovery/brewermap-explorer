
// Brewery data type with additional admin fields
export interface BreweryData {
  id: string;
  name: string;
  brewery_type: string | null;
  website_url: string | null;
  about: string | null;
  facebook_url: string | null;
  instagram_url: string | null;
  logo_url: string | null;
  is_verified: boolean | null;
  created_at: string;
  updated_at: string;
  venue_count: number;
  owner_name: string;
}

// User data type for admin panel
export interface UserData {
  id: string;
  user_type: 'admin' | 'business' | 'regular';
  first_name: string | null;
  last_name: string | null;
  created_at: string;
}

// Brewery claim data type
export interface BreweryClaim {
  id: string;
  brewery_id: string;
  brewery_name: string;
  user_id: string;
  user_name: string;
  status: 'pending' | 'approved' | 'rejected';
  contact_email: string | null;
  contact_phone: string | null;
  created_at: string;
  updated_at: string;
  decision_at: string | null;
  admin_notes: string | null;
}

// Admin stats type
export interface AdminStats {
  totalUsers: number;
  totalBreweries: number;
  pendingClaims: number;
}

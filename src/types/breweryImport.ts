export interface BreweryImportData {
  id: string; // Temporary ID for table operations
  name: string;
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode?: string;
  phone?: string;
  webPage?: string;
  isIndependent?: boolean;
  selected: boolean;
  existingStatus: 'new' | 'has_venues' | 'no_venues';
  errors?: string[];
}

export interface BreweryImportResult {
  success: boolean;
  name: string;
  brewery?: any;
  venue?: any;
  error?: string;
}

export interface FileParseResult {
  data: BreweryImportData[];
  errors: string[];
}

export interface AddressSuggestion {
  fullAddress: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  longitude: string | null;
  latitude: string | null;
}

export interface AddressInputProps {
  value?: string;
  onChange: (address: AddressSuggestion | null) => void;
  onInputChange?: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  defaultValue?: string;
  className?: string;
}

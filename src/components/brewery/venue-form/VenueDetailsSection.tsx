
import { Input } from '@/components/ui/input';
import { AddressInput } from '@/components/ui/address-input';
import { RequiredFieldLabel } from '@/components/ui/required-field-label';
import type { AddressSuggestion } from '@/types/address';

interface VenueDetailsSectionProps {
  name: string;
  addressInput: string;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleAddressChange: (suggestion: AddressSuggestion | null) => void;
  onAddressInputChange: (value: string) => void;
}

export const VenueDetailsSection = ({
  name,
  addressInput,
  handleChange,
  handleAddressChange,
  onAddressInputChange
}: VenueDetailsSectionProps) => {
  return (
    <>
      <div className="space-y-2">
        <RequiredFieldLabel htmlFor="name" required>
          Venue Name
        </RequiredFieldLabel>
        <Input
          id="name"
          name="name"
          value={name}
          onChange={handleChange}
          placeholder="Main Taproom"
          required
        />
      </div>
      
      <div className="space-y-2">
        <RequiredFieldLabel htmlFor="address" required>
          Address
        </RequiredFieldLabel>
        <AddressInput 
          value={addressInput}
          onChange={handleAddressChange}
          onInputChange={onAddressInputChange}
          placeholder="123 Brewery St, Portland, OR"
          required
        />
      </div>
    </>
  );
};

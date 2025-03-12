
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { AddressInput } from '@/components/ui/address-input';
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
        <Label htmlFor="name">Venue Name *</Label>
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
        <Label htmlFor="address">Address *</Label>
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


import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface LocationSectionProps {
  city: string;
  state: string;
  postalCode: string;
  country: string;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const LocationSection = ({
  city,
  state,
  postalCode,
  country,
  handleChange
}: LocationSectionProps) => {
  return (
    <>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="city">City *</Label>
          <Input
            id="city"
            name="city"
            value={city}
            onChange={handleChange}
            placeholder="Melbourne"
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="state">State/Province *</Label>
          <Input
            id="state"
            name="state"
            value={state}
            onChange={handleChange}
            placeholder="VIC"
            required
          />
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="postal_code">Postal Code</Label>
          <Input
            id="postal_code"
            name="postal_code"
            value={postalCode}
            onChange={handleChange}
            placeholder="3000"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="country">Country</Label>
          <Input
            id="country"
            name="country"
            value={country}
            onChange={handleChange}
            placeholder="Australia"
          />
        </div>
      </div>
    </>
  );
};

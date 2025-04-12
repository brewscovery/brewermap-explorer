
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { getAllCountries, DEFAULT_COUNTRY } from '@/utils/countryUtils';

// Get all countries for dropdown
const allCountries = getAllCountries();

interface LocationSectionProps {
  city: string;
  state: string;
  postalCode: string;
  country: string;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleCountryChange?: (value: string) => void;
}

export const LocationSection = ({
  city,
  state,
  postalCode,
  country,
  handleChange,
  handleCountryChange
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
          {handleCountryChange ? (
            <Select 
              value={country || DEFAULT_COUNTRY}
              onValueChange={handleCountryChange}
            >
              <SelectTrigger id="country">
                <SelectValue placeholder="Select country" />
              </SelectTrigger>
              <SelectContent className="max-h-[200px] overflow-y-auto">
                {allCountries.map((c) => (
                  <SelectItem key={c.value} value={c.value}>
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <Input
              id="country"
              name="country"
              value={country}
              onChange={handleChange}
              placeholder="Australia"
            />
          )}
        </div>
      </div>
    </>
  );
};

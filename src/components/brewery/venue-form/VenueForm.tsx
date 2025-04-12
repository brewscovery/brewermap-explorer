
import { VenueDetailsSection } from './VenueDetailsSection';
import { LocationSection } from './LocationSection';
import { ContactSection } from './ContactSection';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { AddressSuggestion } from '@/types/address';

interface VenueFormData {
  name: string;
  street: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  phone: string;
  website_url: string;
  [key: string]: any; // Allow for brewery_id and other dynamic properties
}

interface VenueFormProps {
  formData: VenueFormData;
  addressInput: string;
  isSubmitting: boolean;
  submitLabel: string;
  cancelLabel?: string;
  handleSubmit: (e: React.FormEvent) => void;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleAddressChange: (suggestion: AddressSuggestion | null) => void;
  setAddressInput: (value: string) => void;
  handleCountryChange?: (value: string) => void;
  onCancel?: () => void;
}

export const VenueForm = ({
  formData,
  addressInput,
  isSubmitting,
  submitLabel,
  cancelLabel = 'Cancel',
  handleSubmit,
  handleChange,
  handleAddressChange,
  setAddressInput,
  handleCountryChange,
  onCancel
}: VenueFormProps) => {
  return (
    <ScrollArea className="max-h-[calc(100vh-200px)] pr-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <VenueDetailsSection
          name={formData.name}
          addressInput={addressInput}
          handleChange={handleChange}
          handleAddressChange={handleAddressChange}
          onAddressInputChange={setAddressInput}
        />
        
        <LocationSection
          city={formData.city}
          state={formData.state}
          postalCode={formData.postal_code}
          country={formData.country}
          handleChange={handleChange}
          handleCountryChange={handleCountryChange}
        />
        
        <ContactSection
          phone={formData.phone}
          websiteUrl={formData.website_url}
          handleChange={handleChange}
        />
        
        <div className="mt-6 flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              {cancelLabel}
            </Button>
          )}
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Submitting...' : submitLabel}
          </Button>
        </div>
      </form>
    </ScrollArea>
  );
};

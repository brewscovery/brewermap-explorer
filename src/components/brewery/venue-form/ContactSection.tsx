
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface ContactSectionProps {
  phone: string;
  websiteUrl: string;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const ContactSection = ({
  phone,
  websiteUrl,
  handleChange
}: ContactSectionProps) => {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="phone">Phone Number</Label>
        <Input
          id="phone"
          name="phone"
          value={phone}
          onChange={handleChange}
          placeholder="(03) 9123 4567"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="website_url">Website</Label>
        <Input
          id="website_url"
          name="website_url"
          value={websiteUrl}
          onChange={handleChange}
          placeholder="https://example.com"
        />
      </div>
    </>
  );
};

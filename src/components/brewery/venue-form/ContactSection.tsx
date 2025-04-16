
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface ContactSectionProps {
  phone: string;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const ContactSection = ({
  phone,
  handleChange
}: ContactSectionProps) => {
  return (
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
  );
};

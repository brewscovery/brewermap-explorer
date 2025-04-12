
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { UseFormReturn } from "react-hook-form";
import { BreweryFormValues } from "./types";

// Common brewery types
export const breweryTypes = [
  { value: 'micro', label: 'Micro' },
  { value: 'nano', label: 'Nano' },
  { value: 'regional', label: 'Regional' },
  { value: 'brewpub', label: 'Brewpub' },
  { value: 'large', label: 'Large' },
  { value: 'planning', label: 'Planning' },
  { value: 'bar', label: 'Bar' },
  { value: 'contract', label: 'Contract' },
  { value: 'proprietor', label: 'Proprietor' },
  { value: 'closed', label: 'Closed' },
];

// Common countries for breweries
export const commonCountries = [
  { value: 'Australia', label: 'Australia' },
  { value: 'United States', label: 'United States' },
  { value: 'United Kingdom', label: 'United Kingdom' },
  { value: 'Canada', label: 'Canada' },
  { value: 'Germany', label: 'Germany' },
  { value: 'Belgium', label: 'Belgium' },
  { value: 'New Zealand', label: 'New Zealand' },
];

interface BreweryBasicInfoFieldsProps {
  form: UseFormReturn<BreweryFormValues>;
}

const BreweryBasicInfoFields = ({ form }: BreweryBasicInfoFieldsProps) => {
  return (
    <>
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Brewery Name *</FormLabel>
            <FormControl>
              <Input placeholder="Enter brewery name" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="brewery_type"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Brewery Type</FormLabel>
            <Select
              onValueChange={field.onChange}
              defaultValue={field.value || undefined}
              value={field.value || undefined}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select brewery type" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {breweryTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="country"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Country</FormLabel>
            <Select
              onValueChange={field.onChange}
              defaultValue={field.value || undefined}
              value={field.value || undefined}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select country" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {commonCountries.map((country) => (
                  <SelectItem key={country.value} value={country.value}>
                    {country.label}
                  </SelectItem>
                ))}
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="about"
        render={({ field }) => (
          <FormItem>
            <FormLabel>About</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Enter brewery description"
                className="min-h-[120px]"
                {...field}
                value={field.value || ''}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
};

export default BreweryBasicInfoFields;

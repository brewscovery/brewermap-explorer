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
import { getAllCountries, DEFAULT_COUNTRY } from "@/utils/countryUtils";

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

// Get all countries for dropdown
const allCountries = getAllCountries();

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
            <RequiredFieldLabel required>Brewery Name</RequiredFieldLabel>
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
            <RequiredFieldLabel>Brewery Type</RequiredFieldLabel>
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
            <RequiredFieldLabel>Country</RequiredFieldLabel>
            <Select
              onValueChange={field.onChange}
              defaultValue={field.value || DEFAULT_COUNTRY}
              value={field.value || DEFAULT_COUNTRY}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select country" />
                </SelectTrigger>
              </FormControl>
              <SelectContent className="max-h-[200px] overflow-y-auto">
                {allCountries.map((country) => (
                  <SelectItem key={country.value} value={country.value}>
                    {country.label}
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
        name="about"
        render={({ field }) => (
          <FormItem>
            <RequiredFieldLabel>About</RequiredFieldLabel>
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

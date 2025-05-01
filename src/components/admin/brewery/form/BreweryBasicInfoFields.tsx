
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RequiredFieldLabel } from "@/components/ui/required-field-label";
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
        name="country"
        render={({ field }) => (
          <FormItem>
            <RequiredFieldLabel required>Country</RequiredFieldLabel>
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
            <RequiredFieldLabel required>About</RequiredFieldLabel>
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

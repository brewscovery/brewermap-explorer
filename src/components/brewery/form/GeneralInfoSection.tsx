
import React from 'react';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { UseFormReturn } from 'react-hook-form';
import { getAllCountries, DEFAULT_COUNTRY } from '@/utils/countryUtils';
import { UnifiedBreweryFormValues } from '../UnifiedBreweryForm';

// Get all countries for dropdown
const allCountries = getAllCountries();

interface GeneralInfoSectionProps {
  form: UseFormReturn<UnifiedBreweryFormValues>;
}

const GeneralInfoSection = ({ form }: GeneralInfoSectionProps) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">General Information</h3>
      
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Name</FormLabel>
            <FormControl>
              <Input placeholder="Brewery name" {...field} required value={field.value || ''} />
            </FormControl>
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="brewery_type"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Type</FormLabel>
            <FormControl>
              <Input placeholder="micro, brewpub, etc." {...field} value={field.value || ''} />
            </FormControl>
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="country"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Country</FormLabel>
            <FormControl>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value || DEFAULT_COUNTRY}
                value={field.value || DEFAULT_COUNTRY}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select country" />
                </SelectTrigger>
                <SelectContent className="max-h-[200px] overflow-y-auto">
                  {allCountries.map((country) => (
                    <SelectItem key={country.value} value={country.value}>
                      {country.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormControl>
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
                placeholder="Describe your brewery (up to 1000 characters)" 
                className="min-h-[120px]"
                maxLength={1000}
                {...field} 
                value={field.value || ''}
              />
            </FormControl>
          </FormItem>
        )}
      />
    </div>
  );
};

export default GeneralInfoSection;

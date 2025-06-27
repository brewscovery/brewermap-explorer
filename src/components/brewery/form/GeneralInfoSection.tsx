
import React from 'react';
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
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
import { RequiredFieldLabel } from '@/components/ui/required-field-label';
import { UseFormReturn } from 'react-hook-form';
import { getAllCountries, DEFAULT_COUNTRY } from '@/utils/countryUtils';
import { UnifiedBreweryFormValues } from './BreweryFormContent';

// Get all countries for dropdown
const allCountries = getAllCountries();

interface GeneralInfoSectionProps {
  form: UseFormReturn<UnifiedBreweryFormValues>;
}

const GeneralInfoSection = ({ form }: GeneralInfoSectionProps) => {
  const aboutValue = form.watch('about') || '';
  const characterCount = aboutValue.length;
  const maxCharacters = 1000;
  const isOverLimit = characterCount > maxCharacters;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">General Information</h3>
      
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <RequiredFieldLabel required>Name</RequiredFieldLabel>
            <FormControl>
              <Input placeholder="Brewery name" {...field} required value={field.value || ''} />
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
                placeholder="Describe your brewery (up to 1000 characters)" 
                className="min-h-[120px]"
                maxLength={1000}
                {...field} 
                value={field.value || ''}
              />
            </FormControl>
            <div className={`text-sm mt-1 ${isOverLimit ? 'text-red-500' : 'text-muted-foreground'}`}>
              Used {characterCount}/{maxCharacters} characters
            </div>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export default GeneralInfoSection;

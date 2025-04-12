
import React from 'react';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { UseFormReturn } from 'react-hook-form';
import { BreweryFormData } from '../../../types/brewery';

interface GeneralInfoSectionProps {
  form: UseFormReturn<BreweryFormData>;
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
              <Input placeholder="Brewery name" {...field} required />
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
              <Input placeholder="micro, brewpub, etc." {...field} />
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
              <Input 
                placeholder="Australia" 
                {...field} 
                value={field.value || ''}
              />
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
              />
            </FormControl>
          </FormItem>
        )}
      />
    </div>
  );
};

export default GeneralInfoSection;


import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormDescription } from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import { UseFormReturn } from 'react-hook-form';
import { BreweryFormValues } from './types';

interface BreweryIndependentFieldProps {
  form: UseFormReturn<BreweryFormValues>;
}

const BreweryIndependentField = ({ form }: BreweryIndependentFieldProps) => {
  return (
    <FormField
      control={form.control}
      name="is_independent"
      render={({ field }) => (
        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
          <FormControl>
            <Checkbox
              checked={field.value || false}
              onCheckedChange={field.onChange}
            />
          </FormControl>
          <div className="space-y-1 leading-none">
            <FormLabel>Certified Independent</FormLabel>
            <FormDescription>
              Mark this brewery as an independently owned and operated brewery. Independent breweries are not owned by or controlled by a large commercial brewery.
            </FormDescription>
          </div>
        </FormItem>
      )}
    />
  );
};

export default BreweryIndependentField;


import { useState } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import type { UnifiedBreweryFormValues } from '@/components/brewery/UnifiedBreweryForm';
import type { Brewery } from '@/types/brewery';

interface UseBreweryFormSubmitProps {
  isAdminMode: boolean;
  onSubmit: (data: UnifiedBreweryFormValues) => void;
  onSubmitSuccess?: () => void;
  breweryId?: string;
  isEditMode: boolean;
}

export const useBreweryFormSubmit = ({
  isAdminMode,
  onSubmit,
  onSubmitSuccess,
  breweryId,
  isEditMode,
}: UseBreweryFormSubmitProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (values: UnifiedBreweryFormValues, userId?: string) => {
    console.log('Submitting form values:', values);
    
    if (isAdminMode) {
      // For admin mode, simply pass the values to the provided onSubmit handler
      onSubmit(values);
      return;
    }
    
    // For regular user mode, handle Supabase operations directly
    if (!userId) {
      toast.error('You must be logged in to add or edit a brewery');
      return;
    }

    setIsSubmitting(true);
    console.log('Regular user form submission started with data:', values);

    try {
      const breweryData = {
        name: values.name,
        brewery_type: values.brewery_type || null,
        website_url: values.website_url || null,
        about: values.about || null,
        facebook_url: values.facebook_url || null,
        instagram_url: values.instagram_url || null,
        logo_url: values.logo_url || null,
        country: values.country || 'Australia',
        updated_at: new Date().toISOString()
      };
      
      if (isEditMode && breweryId) {
        console.log('Updating existing brewery with ID:', breweryId);
        
        const { data: ownershipData, error: ownershipError } = await supabase
          .from('brewery_owners')
          .select('brewery_id')
          .eq('brewery_id', breweryId)
          .eq('user_id', userId);
          
        if (ownershipError) {
          console.error('Error checking brewery ownership:', ownershipError);
          throw new Error(`Ownership verification failed: ${ownershipError.message}`);
        }
        
        if (!ownershipData || ownershipData.length === 0) {
          console.error('User does not own this brewery. User ID:', userId, 'Brewery ID:', breweryId);
          throw new Error('You do not have permission to update this brewery');
        }
        
        const { data: updatedData, error: breweryError } = await supabase
          .from('breweries')
          .update(breweryData)
          .eq('id', breweryId)
          .select();

        if (breweryError) {
          console.error('Error updating brewery:', breweryError);
          throw breweryError;
        }

        console.log('Brewery successfully updated:', updatedData);
        toast.success('Brewery updated successfully!');
      } else {
        console.log('Creating new brewery');
        const { data: newBrewery, error: breweryError } = await supabase
          .from('breweries')
          .insert({ 
            ...breweryData,
            created_at: new Date().toISOString()
          })
          .select()
          .single();

        if (breweryError) {
          console.error('Error creating brewery:', breweryError);
          throw breweryError;
        }

        console.log('New brewery created:', newBrewery);
        
        // Return the new brewery ID for the parent component
        const newBreweryId = newBrewery.id;

        const { data: ownershipData, error: ownershipError } = await supabase
          .from('brewery_owners')
          .insert({
            user_id: userId,
            brewery_id: newBreweryId
          })
          .select();

        if (ownershipError) {
          console.error('Error creating brewery ownership record:', ownershipError);
          throw ownershipError;
        }

        console.log('Brewery ownership record created:', ownershipData);
        toast.success('Brewery added successfully!');
        
        return newBreweryId;
      }
      
      if (onSubmitSuccess) {
        onSubmitSuccess();
      }
      
      return breweryId;
    } catch (error: any) {
      console.error('Error managing brewery:', error);
      toast.error(isEditMode 
        ? `Failed to update brewery: ${error.message || 'Unknown error'}` 
        : `Failed to add brewery: ${error.message || 'Unknown error'}`);
      return null;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isSubmitting,
    handleSubmit
  };
};


import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import type { Venue } from '@/types/venue';
import type { AddressSuggestion } from '@/types/address';

interface VenueFormData {
  name: string;
  street: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  phone: string;
  website_url: string;
  longitude: string | null;
  latitude: string | null;
}

interface UseVenueFormProps {
  initialData?: Partial<Venue>;
  onSuccess?: () => void;
  resetOnSuccess?: boolean;
}

export const useVenueForm = ({ initialData, onSuccess, resetOnSuccess = false }: UseVenueFormProps = {}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [addressInput, setAddressInput] = useState('');
  const [formData, setFormData] = useState<VenueFormData>({
    name: '',
    street: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'Australia', // Default to Australia
    phone: '',
    website_url: '',
    longitude: null,
    latitude: null
  });

  // Initialize form with provided data
  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        street: initialData.street || '',
        city: initialData.city || '',
        state: initialData.state || '',
        postal_code: initialData.postal_code || '',
        country: initialData.country || 'Australia',
        phone: initialData.phone || '',
        website_url: initialData.website_url || '',
        longitude: initialData.longitude,
        latitude: initialData.latitude
      });

      // Set address input to show the full address if available
      if (initialData.street && initialData.city && initialData.state) {
        const fullAddress = [
          initialData.street,
          initialData.city,
          `${initialData.state}${initialData.postal_code ? ' ' + initialData.postal_code : ''}`,
          initialData.country
        ].filter(Boolean).join(', ');
        setAddressInput(fullAddress);
      }
    }
  }, [initialData]);

  // Reset form to initial values
  const resetForm = () => {
    setFormData({
      name: '',
      street: '',
      city: '',
      state: '',
      postal_code: '',
      country: 'Australia', // Default to Australia
      phone: '',
      website_url: '',
      longitude: null,
      latitude: null
    });
    setAddressInput('');
  };

  // Handle input field changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle address selection from autocomplete
  const handleAddressChange = (suggestion: AddressSuggestion | null) => {
    if (suggestion) {
      setFormData(prev => ({
        ...prev,
        street: suggestion.street,
        city: suggestion.city,
        state: suggestion.state,
        postal_code: suggestion.postalCode,
        country: suggestion.country,
        longitude: suggestion.longitude,
        latitude: suggestion.latitude
      }));
    }
  };

  // Validate required fields
  const validateForm = () => {
    if (!formData.name || !formData.city || !formData.state) {
      toast.error('Please fill in all required fields');
      return false;
    }
    return true;
  };

  // Handle geocoding if coordinates are missing
  const getCoordinates = async () => {
    if (!formData.longitude || !formData.latitude) {
      if (formData.street && formData.city && formData.state) {
        try {
          const geocodeResponse = await supabase.functions.invoke('geocode', {
            body: {
              street: formData.street,
              city: formData.city,
              state: formData.state,
              postalCode: formData.postal_code
            }
          });

          if (geocodeResponse.data) {
            return {
              longitude: geocodeResponse.data.longitude,
              latitude: geocodeResponse.data.latitude
            };
          }
        } catch (error) {
          console.error('Geocoding error:', error);
          // Continue without coordinates if geocoding fails
        }
      }
    }
    
    return {
      longitude: formData.longitude,
      latitude: formData.latitude
    };
  };

  return {
    formData,
    setFormData,
    addressInput,
    setAddressInput,
    isLoading,
    setIsLoading,
    handleChange,
    handleAddressChange,
    validateForm,
    getCoordinates,
    resetForm
  };
};

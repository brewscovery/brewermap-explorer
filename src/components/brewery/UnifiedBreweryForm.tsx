
import { useState, useEffect } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/contexts/AuthContext';
import type { Brewery } from '@/types/brewery';
import BreweryFormContent, { UnifiedBreweryFormValues } from './form/BreweryFormContent';
import { useBreweryFormSubmit } from '@/hooks/useBreweryFormSubmit';

// Export the type for external use
export type { UnifiedBreweryFormValues };

interface UnifiedBreweryFormProps {
  initialData?: Partial<Brewery> & { id?: string; name?: string };
  onSubmit: (data: UnifiedBreweryFormValues) => void;
  isLoading?: boolean;
  isAdminMode?: boolean;
  onSubmitSuccess?: () => void;
  breweryId?: string;
}

const UnifiedBreweryForm = ({ 
  initialData, 
  onSubmit, 
  isLoading = false,
  isAdminMode = false,
  onSubmitSuccess,
  breweryId: initialBreweryId
}: UnifiedBreweryFormProps) => {
  const { user } = useAuth();
  const [breweryId, setBreweryId] = useState<string | undefined>(initialBreweryId || initialData?.id);
  const isEditMode = !!initialData?.id;

  // Set up form submission logic with our custom hook
  const { isSubmitting, handleSubmit } = useBreweryFormSubmit({
    isAdminMode,
    onSubmit,
    onSubmitSuccess,
    breweryId,
    isEditMode
  });

  // Update breweryId when initialData changes
  useEffect(() => {
    if (initialData?.id) {
      setBreweryId(initialData.id);
    }
  }, [initialData]);

  // Handle form submission
  const handleFormSubmit = async (values: UnifiedBreweryFormValues) => {
    const newBreweryId = await handleSubmit(values, user?.id);
    
    // Update the brewery ID if we got a new one (for new breweries)
    if (newBreweryId && !breweryId) {
      setBreweryId(newBreweryId);
    }
  };

  // Determine scroll area class name based on admin mode
  const scrollAreaClassName = isAdminMode 
    ? "h-full pr-4" 
    : "h-[calc(100vh-220px)] pr-4";

  return (
    <ScrollArea className={scrollAreaClassName}>
      <BreweryFormContent
        initialData={initialData}
        onSubmit={handleFormSubmit}
        isLoading={isSubmitting || isLoading}
        isAdminMode={isAdminMode}
        breweryId={breweryId}
        isEditMode={isEditMode}
      />
    </ScrollArea>
  );
};

export default UnifiedBreweryForm;

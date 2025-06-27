
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog-fixed';
import UnifiedBreweryForm from '@/components/brewery/UnifiedBreweryForm';
import { Input } from '@/components/ui/input';
import { Loader2, ArrowLeft } from 'lucide-react';
import { useBrewerySearch } from '@/hooks/useBrewerySearch';
import BreweryClaimForm from './BreweryClaimForm';
import { Button } from '@/components/ui/button';
import { useBrewerySummary } from '@/hooks/useBrewerySummary';
import VirtualBreweryList from './VirtualBreweryList';

interface Brewery {
  id: string;
  name: string;
  is_verified: boolean;
  has_owner: boolean;
  country?: string | null;
}

interface CreateBreweryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const CreateBreweryDialog = ({ 
  open, 
  onOpenChange,
  onSuccess 
}: CreateBreweryDialogProps) => {
  const [selectedBrewery, setSelectedBrewery] = useState<Brewery | null>(null);
  const { searchTerm, setSearchTerm, results, isLoading } = useBrewerySearch();
  const { data: brewerySummary, isLoading: isLoadingSummary } = useBrewerySummary(
    selectedBrewery?.id || null
  );

  const handleSuccess = () => {
    onOpenChange(false);
    onSuccess();
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setSelectedBrewery(null);
      setSearchTerm('');
    }
    onOpenChange(isOpen);
  };

  const handleBackToSelection = () => {
    setSelectedBrewery(null);
  };

  const availableBreweries = results.filter(
    brewery => !brewery.is_verified && !brewery.has_owner
  );

  const handleBrewerySelect = (brewery: Brewery) => {
    setSelectedBrewery(brewery);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>
            {selectedBrewery ? "Claim Existing Brewery" : "Create Your Brewery"}
          </DialogTitle>
          
          {selectedBrewery && (
            <div className="mt-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="flex items-center gap-1 text-muted-foreground"
                onClick={handleBackToSelection}
              >
                <ArrowLeft className="h-4 w-4" />
                Back to brewery selection
              </Button>
            </div>
          )}
        </DialogHeader>
        
        <div className="mb-4 space-y-2">
          {!selectedBrewery && (
            <>
              <div className="relative">
                <Input
                  placeholder="Search for an existing brewery"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-10"
                />
                {isLoading && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  </div>
                )}
                
                {availableBreweries.length > 0 && (
                  <VirtualBreweryList
                    breweries={availableBreweries}
                    onBrewerySelect={handleBrewerySelect}
                    selectedBreweryId={selectedBrewery?.id}
                  />
                )}
              </div>

              {searchTerm && !isLoading && availableBreweries.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-2">
                  No unclaimed breweries found matching your search
                </p>
              )}
            </>
          )}
        </div>
        
        {selectedBrewery ? (
          <BreweryClaimForm
            breweryId={selectedBrewery.id}
            breweryName={selectedBrewery.name}
            breweryCountry={brewerySummary?.country || null}
            venues={brewerySummary?.venues || []}
            onSuccess={handleSuccess}
            onCancel={handleBackToSelection}
          />
        ) : (
          <UnifiedBreweryForm 
            initialData={undefined}
            onSubmit={() => {}} // Not needed in regular user mode
            onSubmitSuccess={handleSuccess} 
            isAdminMode={false}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CreateBreweryDialog;

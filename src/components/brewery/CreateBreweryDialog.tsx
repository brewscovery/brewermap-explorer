
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

interface Brewery {
  id: string;
  name: string;
  is_verified: boolean;
  has_owner: boolean;
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

  const handleSuccess = () => {
    onOpenChange(false);
    onSuccess();
  };

  // Reset selected brewery when dialog closes
  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      // Reset the selection state when closing the dialog
      setSelectedBrewery(null);
      setSearchTerm('');
    }
    onOpenChange(isOpen);
  };

  // Function to go back to brewery selection
  const handleBackToSelection = () => {
    setSelectedBrewery(null);
  };

  // Filter out verified and owned breweries from search results
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
        </DialogHeader>
        
        {selectedBrewery && (
          <Button 
            variant="ghost" 
            size="sm" 
            className="absolute left-6 top-6 flex items-center gap-1 text-muted-foreground"
            onClick={handleBackToSelection}
          >
            <ArrowLeft className="h-4 w-4" />
            Back to brewery selection
          </Button>
        )}
        
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
              </div>
              
              {availableBreweries.length > 0 && (
                <div className="border rounded max-h-40 overflow-y-auto divide-y">
                  {availableBreweries.map((brewery) => (
                    <div 
                      key={brewery.id} 
                      className={`p-2 hover:bg-muted cursor-pointer transition-colors ${
                        selectedBrewery?.id === brewery.id ? 'bg-muted' : ''
                      }`}
                      onClick={() => handleBrewerySelect(brewery)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          handleBrewerySelect(brewery);
                        }
                      }}
                    >
                      <div className="flex justify-between items-center gap-2">
                        <span className="truncate">{brewery.name}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

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

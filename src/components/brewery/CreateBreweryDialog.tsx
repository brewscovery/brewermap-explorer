
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog-fixed';
import UnifiedBreweryForm from '@/components/brewery/UnifiedBreweryForm';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';
import { useBrewerySearch } from '@/hooks/useBrewerySearch';

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Create Your Brewery</DialogTitle>
        </DialogHeader>
        
        <div className="mb-4 space-y-2">
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
          
          {results.length > 0 && (
            <div className="border rounded max-h-40 overflow-y-auto divide-y">
              {results.map((brewery) => (
                <div 
                  key={brewery.id} 
                  className={`p-2 hover:bg-muted cursor-pointer transition-colors ${
                    selectedBrewery?.id === brewery.id ? 'bg-muted' : ''
                  }`}
                  onClick={() => setSelectedBrewery(brewery)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      setSelectedBrewery(brewery);
                    }
                  }}
                >
                  <div className="flex justify-between items-center gap-2">
                    <span className="truncate">{brewery.name}</span>
                    <div className="flex gap-2 shrink-0">
                      {brewery.is_verified && (
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                          Verified
                        </span>
                      )}
                      {brewery.has_owner && (
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          Owned
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {searchTerm && !isLoading && results.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-2">
              No breweries found matching your search
            </p>
          )}
        </div>
        
        <UnifiedBreweryForm 
          initialData={selectedBrewery ? { 
            id: selectedBrewery.id, 
            name: selectedBrewery.name 
          } : undefined}
          onSubmit={() => {}} // Not needed in regular user mode
          onSubmitSuccess={handleSuccess} 
          isAdminMode={false}
        />
      </DialogContent>
    </Dialog>
  );
};

export default CreateBreweryDialog;

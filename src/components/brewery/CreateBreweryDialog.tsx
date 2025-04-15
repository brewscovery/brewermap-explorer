
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog-fixed';
import UnifiedBreweryForm from '@/components/brewery/UnifiedBreweryForm';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

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
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Brewery[]>([]);
  const [selectedBrewery, setSelectedBrewery] = useState<Brewery | null>(null);

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;

    try {
      const { data, error } = await supabase.rpc('search_breweries', { 
        search_term: searchTerm 
      });

      if (error) throw error;
      setSearchResults(data || []);
    } catch (error) {
      console.error('Error searching breweries:', error);
      // Consider adding a toast notification here
    }
  };

  const handleSelectBrewery = (brewery: Brewery) => {
    setSelectedBrewery(brewery);
  };

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
        
        <div className="mb-4 relative">
          <div className="flex items-center">
            <Input
              placeholder="Search for an existing brewery"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="pr-10"
            />
            <button 
              onClick={handleSearch} 
              className="absolute right-2 top-1/2 -translate-y-1/2"
            >
              <Search className="h-5 w-5 text-muted-foreground" />
            </button>
          </div>
          
          {searchResults.length > 0 && (
            <div className="mt-2 border rounded max-h-40 overflow-y-auto">
              {searchResults.map((brewery) => (
                <div 
                  key={brewery.id} 
                  className={`p-2 hover:bg-muted cursor-pointer ${
                    selectedBrewery?.id === brewery.id ? 'bg-muted' : ''
                  }`}
                  onClick={() => handleSelectBrewery(brewery)}
                >
                  <div className="flex justify-between items-center">
                    <span>{brewery.name}</span>
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
              ))}
            </div>
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


import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Brewery } from '@/types/brewery';
import BreweryList from '@/components/brewery/BreweryList';
import CreateBreweryDialog from '@/components/brewery/CreateBreweryDialog';
import BreweryInfo from '@/components/brewery/BreweryInfo';

interface BreweryManagerProps {
  breweries: Brewery[];
  selectedBrewery: Brewery | null;
  isLoading: boolean;
  onBrewerySelect: (brewery: Brewery) => void;
  onNewBreweryAdded: () => void;
}

const BreweryManager = ({ 
  breweries, 
  selectedBrewery, 
  isLoading, 
  onBrewerySelect, 
  onNewBreweryAdded 
}: BreweryManagerProps) => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  return (
    <div className="space-y-8">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h3 className="text-lg font-semibold">Your Breweries</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Create and manage your breweries
            </p>
          </div>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="mr-2" size={18} />
            Add Brewery
          </Button>
        </div>
        
        <BreweryList 
          breweries={breweries}
          selectedBrewery={selectedBrewery}
          isLoading={isLoading}
          onBrewerySelect={onBrewerySelect}
          onAddBrewery={() => setIsCreateDialogOpen(true)}
        />
        
        <CreateBreweryDialog 
          open={isCreateDialogOpen} 
          onOpenChange={setIsCreateDialogOpen}
          onSuccess={onNewBreweryAdded}
        />
      </div>
      
      {selectedBrewery && (
        <div>
          <BreweryInfo breweryId={selectedBrewery.id} />
        </div>
      )}
    </div>
  );
};

export default BreweryManager;


import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Beer, MapPin, Settings } from 'lucide-react';
import BreweryManager from '@/components/dashboard/BreweryManager';
import { Brewery } from '@/types/brewery';

interface DashboardTabsProps {
  breweries: Brewery[];
  selectedBrewery: Brewery | null;
  isLoading: boolean;
  onBrewerySelect: (brewery: Brewery) => void;
  onNewBreweryAdded: () => void;
}

const DashboardTabs = ({
  breweries,
  selectedBrewery,
  isLoading,
  onBrewerySelect,
  onNewBreweryAdded
}: DashboardTabsProps) => {
  return (
    <Tabs defaultValue="breweries" className="w-full">
      <TabsList className="grid grid-cols-3 mb-6">
        <TabsTrigger value="breweries" className="flex items-center gap-2">
          <Beer className="h-4 w-4" />
          <span>My Breweries</span>
        </TabsTrigger>
        <TabsTrigger value="venues" className="flex items-center gap-2">
          <MapPin className="h-4 w-4" />
          <span>Venues</span>
        </TabsTrigger>
        <TabsTrigger value="settings" className="flex items-center gap-2">
          <Settings className="h-4 w-4" />
          <span>Settings</span>
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="breweries" className="space-y-4">
        <BreweryManager 
          breweries={breweries}
          selectedBrewery={selectedBrewery}
          isLoading={isLoading}
          onBrewerySelect={onBrewerySelect}
          onNewBreweryAdded={onNewBreweryAdded}
        />
      </TabsContent>
      
      <TabsContent value="venues" className="space-y-4">
        {selectedBrewery ? (
          <div className="space-y-4">
            <h3 className="text-xl font-medium">Venues for {selectedBrewery.name}</h3>
            <p className="text-muted-foreground">
              Please select a brewery first to manage its venues. You can do this from the "My Breweries" tab.
            </p>
          </div>
        ) : (
          <div className="bg-muted/50 p-6 rounded-md text-center">
            <h3 className="text-lg font-medium mb-2">No Brewery Selected</h3>
            <p className="text-sm text-muted-foreground">
              Please select a brewery first to manage its venues. You can do this from the "My Breweries" tab.
            </p>
          </div>
        )}
      </TabsContent>
      
      <TabsContent value="settings" className="space-y-4">
        <div className="bg-muted/50 p-6 rounded-md">
          <h3 className="text-lg font-medium mb-2">Account Settings</h3>
          <p className="text-sm text-muted-foreground">
            Account settings will be available in a future update.
          </p>
        </div>
      </TabsContent>
    </Tabs>
  );
};

export default DashboardTabs;

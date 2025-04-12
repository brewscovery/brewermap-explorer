
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { 
  Store, 
  Clock, 
  Beer, 
  Utensils, 
  PlusCircle 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useBreweryFetching } from '@/hooks/useBreweryFetching';
import { useAuth } from '@/contexts/AuthContext';
import VenueManagement from '@/components/brewery/VenueManagement';
import { useBreweryVenues } from '@/hooks/useBreweryVenues';
import { Venue } from '@/types/venue';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import AddVenueDialog from '@/components/brewery/AddVenueDialog';
import EditVenueDialog from '@/components/brewery/EditVenueDialog';
import VenueHoursDialog from '@/components/brewery/VenueHoursDialog';
import { VenueDetailsTab } from '@/components/brewery/venue-tabs/VenueDetailsTab';
import { VenueHoursTab } from '@/components/brewery/venue-tabs/VenueHoursTab';
import { HappyHoursTab } from '@/components/brewery/venue-tabs/HappyHoursTab';
import { DailySpecialsTab } from '@/components/brewery/venue-tabs/DailySpecialsTab';

const VenuesPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { selectedBrewery } = useBreweryFetching(user?.id);
  
  const [selectedTab, setSelectedTab] = useState("details");
  const [showAddVenueDialog, setShowAddVenueDialog] = useState(false);
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showHoursDialog, setShowHoursDialog] = useState(false);
  
  const params = new URLSearchParams(location.search);
  const venueId = params.get('venueId');
  const action = params.get('action');
  
  const { 
    venues, 
    isLoading: isLoadingVenues, 
    refetch: refetchVenues,
    updateVenue,
    isUpdating 
  } = useBreweryVenues(selectedBrewery?.id);
  
  // Find the selected venue
  useEffect(() => {
    if (venueId && venues.length > 0) {
      const venue = venues.find(v => v.id === venueId);
      setSelectedVenue(venue || null);
    } else {
      setSelectedVenue(null);
    }
  }, [venueId, venues]);
  
  // Handle the add venue action
  useEffect(() => {
    if (action === 'add') {
      setShowAddVenueDialog(true);
    }
  }, [action]);
  
  // Clear query params when dialogs close
  const handleAddVenueDialogClose = () => {
    setShowAddVenueDialog(false);
    if (action === 'add') {
      navigate('/dashboard/venues');
    }
  };
  
  // Handle tab changes
  const handleTabChange = (value: string) => {
    setSelectedTab(value);
  };
  
  const handleVenueAdded = () => {
    refetchVenues();
    handleAddVenueDialogClose();
  };
  
  // If no brewery is selected yet
  if (!selectedBrewery) {
    return (
      <div className="max-w-5xl mx-auto">
        <h2 className="text-2xl font-bold mb-6">Venues</h2>
        
        <Alert>
          <AlertTitle>No brewery selected</AlertTitle>
          <AlertDescription>
            Please select a brewery from the sidebar to manage its venues.
          </AlertDescription>
        </Alert>
      </div>
    );
  }
  
  // If a specific venue is selected, show the tabbed interface
  if (selectedVenue) {
    return (
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold">{selectedVenue.name}</h2>
            <p className="text-sm text-muted-foreground">
              {selectedVenue.city}, {selectedVenue.state}
            </p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowEditDialog(true)}
            >
              Edit Venue
            </Button>
            <Button
              onClick={() => navigate('/dashboard/venues')}
              variant="ghost"
              size="sm"
            >
              Back to Venues
            </Button>
          </div>
        </div>
        
        <Tabs value={selectedTab} onValueChange={handleTabChange}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="details" className="flex items-center gap-1">
              <Store className="h-4 w-4" />
              <span className="hidden sm:inline">Venue Details</span>
              <span className="sm:hidden">Details</span>
            </TabsTrigger>
            <TabsTrigger value="hours" className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span className="hidden sm:inline">Venue Hours</span>
              <span className="sm:hidden">Hours</span>
            </TabsTrigger>
            <TabsTrigger value="happy-hours" className="flex items-center gap-1">
              <Beer className="h-4 w-4" />
              <span className="hidden sm:inline">Happy Hours</span>
              <span className="sm:hidden">Happy</span>
            </TabsTrigger>
            <TabsTrigger value="specials" className="flex items-center gap-1">
              <Utensils className="h-4 w-4" />
              <span className="hidden sm:inline">Daily Specials</span>
              <span className="sm:hidden">Specials</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="details" className="pt-4">
            <VenueDetailsTab 
              venue={selectedVenue} 
              onUpdate={updateVenue}
              isUpdating={isUpdating}
            />
          </TabsContent>
          
          <TabsContent value="hours" className="pt-4">
            <VenueHoursTab 
              venue={selectedVenue}
            />
          </TabsContent>
          
          <TabsContent value="happy-hours" className="pt-4">
            <HappyHoursTab 
              venue={selectedVenue}
            />
          </TabsContent>
          
          <TabsContent value="specials" className="pt-4">
            <DailySpecialsTab 
              venue={selectedVenue}
            />
          </TabsContent>
        </Tabs>
        
        <EditVenueDialog
          open={showEditDialog}
          onOpenChange={setShowEditDialog}
          venue={selectedVenue}
          onVenueUpdated={updateVenue}
          isUpdating={isUpdating}
        />
      </div>
    );
  }
  
  // If no venue is selected, show the venue management view
  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold">Venues for {selectedBrewery.name}</h2>
          <p className="text-sm text-muted-foreground">
            Manage the locations where customers can find your products
          </p>
        </div>
        <Button onClick={() => setShowAddVenueDialog(true)}>
          <PlusCircle className="mr-2" size={18} />
          Add Venue
        </Button>
      </div>
      
      <VenueManagement breweryId={selectedBrewery.id} />
      
      {selectedBrewery.id && (
        <AddVenueDialog
          open={showAddVenueDialog}
          onOpenChange={handleAddVenueDialogClose}
          breweryId={selectedBrewery.id}
          onVenueAdded={handleVenueAdded}
        />
      )}
    </div>
  );
};

export default VenuesPage;

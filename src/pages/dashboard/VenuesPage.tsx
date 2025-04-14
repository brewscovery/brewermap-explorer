
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
  Trash2,
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
import VenueHoursDialog from '@/components/brewery/VenueHoursDialog';
import { VenueDetailsTab } from '@/components/brewery/venue-tabs/VenueDetailsTab';
import { VenueHoursTab } from '@/components/brewery/venue-tabs/VenueHoursTab';
import { HappyHoursTab } from '@/components/brewery/venue-tabs/HappyHoursTab';
import { DailySpecialsTab } from '@/components/brewery/venue-tabs/DailySpecialsTab';
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import EditVenueDialog from '@/components/brewery/EditVenueDialog';

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
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  
  const params = new URLSearchParams(location.search);
  const venueId = params.get('venueId');
  const action = params.get('action');
  
  const { 
    venues, 
    isLoading: isLoadingVenues, 
    refetch: refetchVenues,
    deleteVenue,
    isDeleting,
    updateVenue,
    isUpdating
  } = useBreweryVenues(selectedBrewery?.id);
  
  useEffect(() => {
    if (venueId && venues.length > 0) {
      console.log('Looking for venue with ID:', venueId, 'in venues:', venues);
      const venue = venues.find(v => v.id === venueId);
      
      if (venue) {
        console.log('Found venue:', venue);
        setSelectedVenue(venue);
      } else {
        console.log('Venue not found in current brewery venues');
        setSelectedVenue(null);
      }
    } else if (!venueId) {
      setSelectedVenue(null);
    }
  }, [venueId, venues]);
  
  useEffect(() => {
    if (action === 'add') {
      setShowAddVenueDialog(true);
    }
  }, [action]);
  
  const handleAddVenueDialogClose = () => {
    setShowAddVenueDialog(false);
    if (action === 'add') {
      navigate('/dashboard/venues');
    }
  };
  
  const handleTabChange = (value: string) => {
    setSelectedTab(value);
  };
  
  const handleVenueAdded = () => {
    refetchVenues();
    handleAddVenueDialogClose();
  };
  
  const handleDeleteVenue = async () => {
    if (!selectedVenue) return;
    
    try {
      await deleteVenue(selectedVenue.id);
      toast.success(`Venue "${selectedVenue.name}" deleted successfully`);
      navigate('/dashboard/venues');
    } catch (error) {
      console.error('Error deleting venue:', error);
      toast.error('Failed to delete venue');
    } finally {
      setShowDeleteDialog(false);
    }
  };
  
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
              variant="destructive" 
              size="sm"
              onClick={() => setShowDeleteDialog(true)}
            >
              <Trash2 className="mr-2" size={16} />
              Delete Venue
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
        
        <AlertDialog 
          open={showDeleteDialog} 
          onOpenChange={setShowDeleteDialog}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Venue</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete the venue "{selectedVenue.name}"? 
                This action cannot be undone and will remove all venue data.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleDeleteVenue}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Delete Venue'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    );
  }
  
  if (isLoadingVenues && venueId) {
    return (
      <div className="max-w-5xl mx-auto">
        <h2 className="text-2xl font-bold mb-6">Loading Venue Details...</h2>
        <div className="flex items-center justify-center py-12">
          <div className="animate-pulse flex space-x-4">
            <div className="rounded-full bg-muted h-10 w-10"></div>
            <div className="flex-1 space-y-6 py-1">
              <div className="h-2 bg-muted rounded"></div>
              <div className="space-y-3">
                <div className="grid grid-cols-3 gap-4">
                  <div className="h-2 bg-muted rounded col-span-2"></div>
                  <div className="h-2 bg-muted rounded col-span-1"></div>
                </div>
                <div className="h-2 bg-muted rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
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

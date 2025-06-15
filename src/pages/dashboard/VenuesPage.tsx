
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useBreweryFetching } from '@/hooks/useBreweryFetching';
import { useAuth } from '@/contexts/AuthContext';
import { useBreweryVenues } from '@/hooks/useBreweryVenues';
import { toast } from 'sonner';
import { VenueDetailView } from '@/components/dashboard/venues/VenueDetailView';
import { VenueListView } from '@/components/dashboard/venues/VenueListView';
import { NoBrewerySelectedView } from '@/components/dashboard/venues/NoBrewerySelectedView';
import { LoadingVenueView } from '@/components/dashboard/venues/LoadingVenueView';
import { BulkBreweryImport } from '@/components/brewery/BulkBreweryImport';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const VenuesPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { selectedBrewery } = useBreweryFetching(user?.id);
  
  const params = new URLSearchParams(location.search);
  const venueId = params.get('venueId');
  const action = params.get('action');
  
  const [selectedVenue, setSelectedVenue] = useState(null);
  const [showAddVenueDialog, setShowAddVenueDialog] = useState(false);
  
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
  
  const handleVenueAdded = () => {
    refetchVenues();
    navigate('/dashboard/venues'); // Clear the action parameter
  };
  
  const handleDeleteVenue = async (venueId) => {
    try {
      await deleteVenue(venueId);
      toast.success(`Venue deleted successfully`);
      navigate('/dashboard/venues');
    } catch (error) {
      console.error('Error deleting venue:', error);
      toast.error('Failed to delete venue');
    }
  };
  
  // Render based on different states
  if (!selectedBrewery) {
    return (
      <div className="max-w-5xl mx-auto p-4">
        <Tabs defaultValue="import" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="import">Import Breweries</TabsTrigger>
            <TabsTrigger value="no-brewery">No Brewery Selected</TabsTrigger>
          </TabsList>
          <TabsContent value="import">
            <BulkBreweryImport />
          </TabsContent>
          <TabsContent value="no-brewery">
            <NoBrewerySelectedView />
          </TabsContent>
        </Tabs>
      </div>
    );
  }
  
  if (selectedVenue) {
    return (
      <VenueDetailView 
        venue={selectedVenue}
        isUpdating={isUpdating}
        isDeleting={isDeleting}
        onUpdateVenue={updateVenue}
        onDeleteVenue={handleDeleteVenue}
      />
    );
  }
  
  if (isLoadingVenues && venueId) {
    return <LoadingVenueView />;
  }
  
  return (
    <VenueListView 
      brewery={selectedBrewery} 
      onVenueAdded={handleVenueAdded}
    />
  );
};

export default VenuesPage;

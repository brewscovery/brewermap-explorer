import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { VenueCard } from '@/components/venue/VenueCard';
import { Skeleton } from '@/components/ui/skeleton';
import { MapPin, AlertCircle } from 'lucide-react';
import VenueSidebar from '@/components/venue/VenueSidebar';
import { Venue } from '@/types/venue';
import { useGeolocation } from '@/hooks/useGeolocation';
import { calculateDistance } from '@/utils/distanceUtils';

interface VenueWithDistance extends Venue {
  distance: number;
  breweries: {
    name: string;
    logo_url?: string | null;
    is_verified?: boolean;
  };
}

const DiscoveriesPage = () => {
  const { user } = useAuth();
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);
  const [isVenueSidebarOpen, setIsVenueSidebarOpen] = useState(false);
  
  const { 
    location, 
    isLoading: locationLoading, 
    error: locationError, 
    requestLocation 
  } = useGeolocation();

  const { data: nearbyVenues, isLoading: venuesLoading } = useQuery({
    queryKey: ['nearbyVenues', location?.latitude, location?.longitude],
    queryFn: async () => {
      if (!location) return [];
      
      // Get all venues with brewery information
      const { data: venues, error } = await supabase
        .from('venues')
        .select(`
          *,
          breweries(name, logo_url, is_verified)
        `)
        .not('latitude', 'is', null)
        .not('longitude', 'is', null);
        
      if (error) throw error;
      
      // Calculate distances and filter within 50km
      const venuesWithDistance: VenueWithDistance[] = venues
        .map(venue => ({
          ...venue,
          distance: calculateDistance(
            location.latitude,
            location.longitude,
            parseFloat(venue.latitude!),
            parseFloat(venue.longitude!)
          )
        }))
        .filter(venue => venue.distance <= 50)
        .sort((a, b) => a.distance - b.distance);
      
      return venuesWithDistance;
    },
    enabled: !!location
  });

  const handleVenueClick = (venue: VenueWithDistance) => {
    // Convert venue to match Venue type by ensuring website_url exists
    const completeVenue: Venue = {
      ...venue,
      website_url: venue.website_url || null
    };
    setSelectedVenue(completeVenue);
    setIsVenueSidebarOpen(true);
  };

  const handleCloseSidebar = () => {
    setIsVenueSidebarOpen(false);
  };

  const renderLocationRequest = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Brewscoveries
        </CardTitle>
        <CardDescription>
          Discover breweries and venues near you
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8 flex flex-col items-center gap-4">
          <div className="p-4 rounded-full bg-muted">
            <AlertCircle size={32} className="text-muted-foreground"/>
          </div>
          <div className="space-y-2">
            <p className="text-muted-foreground">
              User location unknown, please give Brewscovery location access
            </p>
            {locationError && (
              <p className="text-sm text-destructive">
                {locationError}
              </p>
            )}
          </div>
          <Button 
            onClick={requestLocation}
            disabled={locationLoading}
            className="flex items-center gap-2"
          >
            <MapPin className="h-4 w-4" />
            {locationLoading ? 'Getting location...' : 'Enable Location Access'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const renderVenueGrid = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Brewscoveries Near You
        </CardTitle>
        <CardDescription>
          Venues within 50km of your location, sorted by distance
        </CardDescription>
      </CardHeader>
      <CardContent>
        {venuesLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map(i => (
              <Skeleton key={i} className="h-36 w-full rounded-md" />
            ))}
          </div>
        ) : nearbyVenues && nearbyVenues.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {nearbyVenues.map(venue => (
              <VenueCard 
                key={venue.id}
                venue={venue}
                brewery={{
                  name: venue.breweries.name,
                  logo_url: venue.breweries.logo_url,
                  is_verified: venue.breweries.is_verified
                }}
                distance={venue.distance}
                onClick={() => handleVenueClick(venue)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 flex flex-col items-center gap-4">
            <div className="p-4 rounded-full bg-muted">
              <MapPin size={32} className="text-muted-foreground"/>
            </div>
            <p className="text-muted-foreground">
              No venues found within 50km of your location.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="max-w-4xl mx-auto">
      {!location ? renderLocationRequest() : renderVenueGrid()}

      {selectedVenue && isVenueSidebarOpen && (
        <VenueSidebar
          venue={selectedVenue}
          onClose={handleCloseSidebar}
          displayMode="full"
        />
      )}
    </div>
  );
};

export default DiscoveriesPage;

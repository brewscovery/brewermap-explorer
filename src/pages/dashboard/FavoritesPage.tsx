
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { VenueCard } from '@/components/venue/VenueCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Store } from 'lucide-react';

const FavoritesPage = () => {
  const { user } = useAuth();

  const { data: favoriteVenues, isLoading } = useQuery({
    queryKey: ['favoriteVenues', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      // Get favorite venue IDs
      const { data: favorites, error: favoritesError } = await supabase
        .from('venue_favorites')
        .select('venue_id')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
        
      if (favoritesError) throw favoritesError;
      
      if (!favorites || favorites.length === 0) return [];
      
      // Get venue details for each favorite
      const venueIds = favorites.map(f => f.venue_id);
      const { data: venues, error: venuesError } = await supabase
        .from('venues')
        .select(`
          *,
          breweries(name, logo_url, is_verified)
        `)
        .in('id', venueIds)
        .order('name', { ascending: true }); // Sort venues by name in ascending order
        
      if (venuesError) throw venuesError;
      
      return venues || [];
    },
    enabled: !!user
  });

  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>My Favorites</CardTitle>
          <CardDescription>
            Breweries and venues you've marked as favorites
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map(i => (
                <Skeleton key={i} className="h-36 w-full rounded-md" />
              ))}
            </div>
          ) : favoriteVenues && favoriteVenues.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {favoriteVenues.map(venue => (
                <VenueCard 
                  key={venue.id}
                  venue={venue}
                  brewery={{
                    name: venue.breweries.name,
                    logo_url: venue.breweries.logo_url,
                    is_verified: venue.breweries.is_verified
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 flex flex-col items-center gap-4">
              <div className="p-4 rounded-full bg-muted">
                <Store size={32} className="text-muted-foreground"/>
              </div>
              <p className="text-muted-foreground">
                You haven't added any favorites yet.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default FavoritesPage;

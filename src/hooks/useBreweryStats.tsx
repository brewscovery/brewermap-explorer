
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface BreweryStats {
  venueCount: number;
  averageRating: number | null;
  totalCheckins: number;
}

export const useBreweryStats = (breweryId: string) => {
  const [stats, setStats] = useState<BreweryStats>({
    venueCount: 0,
    averageRating: null,
    totalCheckins: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true);
        
        // Get venue count
        const { count: venueCount, error: venueError } = await supabase
          .from('venues')
          .select('*', { count: 'exact', head: true })
          .eq('brewery_id', breweryId);
          
        if (venueError) throw venueError;
        
        // Get venue IDs for this brewery
        const { data: venues, error: venuesError } = await supabase
          .from('venues')
          .select('id')
          .eq('brewery_id', breweryId);
          
        if (venuesError) throw venuesError;
        
        if (venues.length === 0) {
          setStats({
            venueCount: venueCount || 0,
            averageRating: null,
            totalCheckins: 0
          });
          return;
        }
        
        const venueIds = venues.map(v => v.id);
        
        // Get check-in stats
        const { data: checkinsData, error: checkinsError } = await supabase
          .from('checkins')
          .select('rating')
          .in('venue_id', venueIds)
          .not('rating', 'is', null);
          
        if (checkinsError) throw checkinsError;
        
        // Calculate average rating
        let averageRating = null;
        if (checkinsData.length > 0) {
          const sum = checkinsData.reduce((acc, curr) => acc + (curr.rating || 0), 0);
          averageRating = sum / checkinsData.length;
        }
        
        // Count total check-ins
        const { count: totalCheckins, error: countError } = await supabase
          .from('checkins')
          .select('*', { count: 'exact', head: true })
          .in('venue_id', venueIds);
          
        if (countError) throw countError;
        
        setStats({
          venueCount: venueCount || 0,
          averageRating,
          totalCheckins: totalCheckins || 0
        });
        
      } catch (error) {
        console.error('Error fetching brewery stats:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (breweryId) {
      fetchStats();
    }
  }, [breweryId]);
  
  return { stats, isLoading };
};

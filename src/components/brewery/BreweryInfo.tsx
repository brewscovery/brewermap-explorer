
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import AboutEditor from './AboutEditor';

const BreweryInfo = () => {
  const { user } = useAuth();
  const [breweryData, setBreweryData] = useState<{id: string, about: string | null} | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBreweryData = async () => {
      if (!user) return;
      
      try {
        // First check if the user owns any breweries
        const { data: ownerData, error: ownerError } = await supabase
          .from('brewery_owners')
          .select('brewery_id')
          .eq('user_id', user.id)
          .single();
        
        if (ownerError && ownerError.code !== 'PGRST116') {
          throw ownerError;
        }
        
        if (ownerData?.brewery_id) {
          // If user owns a brewery, fetch its details
          const { data, error } = await supabase
            .from('breweries')
            .select('id, about')
            .eq('id', ownerData.brewery_id)
            .single();
          
          if (error) throw error;
          setBreweryData(data);
        }
      } catch (error: any) {
        console.error('Error fetching brewery data:', error);
        toast.error('Failed to load brewery information');
      } finally {
        setLoading(false);
      }
    };

    fetchBreweryData();
  }, [user]);

  if (loading) {
    return <div className="text-center p-4">Loading brewery information...</div>;
  }

  if (!breweryData) {
    return (
      <div className="bg-muted/50 p-4 rounded-md text-center">
        <p>No brewery associated with this account.</p>
        <p className="text-sm text-muted-foreground mt-2">
          If you own a brewery and want to claim it, please contact support.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AboutEditor breweryId={breweryData.id} initialAbout={breweryData.about} />
    </div>
  );
};

export default BreweryInfo;

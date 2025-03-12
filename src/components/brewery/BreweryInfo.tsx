
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import AboutEditor from './AboutEditor';

const BreweryInfo = () => {
  const { user } = useAuth();
  const [breweryData, setBreweryData] = useState<{id: string, about: string | null} | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchBreweryData = async () => {
    if (!user) return;
    
    try {
      console.log('Fetching brewery data for user:', user.id);
      
      // First check if the user owns any breweries
      const { data: ownerData, error: ownerError } = await supabase
        .from('brewery_owners')
        .select('brewery_id')
        .eq('user_id', user.id)
        .single();
      
      if (ownerError) {
        console.error('Error fetching brewery owner data:', ownerError);
        if (ownerError.code !== 'PGRST116') { // Not found error
          throw ownerError;
        }
        setLoading(false);
        return;
      }
      
      if (ownerData?.brewery_id) {
        console.log('Found brewery ID:', ownerData.brewery_id);
        
        // If user owns a brewery, fetch its details
        const { data, error } = await supabase
          .from('breweries')
          .select('id, about')
          .eq('id', ownerData.brewery_id)
          .single();
        
        if (error) {
          console.error('Error fetching brewery details:', error);
          throw error;
        }
        
        console.log('Fetched brewery data:', data);
        setBreweryData(data);
      }
    } catch (error: any) {
      console.error('Error fetching brewery data:', error);
      toast.error('Failed to load brewery information');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBreweryData();
  }, [user]);

  const handleAboutUpdate = (newAbout: string) => {
    if (breweryData) {
      setBreweryData({
        ...breweryData,
        about: newAbout
      });
    }
  };

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
      <AboutEditor 
        breweryId={breweryData.id} 
        initialAbout={breweryData.about} 
        onUpdate={handleAboutUpdate}
      />
    </div>
  );
};

export default BreweryInfo;

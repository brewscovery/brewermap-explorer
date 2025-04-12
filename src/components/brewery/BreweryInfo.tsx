
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import VenueManagement from './VenueManagement';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import CreateBreweryDialog from './CreateBreweryDialog';

interface BreweryInfoProps {
  breweryId?: string | null;
}

const BreweryInfo = ({ breweryId: propBreweryId }: BreweryInfoProps) => {
  const { user } = useAuth();
  const [breweryData, setBreweryData] = useState<{id: string, name?: string} | null>(null);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const fetchBreweryData = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // If a breweryId was passed directly, use that
      if (propBreweryId) {
        console.log('Using provided brewery ID:', propBreweryId);
        
        const { data, error } = await supabase
          .from('breweries')
          .select('id, name')
          .eq('id', propBreweryId)
          .single();
        
        if (error) {
          console.error('Error fetching brewery details:', error);
          throw error;
        }
        
        console.log('Fetched brewery data:', data);
        setBreweryData(data);
        return;
      }
      
      // Otherwise, find the user's brewery
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
          .select('id, name')
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
  }, [user, propBreweryId]);

  if (loading) {
    return <div className="text-center p-4">Loading brewery information...</div>;
  }

  if (!breweryData) {
    return (
      <div>
        <div className="bg-muted/50 p-6 rounded-md text-center">
          <h3 className="text-lg font-medium mb-2">No brewery associated with this account</h3>
          <p className="text-sm text-muted-foreground mb-4">
            As a business user, you can create and manage your own brewery.
          </p>
          <Button 
            onClick={() => setIsCreateDialogOpen(true)}
            className="mx-auto"
          >
            <Plus className="mr-2 h-4 w-4" />
            Create Your Brewery
          </Button>
        </div>

        <CreateBreweryDialog 
          open={isCreateDialogOpen} 
          onOpenChange={setIsCreateDialogOpen}
          onSuccess={fetchBreweryData}
        />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h3 className="text-xl font-medium">{breweryData.name || 'Brewery Details'}</h3>
      <VenueManagement breweryId={breweryData.id} />
    </div>
  );
};

export default BreweryInfo;

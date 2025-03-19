import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Map, User, ChevronDown, LogOut, Plus } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import BreweryInfo from '@/components/brewery/BreweryInfo';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { useState, useEffect } from 'react';
import { Brewery } from '@/types/brewery';
import BreweryList from '@/components/brewery/BreweryList';
import CreateBreweryDialog from '@/components/brewery/CreateBreweryDialog';
import { useBreweryRealtimeUpdates } from '@/hooks/useBreweryRealtimeUpdates';
import { useQueryClient } from '@tanstack/react-query';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, userType, firstName, lastName } = useAuth();
  const [breweries, setBreweries] = useState<Brewery[]>([]);
  const [selectedBrewery, setSelectedBrewery] = useState<Brewery | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const queryClient = useQueryClient();
  
  useBreweryRealtimeUpdates(selectedBrewery, setSelectedBrewery);
  
  const displayName = userType === 'business' 
    ? firstName || 'Business'
    : `${firstName || ''} ${lastName || 'User'}`.trim();

  const fetchBreweries = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      console.log('Fetching breweries for user:', user.id);
      
      const { data: ownerData, error: ownerError } = await supabase
        .from('brewery_owners')
        .select('brewery_id')
        .eq('user_id', user.id);
      
      if (ownerError) throw ownerError;
      
      if (ownerData && ownerData.length > 0) {
        const breweryIds = ownerData.map(item => item.brewery_id);
        console.log('Found brewery IDs:', breweryIds);
        
        const { data: breweriesData, error: breweriesError } = await supabase
          .from('breweries')
          .select('*')
          .in('id', breweryIds);
          
        if (breweriesError) throw breweriesError;
        
        if (breweriesData && breweriesData.length > 0) {
          console.log('Fetched brewery data:', breweriesData);
          
          queryClient.setQueryData(['breweries'], breweriesData);
          
          setBreweries(breweriesData);
          
          if (breweriesData.length === 1) {
            setSelectedBrewery(breweriesData[0]);
          } else if (selectedBrewery === null && breweriesData.length > 0) {
            setSelectedBrewery(breweriesData[0]);
          } else if (selectedBrewery) {
            const updatedBrewery = breweriesData.find(b => b.id === selectedBrewery.id);
            if (updatedBrewery) {
              setSelectedBrewery(updatedBrewery);
              queryClient.setQueryData(['brewery', updatedBrewery.id], updatedBrewery);
            } else {
              setSelectedBrewery(breweriesData[0]);
            }
          }
        } else {
          console.log('No breweries found for this user');
          setBreweries([]);
          setSelectedBrewery(null);
        }
      } else {
        console.log('No brewery ownership records found for this user');
        setBreweries([]);
        setSelectedBrewery(null);
      }
    } catch (error) {
      console.error('Error fetching breweries:', error);
      toast.error('Failed to load breweries');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = queryClient.getQueryCache().subscribe((event) => {
      if (!user || userType !== 'business') return;
      
      if (event.type === 'updated' || event.type === 'removed') {
        const queryKey = event.query?.queryKey;
        if (Array.isArray(queryKey) && 
            (queryKey[0] === 'breweries' || queryKey[0] === 'brewery')) {
          console.log('Brewery query was updated, refreshing data');
          fetchBreweries();
        }
      }
    });
    
    return () => {
      unsubscribe();
    };
  }, [queryClient, user, userType]);

  useEffect(() => {
    if (user && userType === 'business') {
      fetchBreweries();
    }
  }, [user, userType]);

  useEffect(() => {
    if (!user) return;
    
    console.log('Setting up subscription to brewery_owners table');
    const ownershipChannel = supabase
      .channel('brewery-ownership-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'brewery_owners',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('Brewery ownership change detected:', payload);
          fetchBreweries();
        }
      )
      .subscribe();
      
    return () => {
      console.log('Cleaning up brewery_owners subscription');
      supabase.removeChannel(ownershipChannel);
    };
  }, [user]);

  const handleBrewerySelect = (brewery: Brewery) => {
    setSelectedBrewery(brewery);
  };

  const handleNewBreweryAdded = () => {
    fetchBreweries();
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      navigate('/');
      toast.success('Logged out successfully');
    } catch (error: any) {
      toast.error('Failed to logout. Please try again.');
    }
  };

  return (
    <div className="flex flex-col h-screen">
      <div className="p-4 bg-background/80 backdrop-blur-sm border-b flex justify-between items-center fixed w-full z-50">
        <h1 className="text-xl font-bold">Brewery Dashboard</h1>
        <div className="flex items-center gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <User size={18} />
                <span>{displayName}</span>
                <ChevronDown size={16} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem onClick={() => navigate('/')}>
                <Map className="mr-2" size={18} />
                View Map
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2" size={18} />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <div className="flex-1 pt-[73px] p-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-6">Dashboard</h2>
          
          {userType === 'business' ? (
            <div className="space-y-8">
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h3 className="text-lg font-semibold">Your Breweries</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Select a brewery to manage its venues
                    </p>
                  </div>
                  <Button onClick={() => setIsCreateDialogOpen(true)}>
                    <Plus className="mr-2" size={18} />
                    Add Brewery
                  </Button>
                </div>
                
                <BreweryList 
                  breweries={breweries}
                  selectedBrewery={selectedBrewery}
                  isLoading={isLoading}
                  onBrewerySelect={handleBrewerySelect}
                  onAddBrewery={() => setIsCreateDialogOpen(true)}
                />
                
                <CreateBreweryDialog 
                  open={isCreateDialogOpen} 
                  onOpenChange={setIsCreateDialogOpen}
                  onSuccess={handleNewBreweryAdded}
                />
              </div>
              
              {selectedBrewery && (
                <div>
                  <BreweryInfo breweryId={selectedBrewery.id} />
                </div>
              )}
            </div>
          ) : (
            <p className="text-muted-foreground">
              Welcome to your dashboard{firstName ? `, ${firstName}` : ''}. User features will be added here soon.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

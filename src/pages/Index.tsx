
import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Map from '@/components/Map';
import BreweryForm from '@/components/BreweryForm';
import type { Brewery } from '@/types/brewery';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from '@/components/ui/label';
import { LayoutDashboard } from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, userType } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState<'name' | 'city' | 'country'>('name');
  const [selectedBrewery, setSelectedBrewery] = useState<Brewery | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Use a dedicated navigation function to ensure clean navigation
  const navigateToDashboard = useCallback(() => {
    console.log('Navigating from Map view to Dashboard');
    // Use replace to ensure a clean navigation that removes the current page from history
    navigate('/dashboard', { replace: true });
  }, [navigate]);

  useEffect(() => {
    const type = searchParams.get('type');
    const token = searchParams.get('token');
    
    if ((type === 'recovery' || type === 'signup') && token && !user) {
      console.log('Auth params detected, redirecting to auth page');
      navigate('/auth' + window.location.search);
    }
  }, [navigate, searchParams, user]);

  const { data: breweries = [], isLoading: breweriesLoading, error, refetch } = useQuery({
    queryKey: ['breweries', searchTerm, searchType],
    queryFn: async () => {
      console.log('Fetching breweries with search:', searchTerm, searchType);
      if (!searchTerm) {
        const { data, error } = await supabase
          .from('breweries')
          .select('*');

        if (error) throw error;
        console.log('Fetched all breweries:', data?.length || 0);
        return data || [];
      }

      if (searchType === 'city') {
        console.log('Geocoding city:', searchTerm);
        const { data, error } = await supabase.functions.invoke('geocode-city', {
          body: { city: searchTerm }
        });

        if (error) throw error;
        console.log('Geocoded city results:', data?.length || 0);
        return data || [];
      }

      console.log('Searching breweries by', searchType);
      const { data, error } = await supabase
        .from('breweries')
        .select('*')
        .filter(
          searchType === 'name' 
            ? 'name' 
            : 'country',
          'ilike',
          `%${searchTerm}%`
        );

      if (error) throw error;
      console.log('Search results:', data?.length || 0);
      return data || [];
    }
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      toast.success('Logged in successfully');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      navigate('/');
    } catch (error: any) {
      toast.error('Failed to logout. Please try again.');
    }
  };

  const handleForgotPassword = () => {
    navigate('/auth?forgot=true');
  };

  useEffect(() => {
    if (error) {
      console.error('Error fetching breweries:', error);
      toast.error('Failed to load breweries');
    }
  }, [error]);

  console.log('Index rendering, map should be initialized or reinitialized');

  return (
    <div className="flex flex-col h-screen">
      <div className="p-4 bg-background/80 backdrop-blur-sm border-b flex justify-between items-center fixed w-full z-50">
        <h1 className="text-xl font-bold">Brewery Explorer</h1>
        <div className="flex items-center gap-4">
          {user ? (
            <>
              <span className="text-sm text-muted-foreground">
                {userType === 'business' ? 'Business Account' : 'Regular Account'}
              </span>
              <Button variant="outline" onClick={navigateToDashboard}>
                <LayoutDashboard className="mr-2" size={18} />
                Dashboard
              </Button>
              <Button variant="outline" onClick={handleLogout}>
                Logout
              </Button>
            </>
          ) : (
            <div className="flex gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline">Login</Button>
                </PopoverTrigger>
                <PopoverContent className="w-80">
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <Input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                    </div>
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? 'Loading...' : 'Login'}
                    </Button>
                    <Button
                      type="button"
                      variant="link"
                      className="w-full"
                      onClick={handleForgotPassword}
                    >
                      Forgot your password?
                    </Button>
                  </form>
                </PopoverContent>
              </Popover>
              <Button onClick={() => navigate('/auth')}>Sign Up</Button>
            </div>
          )}
        </div>
      </div>
      <div className="flex-1 min-h-0 pt-[73px]">
        {/* Use a key to force remount when breweries change */}
        <Map
          key={`map-${breweries.length}`}
          breweries={breweries}
          onBrewerySelect={setSelectedBrewery}
        />
      </div>
      {userType === 'business' && (
        <div className="p-6 bg-card border-t">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold mb-4">Add New Brewery</h2>
            <BreweryForm onSubmitSuccess={refetch} />
          </div>
        </div>
      )}
    </div>
  );
};

export default Index;

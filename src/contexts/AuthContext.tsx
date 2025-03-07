
import { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

type AuthContextType = {
  user: User | null;
  userType: 'business' | 'regular' | null;
  loading: boolean;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  userType: null,
  loading: true,
  logout: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userType, setUserType] = useState<'business' | 'regular' | null>(null);
  const [loading, setLoading] = useState(true);

  const logout = async () => {
    try {
      console.log("Starting logout process...");
      setLoading(true);
      
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Logout error:", error.message);
        throw error;
      }
      
      // Clear local state
      setUser(null);
      setUserType(null);
      
      console.log("User logged out successfully");
      toast.success('Logged out successfully');
    } catch (error: any) {
      console.error("Logout error:", error.message);
      toast.error('Failed to logout. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const setupAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          setUser(session.user);
          await fetchUserType(session.user.id);
        }

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
          console.log('Auth event:', event);
          
          if (event === 'SIGNED_OUT') {
            console.log('SIGNED_OUT event - clearing user data');
            setUser(null);
            setUserType(null);
          } else if (session?.user) {
            console.log('Setting user from session');
            setUser(session.user);
            await fetchUserType(session.user.id);
          } else {
            setUser(null);
            setUserType(null);
          }
          
          setLoading(false);
        });

        setLoading(false);
        return () => {
          subscription.unsubscribe();
        };
      } catch (error) {
        console.error('Auth setup error:', error);
        setLoading(false);
      }
    };

    setupAuth();
  }, []);

  const fetchUserType = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('user_type')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching user type:', error);
        return;
      }

      setUserType(data.user_type);
    } catch (error) {
      console.error('Error in fetchUserType:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, userType, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

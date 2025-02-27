
import { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

type AuthContextType = {
  user: User | null;
  userType: 'business' | 'regular' | null;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  userType: null,
  loading: true,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userType, setUserType] = useState<'business' | 'regular' | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Only proceed with auth flow if not in recovery
    const setupAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      // Don't set user if we're in a recovery flow
      if (window.location.search.includes('type=recovery')) {
        console.log('Recovery flow detected, not setting user');
        setLoading(false);
        return;
      }

      setUser(session?.user ?? null);
      
      if (session?.user) {
        await fetchUserType(session.user.id);
      }

      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        // Prevent auth state changes during recovery flow
        if (window.location.search.includes('type=recovery')) {
          console.log('Recovery flow detected in auth change, blocking update');
          return;
        }
        
        setUser(session?.user ?? null);
        if (session?.user) {
          await fetchUserType(session.user.id);
        } else {
          setUserType(null);
        }
        setLoading(false);
      });

      setLoading(false);
      return () => {
        subscription.unsubscribe();
      };
    };

    setupAuth();
  }, []);

  const fetchUserType = async (userId: string) => {
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
  };

  return (
    <AuthContext.Provider value={{ user, userType, loading }}>
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

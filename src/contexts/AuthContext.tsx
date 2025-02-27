
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
    // Skip auth setup if we're in recovery mode
    const params = new URLSearchParams(window.location.search);
    if (params.get('type') === 'recovery') {
      console.log('Recovery flow detected in AuthContext, skipping auth setup');
      setLoading(false);
      return;
    }

    const setupAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      // Double-check we're not in recovery mode
      if (window.location.search.includes('type=recovery')) {
        console.log('Recovery flow detected, skipping session setup');
        setLoading(false);
        return;
      }

      if (session?.user) {
        setUser(session.user);
        await fetchUserType(session.user.id);
      }

      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        // Skip auth changes if in recovery mode
        if (window.location.search.includes('type=recovery')) {
          console.log('Recovery flow detected in auth change, skipping update');
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

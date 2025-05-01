
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

export type UserType = 'admin' | 'business' | 'regular' | null;

export interface AuthContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  userType: UserType;
  setUserType: (userType: UserType) => void;
  loading: boolean;
  firstName: string | null;
  lastName: string | null;
  setFirstName: (firstName: string | null) => void;
  setLastName: (lastName: string | null) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  setUser: () => {},
  userType: null,
  setUserType: () => {},
  loading: true,
  firstName: null,
  lastName: null,
  setFirstName: () => {},
  setLastName: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userType, setUserType] = useState<UserType>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [firstName, setFirstName] = useState<string | null>(null);
  const [lastName, setLastName] = useState<string | null>(null);

  useEffect(() => {
    const getSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          setUser(session.user);
          
          try {
            const { data: profile } = await supabase
              .from('profiles')
              .select('user_type, first_name, last_name')
              .eq('id', session.user.id)
              .single();
            
            if (profile) {
              setUserType(profile.user_type);
              setFirstName(profile.first_name);
              setLastName(profile.last_name);
            }
          } catch (err) {
            console.error('Error fetching user profile:', err);
            setUserType('regular');
          }
        }
      } catch (error) {
        console.error('Error getting session:', error);
      } finally {
        setLoading(false);
      }
    };

    getSession();
  }, []);

  const value = {
    user,
    setUser,
    userType,
    setUserType,
    loading,
    firstName,
    lastName,
    setFirstName,
    setLastName,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

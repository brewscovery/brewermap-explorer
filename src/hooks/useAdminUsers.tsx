
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { callEdgeFunction } from '@/utils/adminApiUtils';
import { UserData } from '@/types/admin';

// Hook for fetching users for admin panel
export const useUsers = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  
  // Debounce search input
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);
    
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);
  
  const fetchUsers = async () => {
    try {
      const data = await callEdgeFunction('admin-get-users', { 
        searchQuery: debouncedSearchQuery 
      });
      return data.users as UserData[];
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  };
  
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['admin', 'users', debouncedSearchQuery],
    queryFn: fetchUsers
  });
  
  return {
    data,
    isLoading,
    error,
    searchQuery,
    setSearchQuery,
    refetch
  };
};

// Hook for updating user type
export const useUpdateUserType = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      userId, 
      userType 
    }: { 
      userId: string; 
      userType: 'admin' | 'business' | 'regular' 
    }) => {
      try {
        const data = await callEdgeFunction('admin-update-user', { userId, userType });
        return data.user;
      } catch (error) {
        console.error('Error updating user type:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      toast.success('User type updated successfully');
    },
    onError: (error: any) => {
      toast.error(`User type update failed: ${error.message}`);
    }
  });
};

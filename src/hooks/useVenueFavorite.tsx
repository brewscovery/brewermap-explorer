
import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

export const useVenueFavorite = (venueId: string | null) => {
  const queryClient = useQueryClient();
  const { user, userType } = useAuth();
  const navigate = useNavigate();
  const [isRedirectPending, setIsRedirectPending] = useState(false);

  // Query to check if the user has favorited this venue
  const { data: isFavorited, isLoading: isCheckingFavorite } = useQuery({
    queryKey: ['venueFavorite', venueId, user?.id],
    queryFn: async () => {
      if (!user || !venueId) return false;
      
      const { data, error } = await supabase
        .from('venue_favorites')
        .select('id')
        .eq('venue_id', venueId)
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (error) throw error;
      
      return !!data;
    },
    enabled: !!user && !!venueId
  });

  // Count how many users have favorited this venue
  const { data: favoritesCount = 0 } = useQuery({
    queryKey: ['venueFavoritesCount', venueId],
    queryFn: async () => {
      if (!venueId) return 0;
      
      const { count, error } = await supabase
        .from('venue_favorites')
        .select('*', { count: 'exact', head: true })
        .eq('venue_id', venueId);
      
      if (error) throw error;
      
      return count || 0;
    },
    enabled: !!venueId
  });

  // Mutation to toggle favorites
  const toggleFavoriteMutation = useMutation({
    mutationFn: async () => {
      if (!user) {
        // For unauthenticated users, store the venue ID and redirect to login
        localStorage.setItem('pendingVenueFavorite', venueId || '');
        setIsRedirectPending(true);
        navigate('/auth');
        return null;
      }

      if (!venueId) {
        throw new Error('Venue ID is required');
      }

      if (isFavorited) {
        // Remove favorite
        const { error } = await supabase
          .from('venue_favorites')
          .delete()
          .eq('venue_id', venueId)
          .eq('user_id', user.id);
        
        if (error) throw error;
        return false;
      } else {
        // Add favorite
        const { error } = await supabase
          .from('venue_favorites')
          .insert({
            venue_id: venueId,
            user_id: user.id
          });
        
        if (error) throw error;
        return true;
      }
    },
    onSuccess: (newFavoriteState) => {
      if (newFavoriteState === null) {
        // Handled by auth redirect
        return;
      }

      // Update local state optimistically
      queryClient.setQueryData(
        ['venueFavorite', venueId, user?.id], 
        newFavoriteState
      );

      // Update the count optimistically
      const currentCount = queryClient.getQueryData(['venueFavoritesCount', venueId]) as number || 0;
      queryClient.setQueryData(
        ['venueFavoritesCount', venueId],
        newFavoriteState ? currentCount + 1 : Math.max(currentCount - 1, 0)
      );

      // Invalidate both queries
      queryClient.invalidateQueries({ 
        queryKey: ['venueFavorite', venueId, user?.id]
      });
      
      queryClient.invalidateQueries({ 
        queryKey: ['venueFavoritesCount', venueId]
      });

      // Show toast notification
      if (newFavoriteState) {
        toast.success('Venue added to favorites');
      } else {
        toast.success('Venue removed from favorites');
      }
    },
    onError: (error) => {
      console.error('Error toggling venue favorite:', error);
      toast.error('Failed to update favorites');
    }
  });

  // Check if the follow button should be shown
  const showFollowButton = userType === 'regular' || userType === 'admin' || !user;

  return {
    isFavorited: isFavorited || false,
    favoritesCount,
    isLoading: isCheckingFavorite,
    toggleFavorite: toggleFavoriteMutation.mutate,
    showFollowButton,
    isRedirectPending
  };
};


import { useOptimizedQuery } from './useOptimizedQuery';
import { supabase } from '@/integrations/supabase/client';
import { QueryPriority, getQueryConfig } from '@/utils/queryConfig';
import type { Database } from '@/integrations/supabase/types';

// Get the table names from the Database type
type TableName = keyof Database['public']['Tables'];

// Optimized hook for Supabase queries with connection pooling
export function useOptimizedSupabaseQuery<T>(
  queryKey: string[],
  tableName: TableName,
  queryFn: () => Promise<T>,
  priority: keyof typeof QueryPriority = 'NORMAL',
  customStaleTime?: number,
  enabled?: boolean
) {
  const config = getQueryConfig(priority, customStaleTime);
  
  return useOptimizedQuery<T>({
    queryKey,
    queryFn,
    priority: config.priority,
    staleTime: config.staleTime,
    gcTime: config.gcTime,
    enabled: enabled ?? true,
  });
}

// Example usage hooks for common patterns
export function useOptimizedVenues(searchParams?: any) {
  return useOptimizedSupabaseQuery(
    ['venues', searchParams],
    'venues',
    async () => {
      const { data, error } = await supabase.from('venues').select('*');
      if (error) throw error;
      return data;
    },
    'NORMAL'
  );
}

export function useOptimizedUserProfile(userId: string) {
  return useOptimizedSupabaseQuery(
    ['profiles', userId],
    'profiles',
    async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      if (error) throw error;
      return data;
    },
    'CRITICAL',
    30000 // 30 seconds stale time for user profiles
  );
}

export function useOptimizedNotifications(userId: string) {
  return useOptimizedSupabaseQuery(
    ['notifications', userId],
    'notifications',
    async () => {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(50);
      if (error) throw error;
      return data;
    },
    'HIGH'
  );
}

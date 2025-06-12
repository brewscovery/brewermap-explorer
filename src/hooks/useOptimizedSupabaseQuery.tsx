
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
  queryBuilder: (query: any) => any,
  priority: keyof typeof QueryPriority = 'NORMAL',
  customStaleTime?: number
) {
  const config = getQueryConfig(priority, customStaleTime);
  
  return useOptimizedQuery<T>({
    queryKey,
    queryFn: async () => {
      const query = queryBuilder(supabase.from(tableName));
      const { data, error } = await query;
      
      if (error) {
        throw error;
      }
      
      return data;
    },
    priority: config.priority,
    staleTime: config.staleTime,
    gcTime: config.gcTime,
  });
}

// Example usage hooks for common patterns
export function useOptimizedVenues(searchParams?: any) {
  return useOptimizedSupabaseQuery(
    ['venues', searchParams],
    'venues',
    (query) => query.select('*'),
    'NORMAL'
  );
}

export function useOptimizedUserProfile(userId: string) {
  return useOptimizedSupabaseQuery(
    ['profiles', userId],
    'profiles',
    (query) => query.select('*').eq('id', userId).single(),
    'CRITICAL',
    30000 // 30 seconds stale time for user profiles
  );
}

export function useOptimizedNotifications(userId: string) {
  return useOptimizedSupabaseQuery(
    ['notifications', userId],
    'notifications',
    (query) => query
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50),
    'HIGH'
  );
}

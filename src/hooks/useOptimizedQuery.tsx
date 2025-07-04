
import { useQuery, UseQueryOptions, useQueryClient } from '@tanstack/react-query';
import { connectionManager } from '@/services/ConnectionManager';
import { useInvalidationManager } from '@/contexts/InvalidationContext';

interface OptimizedQueryOptions<T> extends Omit<UseQueryOptions<T>, 'queryFn'> {
  queryFn: () => Promise<T>;
  priority?: number;
  enableBatching?: boolean;
  smartInvalidation?: boolean;
}

export function useOptimizedQuery<T>(
  options: OptimizedQueryOptions<T>
) {
  const queryClient = useQueryClient();
  const invalidationManager = useInvalidationManager();
  
  const {
    queryFn,
    priority = 1,
    enableBatching = false,
    smartInvalidation = true,
    staleTime = 1000 * 60 * 5, // 5 minutes default
    gcTime = 1000 * 60 * 10, // 10 minutes default
    ...queryOptions
  } = options;

  return useQuery({
    ...queryOptions,
    queryFn: () => connectionManager.executeQuery(queryFn, priority),
    staleTime,
    gcTime,
    // Reduce background refetching to save connections
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    refetchOnMount: true,
    // Add retry with exponential backoff
    retry: (failureCount, error) => {
      if (failureCount >= 3) return false;
      const isTimeoutError = error instanceof Error && error.message.includes('timeout');
      const isConnectionError = error instanceof Error && error.message.includes('connection');
      return isTimeoutError || isConnectionError;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    // Custom meta for invalidation tracking
    meta: {
      smartInvalidation,
      priority,
      ...options.meta
    }
  });
}

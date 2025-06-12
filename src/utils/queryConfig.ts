
// Optimized React Query configuration for high-load scenarios
export const optimizedQueryConfig = {
  defaultOptions: {
    queries: {
      // Reduce background refetching to save connections
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      refetchOnMount: true,
      
      // Longer stale times to reduce unnecessary requests
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes (was cacheTime)
      
      // Smart retry strategy
      retry: (failureCount: number, error: any) => {
        if (failureCount >= 3) return false;
        const isNetworkError = error?.message?.includes('fetch') || 
                              error?.message?.includes('network') ||
                              error?.message?.includes('timeout');
        return isNetworkError;
      },
      
      // Exponential backoff with jitter
      retryDelay: (attemptIndex: number) => {
        const baseDelay = Math.min(1000 * 2 ** attemptIndex, 30000);
        const jitter = Math.random() * 1000;
        return baseDelay + jitter;
      },
    },
  },
};

// Query priorities for the connection manager
export const QueryPriority = {
  CRITICAL: 10,     // User authentication, critical user actions
  HIGH: 7,          // User data, primary content
  NORMAL: 5,        // General content, secondary data
  LOW: 3,           // Analytics, non-essential data
  BACKGROUND: 1,    // Prefetching, background updates
} as const;

// Common query configurations for different data types
export const getQueryConfig = (type: keyof typeof QueryPriority, customStaleTime?: number) => ({
  priority: QueryPriority[type],
  staleTime: customStaleTime || (type === 'CRITICAL' ? 30000 : 300000), // 30s for critical, 5min for others
  gcTime: type === 'CRITICAL' ? 60000 : 600000, // 1min for critical, 10min for others
});


import { QueryClient } from '@tanstack/react-query';

interface QueryDependency {
  pattern: string[];
  dependsOn: string[][];
}

interface InvalidationBatch {
  queries: string[][];
  timestamp: number;
}

class InvalidationManager {
  private queryClient: QueryClient;
  private dependencies: QueryDependency[] = [];
  private batchTimeout: NodeJS.Timeout | null = null;
  private pendingInvalidations: Set<string> = new Set();
  
  constructor(queryClient: QueryClient) {
    this.queryClient = queryClient;
    this.initializeDependencies();
  }

  private initializeDependencies() {
    // Define query dependencies - when one invalidates, related queries should too
    this.dependencies = [
      // Brewery related dependencies
      {
        pattern: ['brewery'],
        dependsOn: [['breweries'], ['brewery-venues'], ['brewery-claims']]
      },
      {
        pattern: ['breweries'],
        dependsOn: [['brewery-stats'], ['admin', 'stats']]
      },
      // Venue related dependencies
      {
        pattern: ['venue'],
        dependsOn: [['venues'], ['venue-events'], ['venue-hours'], ['venue-happy-hours'], ['venue-daily-specials']]
      },
      {
        pattern: ['venues'],
        dependsOn: [['breweryVenues'], ['venue-analytics']]
      },
      // User related dependencies
      {
        pattern: ['profile'],
        dependsOn: [['notifications'], ['checkins'], ['venue-favorites']]
      },
      // Event related dependencies
      {
        pattern: ['venue-events'],
        dependsOn: [['events'], ['multipleVenueEvents'], ['event-interests']]
      }
    ];
  }

  // Smart invalidation with dependency resolution
  invalidateQueries(queryKey: string[], options?: { exact?: boolean; skipDependencies?: boolean }) {
    const keyString = JSON.stringify(queryKey);
    
    // Add to pending invalidations
    this.pendingInvalidations.add(keyString);
    
    // Batch invalidations to avoid rapid successive calls
    if (this.batchTimeout) {
      clearTimeout(this.batchTimeout);
    }
    
    this.batchTimeout = setTimeout(() => {
      this.processBatchedInvalidations();
    }, 100); // 100ms batching window
  }

  private processBatchedInvalidations() {
    const allInvalidations = new Set<string>();
    
    // Process each pending invalidation
    for (const keyString of this.pendingInvalidations) {
      const queryKey = JSON.parse(keyString);
      allInvalidations.add(keyString);
      
      // Find and add dependent queries
      if (!this.shouldSkipDependencies(queryKey)) {
        const dependencies = this.findDependencies(queryKey);
        dependencies.forEach(dep => allInvalidations.add(JSON.stringify(dep)));
      }
    }
    
    // Execute all invalidations
    for (const keyString of allInvalidations) {
      const queryKey = JSON.parse(keyString);
      this.queryClient.invalidateQueries({ queryKey });
    }
    
    console.log(`[InvalidationManager] Processed ${allInvalidations.size} invalidations from ${this.pendingInvalidations.size} triggers`);
    
    // Clear pending invalidations
    this.pendingInvalidations.clear();
    this.batchTimeout = null;
  }

  private findDependencies(queryKey: string[]): string[][] {
    const dependencies: string[][] = [];
    
    for (const dep of this.dependencies) {
      if (this.matchesPattern(queryKey, dep.pattern)) {
        dependencies.push(...dep.dependsOn);
      }
    }
    
    return dependencies;
  }

  private matchesPattern(queryKey: string[], pattern: string[]): boolean {
    if (pattern.length > queryKey.length) return false;
    
    for (let i = 0; i < pattern.length; i++) {
      if (pattern[i] !== queryKey[i]) return false;
    }
    
    return true;
  }

  private shouldSkipDependencies(queryKey: string[]): boolean {
    // Skip dependency resolution for background updates
    return queryKey.includes('background') || queryKey.includes('analytics');
  }

  // Direct cache updates for real-time data
  updateQueryData<T>(queryKey: string[], updater: (old: T | undefined) => T) {
    this.queryClient.setQueryData(queryKey, updater);
    console.log(`[InvalidationManager] Direct cache update for:`, queryKey);
  }

  // Selective invalidation based on specific changes
  invalidateByEntity(entityType: string, entityId: string, changeType: 'create' | 'update' | 'delete') {
    const patterns = this.getInvalidationPatterns(entityType, entityId, changeType);
    
    patterns.forEach(pattern => {
      this.invalidateQueries(pattern, { skipDependencies: changeType === 'delete' });
    });
  }

  private getInvalidationPatterns(entityType: string, entityId: string, changeType: string): string[][] {
    const patterns: string[][] = [];
    
    switch (entityType) {
      case 'brewery':
        patterns.push(['brewery', entityId]);
        if (changeType !== 'update') {
          patterns.push(['breweries']);
        }
        break;
      case 'venue':
        patterns.push(['venues']);
        patterns.push(['breweryVenues', entityId]);
        break;
      case 'event':
        patterns.push(['venueEvents', entityId]);
        patterns.push(['events']);
        break;
      case 'notification':
        patterns.push(['notifications', entityId]);
        break;
    }
    
    return patterns;
  }

  // Get cache statistics
  getCacheStats() {
    const cache = this.queryClient.getQueryCache();
    const queries = cache.getAll();
    
    return {
      totalQueries: queries.length,
      staleQueries: queries.filter(q => q.isStale()).length,
      fetchingQueries: queries.filter(q => q.state.fetchStatus === 'fetching').length,
      errorQueries: queries.filter(q => q.state.status === 'error').length
    };
  }
}

export default InvalidationManager;

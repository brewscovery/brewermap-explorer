
import { QueryClient } from '@tanstack/react-query';

interface QueryDependency {
  pattern: string[];
  dependsOn: string[][];
}

interface InvalidationBatch {
  queries: string[][];
  timestamp: number;
  priority: 'low' | 'normal' | 'high';
}

interface CacheUpdateStats {
  directUpdates: number;
  invalidations: number;
  batchedInvalidations: number;
  lastResetTime: number;
}

class InvalidationManager {
  private queryClient: QueryClient;
  private dependencies: QueryDependency[] = [];
  private batchTimeout: NodeJS.Timeout | null = null;
  private pendingInvalidations: Map<string, InvalidationBatch> = new Map();
  private stats: CacheUpdateStats = {
    directUpdates: 0,
    invalidations: 0,
    batchedInvalidations: 0,
    lastResetTime: Date.now()
  };
  
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
        pattern: ['profiles'],
        dependsOn: [['notifications'], ['checkins'], ['venue-favorites']]
      },
      // Event related dependencies
      {
        pattern: ['venue-events'],
        dependsOn: [['events'], ['multipleVenueEvents'], ['event-interests']]
      }
    ];
  }

  // Smart invalidation with priority and dependency resolution
  invalidateQueries(
    queryKey: string[], 
    options?: { 
      exact?: boolean; 
      skipDependencies?: boolean; 
      priority?: 'low' | 'normal' | 'high';
      debounce?: boolean;
    }
  ) {
    const { 
      exact = false, 
      skipDependencies = false, 
      priority = 'normal',
      debounce = true 
    } = options || {};
    
    const keyString = JSON.stringify(queryKey);
    
    if (debounce) {
      // Add to pending invalidations with priority
      this.pendingInvalidations.set(keyString, {
        queries: [queryKey],
        timestamp: Date.now(),
        priority
      });
      
      // Batch invalidations to avoid rapid successive calls
      if (this.batchTimeout) {
        clearTimeout(this.batchTimeout);
      }
      
      // Adjust batching window based on priority
      const batchWindow = priority === 'high' ? 50 : priority === 'normal' ? 100 : 200;
      
      this.batchTimeout = setTimeout(() => {
        this.processBatchedInvalidations();
      }, batchWindow);
    } else {
      // Immediate invalidation
      this.executeInvalidation(queryKey, { exact, skipDependencies });
    }
  }

  private processBatchedInvalidations() {
    const allInvalidations = new Map<string, { queryKey: string[], priority: 'low' | 'normal' | 'high' }>();
    
    // Group invalidations by priority
    const priorityGroups: Record<'high' | 'normal' | 'low', string[][]> = {
      high: [],
      normal: [],
      low: []
    };
    
    // Process each pending invalidation
    for (const [keyString, batch] of this.pendingInvalidations) {
      const queryKey = JSON.parse(keyString);
      allInvalidations.set(keyString, { queryKey, priority: batch.priority });
      priorityGroups[batch.priority].push(queryKey);
      
      // Find and add dependent queries if not skipped
      if (!this.shouldSkipDependencies(queryKey)) {
        const dependencies = this.findDependencies(queryKey);
        dependencies.forEach(dep => {
          const depKeyString = JSON.stringify(dep);
          if (!allInvalidations.has(depKeyString)) {
            allInvalidations.set(depKeyString, { queryKey: dep, priority: batch.priority });
            priorityGroups[batch.priority].push(dep);
          }
        });
      }
    }
    
    // Execute invalidations in priority order
    const executeInPriorityOrder = async () => {
      for (const priority of ['high', 'normal', 'low'] as const) {
        if (priorityGroups[priority].length > 0) {
          await Promise.all(
            priorityGroups[priority].map(queryKey => 
              this.executeInvalidation(queryKey, { exact: false, skipDependencies: true })
            )
          );
        }
      }
    };
    
    executeInPriorityOrder();
    
    this.stats.batchedInvalidations += allInvalidations.size;
    console.log(`[InvalidationManager] Processed ${allInvalidations.size} invalidations from ${this.pendingInvalidations.size} triggers`);
    
    // Clear pending invalidations
    this.pendingInvalidations.clear();
    this.batchTimeout = null;
  }

  private async executeInvalidation(
    queryKey: string[], 
    options: { exact?: boolean; skipDependencies?: boolean } = {}
  ) {
    const { exact = false } = options;
    
    try {
      if (exact) {
        await this.queryClient.invalidateQueries({ queryKey, exact: true });
      } else {
        await this.queryClient.invalidateQueries({ queryKey });
      }
      
      this.stats.invalidations++;
      console.log(`[InvalidationManager] Invalidated query:`, queryKey);
    } catch (error) {
      console.error(`[InvalidationManager] Error invalidating query:`, queryKey, error);
    }
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
    // Skip dependency resolution for background updates and analytics
    return queryKey.some(key => 
      typeof key === 'string' && 
      (key.includes('background') || key.includes('analytics') || key.includes('stats'))
    );
  }

  // Enhanced direct cache updates with change detection
  updateQueryData<T>(
    queryKey: string[], 
    updater: (old: T | undefined) => T,
    options?: { 
      skipInvalidation?: boolean;
      compareChanges?: boolean;
    }
  ) {
    const { skipInvalidation = false, compareChanges = true } = options || {};
    
    if (compareChanges) {
      const currentData = this.queryClient.getQueryData<T>(queryKey);
      const newData = updater(currentData);
      
      // Simple change detection - can be enhanced based on data types
      if (JSON.stringify(currentData) === JSON.stringify(newData)) {
        console.log(`[InvalidationManager] No changes detected for:`, queryKey);
        return;
      }
    }
    
    this.queryClient.setQueryData(queryKey, updater);
    this.stats.directUpdates++;
    console.log(`[InvalidationManager] Direct cache update for:`, queryKey);
    
    // Optionally invalidate related queries
    if (!skipInvalidation) {
      const dependencies = this.findDependencies(queryKey);
      if (dependencies.length > 0) {
        this.invalidateQueries(queryKey, { 
          skipDependencies: true, 
          priority: 'low',
          debounce: true 
        });
      }
    }
  }

  // Enhanced selective invalidation with change type awareness
  invalidateByEntity(
    entityType: string, 
    entityId: string, 
    changeType: 'create' | 'update' | 'delete',
    options?: { priority?: 'low' | 'normal' | 'high' }
  ) {
    const { priority = 'normal' } = options || {};
    const patterns = this.getInvalidationPatterns(entityType, entityId, changeType);
    
    patterns.forEach(pattern => {
      this.invalidateQueries(pattern, { 
        skipDependencies: changeType === 'delete',
        priority: changeType === 'delete' ? 'high' : priority
      });
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
        // Only invalidate stats on updates, not creates/deletes
        if (changeType === 'update') {
          patterns.push(['brewery-stats', entityId]);
        }
        break;
      case 'venue':
        patterns.push(['venue', entityId]);
        if (changeType !== 'update') {
          patterns.push(['venues']);
        }
        // Venue-specific invalidations
        patterns.push(['venue-hours', entityId]);
        patterns.push(['venue-events', entityId]);
        break;
      case 'event':
        patterns.push(['venue-events', entityId]);
        patterns.push(['events']);
        break;
      case 'notification':
        patterns.push(['notifications', entityId]);
        break;
      case 'checkin':
        patterns.push(['checkins', entityId]);
        patterns.push(['user-analytics', entityId]);
        break;
    }
    
    return patterns;
  }

  // Enhanced cache statistics with performance metrics
  getCacheStats() {
    const cache = this.queryClient.getQueryCache();
    const queries = cache.getAll();
    
    const stats = {
      // Basic query stats
      totalQueries: queries.length,
      staleQueries: queries.filter(q => q.isStale()).length,
      fetchingQueries: queries.filter(q => q.state.fetchStatus === 'fetching').length,
      errorQueries: queries.filter(q => q.state.status === 'error').length,
      
      // Invalidation manager stats
      performance: {
        directUpdates: this.stats.directUpdates,
        invalidations: this.stats.invalidations,
        batchedInvalidations: this.stats.batchedInvalidations,
        uptimeMinutes: Math.round((Date.now() - this.stats.lastResetTime) / 1000 / 60),
        efficiency: this.stats.directUpdates / (this.stats.directUpdates + this.stats.invalidations) || 0
      },
      
      // Cache efficiency metrics
      cacheHitRate: this.calculateCacheHitRate(),
      memoryUsage: this.estimateMemoryUsage(queries)
    };
    
    return stats;
  }

  private calculateCacheHitRate(): number {
    // Simple estimation based on fresh vs stale queries
    const cache = this.queryClient.getQueryCache();
    const queries = cache.getAll();
    const freshQueries = queries.filter(q => !q.isStale()).length;
    
    return queries.length > 0 ? freshQueries / queries.length : 0;
  }

  private estimateMemoryUsage(queries: any[]): { estimatedKB: number; queriesWithData: number } {
    let totalSize = 0;
    let queriesWithData = 0;
    
    queries.forEach(query => {
      if (query.state.data) {
        queriesWithData++;
        // Rough estimation of data size
        try {
          totalSize += JSON.stringify(query.state.data).length;
        } catch {
          // Handle circular references or other JSON issues
          totalSize += 1000; // Rough estimate
        }
      }
    });
    
    return {
      estimatedKB: Math.round(totalSize / 1024),
      queriesWithData
    };
  }

  // Reset statistics
  resetStats() {
    this.stats = {
      directUpdates: 0,
      invalidations: 0,
      batchedInvalidations: 0,
      lastResetTime: Date.now()
    };
  }

  // Force immediate processing of pending invalidations
  flushPendingInvalidations() {
    if (this.batchTimeout) {
      clearTimeout(this.batchTimeout);
      this.processBatchedInvalidations();
    }
  }
}

export default InvalidationManager;

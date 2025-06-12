
import { supabase } from '@/integrations/supabase/client';

interface ConnectionConfig {
  maxConnections: number;
  connectionTimeout: number;
  idleTimeout: number;
  retryAttempts: number;
  retryDelay: number;
}

interface QueuedQuery {
  id: string;
  query: () => Promise<any>;
  resolve: (value: any) => void;
  reject: (error: any) => void;
  priority: number;
  timestamp: number;
}

class ConnectionManager {
  private static instance: ConnectionManager;
  private activeConnections = 0;
  private queryQueue: QueuedQuery[] = [];
  private isProcessingQueue = false;
  private config: ConnectionConfig;
  private connectionStats = {
    totalQueries: 0,
    successfulQueries: 0,
    failedQueries: 0,
    averageResponseTime: 0,
    peakConnections: 0
  };

  private constructor() {
    this.config = {
      maxConnections: 8, // Conservative limit
      connectionTimeout: 30000,
      idleTimeout: 60000,
      retryAttempts: 3,
      retryDelay: 1000
    };
  }

  static getInstance(): ConnectionManager {
    if (!ConnectionManager.instance) {
      ConnectionManager.instance = new ConnectionManager();
    }
    return ConnectionManager.instance;
  }

  async executeQuery<T>(
    queryFn: () => Promise<T>,
    priority: number = 1,
    retries: number = 0
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      const queryId = crypto.randomUUID();
      const queuedQuery: QueuedQuery = {
        id: queryId,
        query: queryFn,
        resolve,
        reject,
        priority,
        timestamp: Date.now()
      };

      this.queryQueue.push(queuedQuery);
      this.queryQueue.sort((a, b) => b.priority - a.priority || a.timestamp - b.timestamp);
      
      this.processQueue();
    });
  }

  private async processQueue(): Promise<void> {
    if (this.isProcessingQueue || this.queryQueue.length === 0) {
      return;
    }

    if (this.activeConnections >= this.config.maxConnections) {
      console.log(`Connection pool full (${this.activeConnections}/${this.config.maxConnections}). Queuing request.`);
      return;
    }

    this.isProcessingQueue = true;
    const query = this.queryQueue.shift();

    if (!query) {
      this.isProcessingQueue = false;
      return;
    }

    this.activeConnections++;
    this.connectionStats.peakConnections = Math.max(
      this.connectionStats.peakConnections,
      this.activeConnections
    );

    const startTime = Date.now();

    try {
      console.log(`Executing query ${query.id} (${this.activeConnections}/${this.config.maxConnections} connections)`);
      
      const result = await Promise.race([
        query.query(),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Query timeout')), this.config.connectionTimeout)
        )
      ]);

      const responseTime = Date.now() - startTime;
      this.updateStats(true, responseTime);
      
      query.resolve(result);
    } catch (error) {
      console.error(`Query ${query.id} failed:`, error);
      this.updateStats(false, Date.now() - startTime);
      query.reject(error);
    } finally {
      this.activeConnections--;
      this.isProcessingQueue = false;
      
      // Process next query in queue
      setTimeout(() => this.processQueue(), 10);
    }
  }

  private updateStats(success: boolean, responseTime: number): void {
    this.connectionStats.totalQueries++;
    if (success) {
      this.connectionStats.successfulQueries++;
    } else {
      this.connectionStats.failedQueries++;
    }
    
    // Update running average
    const totalSuccessful = this.connectionStats.successfulQueries;
    this.connectionStats.averageResponseTime = 
      (this.connectionStats.averageResponseTime * (totalSuccessful - 1) + responseTime) / totalSuccessful;
  }

  getStats() {
    return {
      ...this.connectionStats,
      activeConnections: this.activeConnections,
      queuedQueries: this.queryQueue.length,
      successRate: this.connectionStats.totalQueries > 0 
        ? (this.connectionStats.successfulQueries / this.connectionStats.totalQueries) * 100 
        : 0
    };
  }

  // Method to batch multiple queries
  async batchQueries<T>(queries: Array<() => Promise<T>>, batchSize: number = 3): Promise<T[]> {
    const results: T[] = [];
    
    for (let i = 0; i < queries.length; i += batchSize) {
      const batch = queries.slice(i, i + batchSize);
      const batchPromises = batch.map(query => this.executeQuery(query, 2)); // Higher priority for batched queries
      
      try {
        const batchResults = await Promise.all(batchPromises);
        results.push(...batchResults);
      } catch (error) {
        console.error('Batch query failed:', error);
        throw error;
      }
      
      // Small delay between batches to prevent overwhelming
      if (i + batchSize < queries.length) {
        await new Promise(resolve => setTimeout(resolve, 50));
      }
    }
    
    return results;
  }
}

export const connectionManager = ConnectionManager.getInstance();

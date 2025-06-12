
interface BatchableQuery {
  id: string;
  table: string;
  operation: 'select' | 'insert' | 'update' | 'delete';
  params: any;
  resolve: (result: any) => void;
  reject: (error: any) => void;
  timestamp: number;
}

class QueryBatcher {
  private static instance: QueryBatcher;
  private batches: Map<string, BatchableQuery[]> = new Map();
  private batchTimeouts: Map<string, NodeJS.Timeout> = new Map();
  private readonly batchSize = 10;
  private readonly batchTimeout = 100; // ms

  static getInstance(): QueryBatcher {
    if (!QueryBatcher.instance) {
      QueryBatcher.instance = new QueryBatcher();
    }
    return QueryBatcher.instance;
  }

  addToBatch(query: Omit<BatchableQuery, 'id' | 'timestamp'>): Promise<any> {
    return new Promise((resolve, reject) => {
      const batchableQuery: BatchableQuery = {
        ...query,
        id: crypto.randomUUID(),
        timestamp: Date.now(),
        resolve,
        reject
      };

      const batchKey = `${query.table}_${query.operation}`;
      
      if (!this.batches.has(batchKey)) {
        this.batches.set(batchKey, []);
      }
      
      const batch = this.batches.get(batchKey)!;
      batch.push(batchableQuery);

      // If batch is full, process immediately
      if (batch.length >= this.batchSize) {
        this.processBatch(batchKey);
      } else {
        // Set timeout to process batch
        if (this.batchTimeouts.has(batchKey)) {
          clearTimeout(this.batchTimeouts.get(batchKey)!);
        }
        
        const timeout = setTimeout(() => {
          this.processBatch(batchKey);
        }, this.batchTimeout);
        
        this.batchTimeouts.set(batchKey, timeout);
      }
    });
  }

  private async processBatch(batchKey: string): Promise<void> {
    const batch = this.batches.get(batchKey);
    if (!batch || batch.length === 0) return;

    // Clear batch and timeout
    this.batches.set(batchKey, []);
    const timeout = this.batchTimeouts.get(batchKey);
    if (timeout) {
      clearTimeout(timeout);
      this.batchTimeouts.delete(batchKey);
    }

    const [table, operation] = batchKey.split('_');
    
    try {
      console.log(`Processing batch of ${batch.length} ${operation} operations for ${table}`);
      
      switch (operation) {
        case 'select':
          await this.processBatchedSelects(table, batch);
          break;
        case 'insert':
          await this.processBatchedInserts(table, batch);
          break;
        case 'update':
          await this.processBatchedUpdates(table, batch);
          break;
        default:
          // For operations that can't be batched, execute individually
          for (const query of batch) {
            try {
              const result = await this.executeSingleQuery(query);
              query.resolve(result);
            } catch (error) {
              query.reject(error);
            }
          }
      }
    } catch (error) {
      console.error(`Batch processing failed for ${batchKey}:`, error);
      batch.forEach(query => query.reject(error));
    }
  }

  private async processBatchedSelects(table: string, batch: BatchableQuery[]): Promise<void> {
    // Group by similar select parameters
    const groupedQueries = new Map<string, BatchableQuery[]>();
    
    for (const query of batch) {
      const key = JSON.stringify(query.params);
      if (!groupedQueries.has(key)) {
        groupedQueries.set(key, []);
      }
      groupedQueries.get(key)!.push(query);
    }

    // Execute each group
    for (const [paramsKey, queries] of groupedQueries) {
      try {
        const params = JSON.parse(paramsKey);
        const result = await this.executeSingleQuery(queries[0]);
        
        // Return same result to all queries with same parameters
        queries.forEach(query => query.resolve(result));
      } catch (error) {
        queries.forEach(query => query.reject(error));
      }
    }
  }

  private async processBatchedInserts(table: string, batch: BatchableQuery[]): Promise<void> {
    try {
      const insertData = batch.map(query => query.params);
      const result = await this.executeBatchInsert(table, insertData);
      
      // Assuming result contains inserted records in order
      batch.forEach((query, index) => {
        query.resolve(result[index] || result);
      });
    } catch (error) {
      batch.forEach(query => query.reject(error));
    }
  }

  private async processBatchedUpdates(table: string, batch: BatchableQuery[]): Promise<void> {
    // Updates are harder to batch safely, so execute individually for now
    for (const query of batch) {
      try {
        const result = await this.executeSingleQuery(query);
        query.resolve(result);
      } catch (error) {
        query.reject(error);
      }
    }
  }

  private async executeSingleQuery(query: BatchableQuery): Promise<any> {
    // This would use your existing Supabase client
    // Implementation depends on the specific query structure
    throw new Error('executeSingleQuery needs to be implemented based on your query structure');
  }

  private async executeBatchInsert(table: string, data: any[]): Promise<any> {
    // This would use your existing Supabase client for batch insert
    // Implementation depends on the specific query structure
    throw new Error('executeBatchInsert needs to be implemented based on your query structure');
  }
}

export const queryBatcher = QueryBatcher.getInstance();

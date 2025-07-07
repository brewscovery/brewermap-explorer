import type { Venue } from '@/types/venue';

interface CacheData<T> {
  data: T;
  timestamp: number;
  version: string;
}

const CACHE_VERSION = '1.0.0';
const CACHE_EXPIRY = 10 * 60 * 1000; // 10 minutes

class PWACache {
  private dbName = 'brewscovery-cache';
  private dbVersion = 1;
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Create object stores
        if (!db.objectStoreNames.contains('venues')) {
          db.createObjectStore('venues', { keyPath: 'key' });
        }
        if (!db.objectStoreNames.contains('metadata')) {
          db.createObjectStore('metadata', { keyPath: 'key' });
        }
      };
    });
  }

  async setVenues(venues: Venue[]): Promise<void> {
    if (!this.db) await this.init();
    
    const cacheData: CacheData<Venue[]> = {
      data: venues,
      timestamp: Date.now(),
      version: CACHE_VERSION
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['venues'], 'readwrite');
      const store = transaction.objectStore('venues');
      const request = store.put({ key: 'basic-venues', ...cacheData });
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getVenues(): Promise<Venue[] | null> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['venues'], 'readonly');
      const store = transaction.objectStore('venues');
      const request = store.get('basic-venues');
      
      request.onsuccess = () => {
        const result = request.result;
        if (!result) {
          resolve(null);
          return;
        }

        const cacheData = result as CacheData<Venue[]>;
        
        // Check if cache is expired or version mismatch
        if (
          Date.now() - cacheData.timestamp > CACHE_EXPIRY ||
          cacheData.version !== CACHE_VERSION
        ) {
          resolve(null);
          return;
        }

        resolve(cacheData.data);
      };
      
      request.onerror = () => reject(request.error);
    });
  }

  async clearCache(): Promise<void> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['venues', 'metadata'], 'readwrite');
      
      const venuesStore = transaction.objectStore('venues');
      const metadataStore = transaction.objectStore('metadata');
      
      const clearVenues = venuesStore.clear();
      const clearMetadata = metadataStore.clear();
      
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  }

  async setLastFetch(key: string): Promise<void> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['metadata'], 'readwrite');
      const store = transaction.objectStore('metadata');
      const request = store.put({ 
        key: `last-fetch-${key}`, 
        timestamp: Date.now() 
      });
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getLastFetch(key: string): Promise<number | null> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['metadata'], 'readonly');
      const store = transaction.objectStore('metadata');
      const request = store.get(`last-fetch-${key}`);
      
      request.onsuccess = () => {
        const result = request.result;
        resolve(result ? result.timestamp : null);
      };
      
      request.onerror = () => reject(request.error);
    });
  }
}

export const pwaCache = new PWACache();
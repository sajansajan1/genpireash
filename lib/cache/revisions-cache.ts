/**
 * Simple in-memory cache for revisions to avoid redundant database queries
 * Cache expires after 30 seconds to ensure fresh data
 */

interface CacheEntry {
  data: any;
  timestamp: number;
}

class RevisionsCache {
  private cache: Map<string, CacheEntry> = new Map();
  private readonly TTL = 30000; // 30 seconds

  set(productId: string, data: any): void {
    this.cache.set(productId, {
      data,
      timestamp: Date.now(),
    });
  }

  get(productId: string): any | null {
    const entry = this.cache.get(productId);

    if (!entry) {
      return null;
    }

    // Check if cache is still valid
    const isExpired = Date.now() - entry.timestamp > this.TTL;

    if (isExpired) {
      this.cache.delete(productId);
      return null;
    }

    return entry.data;
  }

  invalidate(productId: string): void {
    this.cache.delete(productId);
  }

  clear(): void {
    this.cache.clear();
  }
}

// Export singleton instance
export const revisionsCache = new RevisionsCache();

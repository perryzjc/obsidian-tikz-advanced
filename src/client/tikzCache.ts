import TikZAdvancedPlugin from '../main';
import { TikZRenderResult } from '../shared/types';

interface CacheEntry {
  result: TikZRenderResult;
  timestamp: number;
}

export class TikZCache {
  private plugin: TikZAdvancedPlugin;
  private cache: Map<string, CacheEntry>;

  constructor(plugin: TikZAdvancedPlugin) {
    this.plugin = plugin;
    this.cache = new Map<string, CacheEntry>();
  }

  /**
   * Get a cached render result if available and not expired
   */
  get(source: string, format: 'svg' | 'pdf'): TikZRenderResult | null {
    const cacheKey = this.getCacheKey(source, format);
    const entry = this.cache.get(cacheKey);

    if (!entry) {
      return null;
    }

    // Check if the entry has expired
    const now = Date.now();
    const ttlMs = this.plugin.settings.cacheTTL * 60 * 1000; // Convert minutes to milliseconds

    if (now - entry.timestamp > ttlMs) {
      // Entry has expired, remove it from cache
      this.cache.delete(cacheKey);
      return null;
    }

    return entry.result;
  }

  /**
   * Store a render result in the cache
   */
  set(source: string, result: TikZRenderResult): void {
    const cacheKey = this.getCacheKey(source, result.format);

    this.cache.set(cacheKey, {
      result,
      timestamp: Date.now()
    });
  }

  /**
   * Clear the entire cache
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Clear expired entries from the cache
   */
  clearExpired(): void {
    const now = Date.now();
    const ttlMs = this.plugin.settings.cacheTTL * 60 * 1000; // Convert minutes to milliseconds

    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > ttlMs) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Generate a cache key from the source and format
   */
  private getCacheKey(source: string, format: 'svg' | 'pdf'): string {
    // Include the engine in the cache key as different engines might produce different results
    const engine = this.plugin.settings.preferredEngine;
    // Include custom preamble in the cache key as it affects the rendering
    const preamble = this.plugin.settings.customPreamble;

    // Extract any \usetikzlibrary commands from the source to include in the cache key
    // This ensures that changes to libraries will invalidate the cache
    const libraryMatches = source.match(/\\usetikzlibrary\s*{([^}]*)}/g) || [];
    const librariesString = libraryMatches.join('');

    // Create a hash of the source + format + engine + preamble + libraries
    return `${this.hashString(source + format + engine + preamble + librariesString)}`;
  }

  /**
   * Simple string hashing function
   */
  private hashString(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return hash.toString(16); // Convert to hex string
  }
}

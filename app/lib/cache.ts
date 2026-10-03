/**
 * Safe Session Storage Cache Utility for BHARATI
 * Provides Stale-While-Revalidate (SWR) support, TTL expiration,
 * and graceful fallback for mobile WebViews and private browsing.
 */

interface CacheEnvelope<T> {
  data: T;
  timestamp: number;
}

export const CACHE_KEYS = {
  ADMIN_PRODUCTS: "bharati_admin_products",
  ADMIN_CATEGORIES: "bharati_admin_categories",
  ADMIN_ORDERS: "bharati_admin_orders",
  ADMIN_PROMOS: "bharati_admin_promos",
  STORE_PRODUCTS: "bharati_store_products",
  STORE_CATEGORIES: "bharati_store_categories",
  STORE_PROMOS: "bharati_store_promos",
} as const;

/**
 * Retrieve cached data from sessionStorage with optional TTL check.
 * Safely handles server-side rendering, quota limits, and private webviews.
 */
export function getSessionCache<T>(key: string, maxAgeMs?: number): T | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.sessionStorage.getItem(key);
    if (!raw) return null;

    const envelope: CacheEnvelope<T> = JSON.parse(raw);
    if (!envelope || typeof envelope !== "object" || !("data" in envelope)) {
      return null;
    }

    if (maxAgeMs !== undefined && maxAgeMs > 0) {
      const isExpired = Date.now() - envelope.timestamp > maxAgeMs;
      if (isExpired) {
        return null;
      }
    }

    return envelope.data;
  } catch {
    // Graceful fallback for JSON parse errors or restricted WebViews
    return null;
  }
}

/**
 * Save data into sessionStorage with current timestamp.
 */
export function setSessionCache<T>(key: string, data: T): void {
  if (typeof window === "undefined") return;

  try {
    const envelope: CacheEnvelope<T> = {
      data,
      timestamp: Date.now(),
    };
    window.sessionStorage.setItem(key, JSON.stringify(envelope));
  } catch {
    // Gracefully handle storage quota or private browsing restrictions
  }
}

/**
 * Remove a specific key from sessionStorage.
 */
export function removeSessionCache(key: string): void {
  if (typeof window === "undefined") return;

  try {
    window.sessionStorage.removeItem(key);
  } catch {
    // Ignore error
  }
}

/**
 * Clear all sessionStorage keys starting with a given prefix.
 * e.g., clearSessionCacheByPrefix("bharati_admin_products")
 */
export function clearSessionCacheByPrefix(prefix: string): void {
  if (typeof window === "undefined") return;

  try {
    const keysToRemove: string[] = [];
    for (let i = 0; i < window.sessionStorage.length; i++) {
      const k = window.sessionStorage.key(i);
      if (k && k.startsWith(prefix)) {
        keysToRemove.push(k);
      }
    }
    keysToRemove.forEach((k) => window.sessionStorage.removeItem(k));
  } catch {
    // Ignore error
  }
}

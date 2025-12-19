/**
 * API Cache Service
 * Caches API responses to reduce network calls
 */

const cache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes default

/**
 * Get cached data
 */
export const getCached = (key) => {
    const cached = cache.get(key);
    if (!cached) return null;
    
    if (Date.now() > cached.expiresAt) {
        cache.delete(key);
        return null;
    }
    
    return cached.data;
};

/**
 * Set cache with expiration
 */
export const setCache = (key, data, duration = CACHE_DURATION) => {
    cache.set(key, {
        data,
        expiresAt: Date.now() + duration,
    });
};

/**
 * Clear specific cache key
 */
export const clearCache = (key) => {
    cache.delete(key);
};

/**
 * Clear all cache
 */
export const clearAllCache = () => {
    cache.clear();
};

/**
 * Cached API call wrapper
 */
export const cachedFetch = async (key, fetchFn, duration = CACHE_DURATION) => {
    // Check cache first
    const cached = getCached(key);
    if (cached) {
        console.log(`[Cache] Hit: ${key}`);
        return cached;
    }

    // Fetch fresh data
    console.log(`[Cache] Miss: ${key}`);
    const data = await fetchFn();
    
    // Cache successful responses
    if (data?.success !== false) {
        setCache(key, data, duration);
    }
    
    return data;
};

/**
 * Cache keys enum
 */
export const CACHE_KEYS = {
    DOCTORS: 'doctors_list',
    APPOINTMENTS: (phone) => `appointments_${phone}`,
    LAB_ORDERS: (phone) => `lab_orders_${phone}`,
    PRESCRIPTIONS: (phone) => `prescriptions_${phone}`,
    BILLING: (phone) => `billing_${phone}`,
    BLOOD_PROFILE: (id) => `blood_profile_${id}`,
};

export default {
    getCached,
    setCache,
    clearCache,
    clearAllCache,
    cachedFetch,
    CACHE_KEYS,
};

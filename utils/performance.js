/**
 * Performance Utilities
 * Debounce, throttle, and memoization helpers
 */

/**
 * Debounce function - delays execution until after wait time
 */
export const debounce = (func, wait = 300) => {
    let timeout;
    return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
};

/**
 * Throttle function - limits execution rate
 */
export const throttle = (func, limit = 300) => {
    let inThrottle;
    return (...args) => {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => (inThrottle = false), limit);
        }
    };
};

/**
 * Simple memoization for expensive calculations
 */
export const memoize = (fn) => {
    const cache = new Map();
    return (...args) => {
        const key = JSON.stringify(args);
        if (cache.has(key)) {
            return cache.get(key);
        }
        const result = fn(...args);
        cache.set(key, result);
        return result;
    };
};

/**
 * Format date with memoization
 */
export const formatDate = memoize((dateString, format = 'short') => {
    const date = new Date(dateString);
    const options = {
        short: { month: 'short', day: 'numeric' },
        long: { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' },
        time: { hour: '2-digit', minute: '2-digit' },
        full: { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' },
    };
    return date.toLocaleDateString('en-IN', options[format] || options.short);
});

/**
 * Format currency with memoization
 */
export const formatCurrency = memoize((amount) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0,
    }).format(amount);
});

/**
 * Delay utility for animations
 */
export const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Retry with exponential backoff
 */
export const retryWithBackoff = async (fn, maxRetries = 3, baseDelay = 1000) => {
    for (let i = 0; i < maxRetries; i++) {
        try {
            return await fn();
        } catch (error) {
            if (i === maxRetries - 1) throw error;
            const delayTime = baseDelay * Math.pow(2, i);
            console.log(`[Retry] Attempt ${i + 1} failed, retrying in ${delayTime}ms`);
            await delay(delayTime);
        }
    }
};

export default {
    debounce,
    throttle,
    memoize,
    formatDate,
    formatCurrency,
    delay,
    retryWithBackoff,
};

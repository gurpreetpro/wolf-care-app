/**
 * Secure Storage Service
 * Uses expo-secure-store for encrypted storage on device
 * Provides secure storage for auth tokens and sensitive data
 */
import * as SecureStore from 'expo-secure-store';

// Keys for secure storage
const KEYS = {
    AUTH_TOKEN: 'wolfcare_auth_token',
    PATIENT_DATA: 'wolfcare_patient',
    LAST_ACTIVITY: 'wolfcare_last_activity',
    BIOMETRIC_ENABLED: 'wolfcare_biometric',
};

/**
 * Save item securely
 */
export const setSecureItem = async (key, value) => {
    try {
        const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
        await SecureStore.setItemAsync(key, stringValue);
        return true;
    } catch (error) {
        console.error('[SecureStore] Error saving:', error);
        return false;
    }
};

/**
 * Get item from secure storage
 */
export const getSecureItem = async (key, parseJson = false) => {
    try {
        const value = await SecureStore.getItemAsync(key);
        if (value && parseJson) {
            return JSON.parse(value);
        }
        return value;
    } catch (error) {
        console.error('[SecureStore] Error reading:', error);
        return null;
    }
};

/**
 * Delete item from secure storage
 */
export const deleteSecureItem = async (key) => {
    try {
        await SecureStore.deleteItemAsync(key);
        return true;
    } catch (error) {
        console.error('[SecureStore] Error deleting:', error);
        return false;
    }
};

/**
 * Clear all app secure data (for logout)
 */
export const clearAllSecureData = async () => {
    try {
        await Promise.all([
            SecureStore.deleteItemAsync(KEYS.AUTH_TOKEN),
            SecureStore.deleteItemAsync(KEYS.PATIENT_DATA),
            SecureStore.deleteItemAsync(KEYS.LAST_ACTIVITY),
        ]);
        return true;
    } catch (error) {
        console.error('[SecureStore] Error clearing:', error);
        return false;
    }
};

// Patient data helpers
export const savePatientSecure = (patient) => setSecureItem(KEYS.PATIENT_DATA, patient);
export const getPatientSecure = () => getSecureItem(KEYS.PATIENT_DATA, true);
export const clearPatientSecure = () => deleteSecureItem(KEYS.PATIENT_DATA);

// Activity tracking for auto-logout
export const updateLastActivity = () => setSecureItem(KEYS.LAST_ACTIVITY, Date.now().toString());
export const getLastActivity = async () => {
    const timestamp = await getSecureItem(KEYS.LAST_ACTIVITY);
    return timestamp ? parseInt(timestamp, 10) : null;
};

// Session timeout check (15 minutes = 900000ms)
const SESSION_TIMEOUT = 15 * 60 * 1000;

export const isSessionExpired = async () => {
    const lastActivity = await getLastActivity();
    if (!lastActivity) return false;
    return Date.now() - lastActivity > SESSION_TIMEOUT;
};

export { KEYS };

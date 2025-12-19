/**
 * Biometric Authentication Service
 * Provides fingerprint/Face ID login option
 */
import * as LocalAuthentication from 'expo-local-authentication';
import { setSecureItem, getSecureItem, KEYS } from './secureStorage';

/**
 * Check if device supports biometric authentication
 */
export const isBiometricAvailable = async () => {
    try {
        const compatible = await LocalAuthentication.hasHardwareAsync();
        const enrolled = await LocalAuthentication.isEnrolledAsync();
        return compatible && enrolled;
    } catch (error) {
        console.error('[Biometric] Availability check error:', error);
        return false;
    }
};

/**
 * Get available biometric types
 * Returns: FINGERPRINT, FACIAL_RECOGNITION, IRIS
 */
export const getBiometricType = async () => {
    try {
        const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
        if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
            return 'face';
        }
        if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
            return 'fingerprint';
        }
        return 'biometric';
    } catch (error) {
        return 'biometric';
    }
};

/**
 * Authenticate with biometrics
 */
export const authenticateWithBiometric = async (promptMessage = 'Authenticate to continue') => {
    try {
        const result = await LocalAuthentication.authenticateAsync({
            promptMessage,
            cancelLabel: 'Cancel',
            disableDeviceFallback: false, // Allow PIN/pattern as backup
            fallbackLabel: 'Use Passcode',
        });

        return {
            success: result.success,
            error: result.error,
        };
    } catch (error) {
        console.error('[Biometric] Authentication error:', error);
        return {
            success: false,
            error: error.message,
        };
    }
};

/**
 * Enable biometric login for user
 */
export const enableBiometricLogin = async (phone) => {
    try {
        // Store phone for biometric quick login
        await setSecureItem(KEYS.BIOMETRIC_ENABLED, JSON.stringify({
            enabled: true,
            phone: phone,
            enabledAt: Date.now(),
        }));
        return true;
    } catch (error) {
        console.error('[Biometric] Enable error:', error);
        return false;
    }
};

/**
 * Check if biometric login is enabled
 */
export const isBiometricLoginEnabled = async () => {
    try {
        const data = await getSecureItem(KEYS.BIOMETRIC_ENABLED, true);
        return data?.enabled || false;
    } catch (error) {
        return false;
    }
};

/**
 * Get stored phone for biometric login
 */
export const getBiometricPhone = async () => {
    try {
        const data = await getSecureItem(KEYS.BIOMETRIC_ENABLED, true);
        return data?.phone || null;
    } catch (error) {
        return null;
    }
};

/**
 * Disable biometric login
 */
export const disableBiometricLogin = async () => {
    try {
        await setSecureItem(KEYS.BIOMETRIC_ENABLED, JSON.stringify({ enabled: false }));
        return true;
    } catch (error) {
        return false;
    }
};

export default {
    isBiometricAvailable,
    getBiometricType,
    authenticateWithBiometric,
    enableBiometricLogin,
    isBiometricLoginEnabled,
    getBiometricPhone,
    disableBiometricLogin,
};

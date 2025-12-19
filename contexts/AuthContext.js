/**
 * Auth Context with Enhanced Security
 * - Uses expo-secure-store for encrypted storage
 * - Auto-logout after 15 minutes of inactivity
 * - Session management
 */
import { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import { AppState } from 'react-native';
import { auth } from '../firebaseConfig';
import {
    savePatientSecure,
    getPatientSecure,
    clearAllSecureData,
    updateLastActivity,
    isSessionExpired,
} from '../services/secureStorage';

const AuthContext = createContext({
    user: null,
    patient: null,
    isLoading: true,
    signOut: () => {},
    setPatient: () => {},
    refreshPatient: () => {},
    trackActivity: () => {},
});

// Session timeout: 15 minutes
const SESSION_TIMEOUT_MS = 15 * 60 * 1000;
const ACTIVITY_CHECK_INTERVAL = 60 * 1000; // Check every minute

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
}

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [patient, setPatientState] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const appState = useRef(AppState.currentState);
    const activityTimer = useRef(null);

    // Load patient from secure storage on mount
    useEffect(() => {
        loadPatientSecure();
    }, []);

    // Listen to Firebase auth changes
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            setUser(firebaseUser);
            
            // Check session expiry when auth state changes
            if (firebaseUser) {
                const expired = await isSessionExpired();
                if (expired) {
                    console.log('[Auth] Session expired, logging out');
                    await signOut();
                } else {
                    await updateLastActivity();
                }
            }
            
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, []);

    // App state listener for auto-logout
    useEffect(() => {
        const subscription = AppState.addEventListener('change', async (nextAppState) => {
            if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
                // App came to foreground - check session
                const expired = await isSessionExpired();
                if (expired && user) {
                    console.log('[Auth] Session expired on app resume');
                    await signOut();
                } else {
                    await updateLastActivity();
                }
            }
            appState.current = nextAppState;
        });

        return () => subscription.remove();
    }, [user]);

    // Periodic session check
    useEffect(() => {
        if (user) {
            activityTimer.current = setInterval(async () => {
                const expired = await isSessionExpired();
                if (expired) {
                    console.log('[Auth] Periodic check: session expired');
                    await signOut();
                }
            }, ACTIVITY_CHECK_INTERVAL);
        }

        return () => {
            if (activityTimer.current) {
                clearInterval(activityTimer.current);
            }
        };
    }, [user]);

    const loadPatientSecure = async () => {
        try {
            const storedPatient = await getPatientSecure();
            if (storedPatient) {
                setPatientState(storedPatient);
            }
        } catch (error) {
            console.error('[Auth] Error loading patient:', error);
        }
    };

    const setPatient = async (patientData) => {
        try {
            if (patientData) {
                await savePatientSecure(patientData);
                await updateLastActivity();
            } else {
                await clearAllSecureData();
            }
            setPatientState(patientData);
        } catch (error) {
            console.error('[Auth] Error saving patient:', error);
        }
    };

    const refreshPatient = async (phone) => {
        try {
            const response = await fetch(
                `https://wolf-hms-server-1026194439642.asia-south1.run.app/api/patients/app/profile?phone=${encodeURIComponent(phone)}`
            );
            const data = await response.json();
            if (data.success && data.patient) {
                await setPatient(data.patient);
                return data.patient;
            }
        } catch (error) {
            console.error('[Auth] Error refreshing patient:', error);
        }
        return null;
    };

    const signOut = async () => {
        try {
            await firebaseSignOut(auth);
            await clearAllSecureData();
            setPatientState(null);
        } catch (error) {
            console.error('[Auth] Sign out error:', error);
        }
    };

    // Track user activity to prevent auto-logout
    const trackActivity = useCallback(async () => {
        await updateLastActivity();
    }, []);

    return (
        <AuthContext.Provider value={{ 
            user, 
            patient, 
            isLoading, 
            signOut, 
            setPatient,
            refreshPatient,
            trackActivity
        }}>
            {children}
        </AuthContext.Provider>
    );
}

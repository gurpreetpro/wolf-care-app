import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import * as SecureStore from 'expo-secure-store';
import api from '../services/api';

interface User {
    id: string;
    username: string;
    publicKey?: string;
    gender?: string;
    pronouns?: string;
    bio?: string;
    interests?: string;
    verification_status?: 'none' | 'pending' | 'verified' | 'rejected';
    verification_photo?: string;
    isVerified?: number; // from DB
    isGhostMode?: number; // 0 or 1
}

interface AuthContextType {
    isAuthenticated: boolean;
    isLoading: boolean;
    user: User | null;
    login: (username: string, password: string) => Promise<void>;
    register: (data: RegisterData) => Promise<any>;
    logout: () => Promise<void>;
    verifyOTP: (email: string, otp: string) => Promise<void>;
    resendOTP: (email: string) => Promise<void>;
    checkAuthStatus: () => Promise<void>;
}

interface RegisterData {
    username: string;
    password: string;
    phone: string;
    gender: string;
    pronouns: string;
    publicKey?: string;
    city?: string;
    latitude?: number;
    longitude?: number;
    bio?: string;
    isGhostMode?: number; // 0 or 1
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

export function AuthProvider({ children }: { children: ReactNode }) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [user, setUser] = useState<User | null>(null);

    // Check for existing session on app start
    useEffect(() => {
        checkAuthStatus();
    }, []);

    const checkAuthStatus = async () => {
        try {
            const token = await SecureStore.getItemAsync(TOKEN_KEY);
            const userJson = await SecureStore.getItemAsync(USER_KEY);

            if (token && userJson) {
                setUser(JSON.parse(userJson));
                setIsAuthenticated(true);
            }
        } catch (error) {
            console.error('Auth check failed:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const login = async (username: string, password: string) => {
        try {
            const response = await api.post('/auth/login', { username, password });
            const { token, user: userData } = response.data;

            // Store token and user data securely
            await SecureStore.setItemAsync(TOKEN_KEY, token);
            await SecureStore.setItemAsync(USER_KEY, JSON.stringify(userData));

            setUser(userData);
            setIsAuthenticated(true);
        } catch (error: any) {
            if (error.response?.data?.requireVerification) {
                throw error; // bubble up to UI to handle redirection
            }
            throw error;
        }
    };

    const register = async (data: RegisterData) => {
        const response = await api.post('/auth/register', data);
        return response.data; // Return data so UI knows to redirect to OTP
    };

    const verifyOTP = async (email: string, otp: string) => {
        const response = await api.post('/auth/verify-otp', { email, otp });
        const { token, user: userData } = response.data;

        await SecureStore.setItemAsync(TOKEN_KEY, token);
        await SecureStore.setItemAsync(USER_KEY, JSON.stringify(userData));

        setUser(userData);
        setIsAuthenticated(true);
    };

    const resendOTP = async (email: string) => {
        await api.post('/auth/resend-otp', { email });
    };

    const logout = async () => {
        await SecureStore.deleteItemAsync(TOKEN_KEY);
        await SecureStore.deleteItemAsync(USER_KEY);
        setUser(null);
        setIsAuthenticated(false);
    };

    return (
        <AuthContext.Provider value={{
            isAuthenticated,
            isLoading,
            user,
            login,
            register,
            logout,
            verifyOTP,
            resendOTP,
            checkAuthStatus
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

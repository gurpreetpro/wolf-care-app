/**
 * Theme Context
 * Manages dark/light theme with system detection
 */
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const THEME_STORAGE_KEY = '@wolfcare_theme';

// Theme definitions
export const themes = {
    dark: {
        name: 'dark',
        colors: {
            background: '#0f172a',
            surface: '#1e293b',
            surfaceElevated: '#334155',
            primary: '#14b8a6',
            secondary: '#8b5cf6',
            accent: '#f472b6',
            error: '#ef4444',
            warning: '#f59e0b',
            success: '#10b981',
            text: '#ffffff',
            textMuted: '#94a3b8',
            textDisabled: '#64748b',
            border: 'rgba(255,255,255,0.1)',
            cardBg: '#1e293b',
        },
        gradients: {
            header: ['#1e293b', '#0f172a'],
            card: ['#1e293b', '#0f172a'],
            button: ['#14b8a6', '#0d9488'],
        },
    },
    light: {
        name: 'light',
        colors: {
            background: '#f8fafc',
            surface: '#ffffff',
            surfaceElevated: '#f1f5f9',
            primary: '#0d9488',
            secondary: '#7c3aed',
            accent: '#ec4899',
            error: '#dc2626',
            warning: '#d97706',
            success: '#059669',
            text: '#0f172a',
            textMuted: '#64748b',
            textDisabled: '#94a3b8',
            border: 'rgba(0,0,0,0.1)',
            cardBg: '#ffffff',
        },
        gradients: {
            header: ['#f8fafc', '#e2e8f0'],
            card: ['#ffffff', '#f8fafc'],
            button: ['#0d9488', '#0f766e'],
        },
    },
};

const ThemeContext = createContext({
    theme: themes.dark,
    isDark: true,
    toggleTheme: () => {},
    setThemeMode: () => {},
});

export function useTheme() {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within ThemeProvider');
    }
    return context;
}

export function ThemeProvider({ children }) {
    const systemColorScheme = useColorScheme();
    const [themeMode, setThemeModeState] = useState('system'); // 'dark', 'light', 'system'
    const [isLoading, setIsLoading] = useState(true);

    // Load saved theme preference
    useEffect(() => {
        loadThemePreference();
    }, []);

    const loadThemePreference = async () => {
        try {
            const savedMode = await AsyncStorage.getItem(THEME_STORAGE_KEY);
            if (savedMode) {
                setThemeModeState(savedMode);
            }
        } catch (error) {
            console.error('[Theme] Error loading preference:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const setThemeMode = async (mode) => {
        try {
            await AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
            setThemeModeState(mode);
        } catch (error) {
            console.error('[Theme] Error saving preference:', error);
        }
    };

    const toggleTheme = () => {
        const newMode = themeMode === 'dark' ? 'light' : 'dark';
        setThemeMode(newMode);
    };

    // Determine actual theme based on mode
    const isDark = themeMode === 'system' 
        ? systemColorScheme === 'dark' 
        : themeMode === 'dark';
    
    const theme = isDark ? themes.dark : themes.light;

    return (
        <ThemeContext.Provider value={{
            theme,
            isDark,
            themeMode,
            toggleTheme,
            setThemeMode,
            isLoading,
        }}>
            {children}
        </ThemeContext.Provider>
    );
}

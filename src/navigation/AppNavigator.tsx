import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as SecureStore from 'expo-secure-store';
import { ActivityIndicator, View } from 'react-native';

// Screens (Placeholders for now)
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import StarMapScreen from '../screens/StarMapScreen';
import ChatScreen from '../screens/ChatScreen';
import SafeModeScreen from '../screens/SafeModeScreen';
import VideoCallScreen from '../screens/VideoCallScreen';


const Stack = createNativeStackNavigator();

export default function AppNavigator() {
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const token = await SecureStore.getItemAsync('auth_token');
            setIsAuthenticated(!!token);
        } catch (e) {
            console.error('Auth Check Failed', e);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0F0F1A' }}>
                <ActivityIndicator size="large" color="#6C5CE7" />
            </View>
        );
    }

    return (
        <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#0F0F1A' } }}>
                {isAuthenticated ? (
                    // Main App Stack
                    <Stack.Group>
                        <Stack.Screen name="Home" component={StarMapScreen} />
                        <Stack.Screen name="Chat" component={ChatScreen} />
                        <Stack.Screen name="VideoCall" component={VideoCallScreen} />
                        <Stack.Screen name="SafeMode" component={SafeModeScreen} options={{ gestureEnabled: false }} />
                    </Stack.Group>
                ) : (
                    // Auth Stack
                    <Stack.Group>
                        <Stack.Screen name="Login" component={LoginScreen} />
                        <Stack.Screen name="Register" component={RegisterScreen} />
                    </Stack.Group>
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
}

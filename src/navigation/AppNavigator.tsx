import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, View } from 'react-native';
import { useAuth } from '../context/AuthContext';

// Screens
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import StarMapScreen from '../screens/StarMapScreen';
import ChatScreen from '../screens/ChatScreen';
import SafeModeScreen from '../screens/SafeModeScreen';
import VideoCallScreen from '../screens/VideoCallScreen';
import ProfileScreen from '../screens/ProfileScreen';
import SettingsScreen from '../screens/SettingsScreen';
import OTPScreen from '../screens/OTPScreen';
import EditProfileScreen from '../screens/EditProfileScreen';
import NotificationSettingsScreen from '../screens/NotificationSettingsScreen';
import PrivacySettingsScreen from '../screens/PrivacySettingsScreen';
import SecuritySettingsScreen from '../screens/SecuritySettingsScreen';
import BlockedUsersScreen from '../screens/BlockedUsersScreen';
import PhotoVerificationScreen from '../screens/PhotoVerificationScreen';


const Stack = createNativeStackNavigator();

export default function AppNavigator() {
    const { isAuthenticated, isLoading } = useAuth();

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
                        <Stack.Screen name="Profile" component={ProfileScreen} />
                        <Stack.Screen name="Settings" component={SettingsScreen} />
                        <Stack.Screen name="NotificationSettings" component={NotificationSettingsScreen} />
                        <Stack.Screen name="PrivacySettings" component={PrivacySettingsScreen} />
                        <Stack.Screen name="SecuritySettings" component={SecuritySettingsScreen} />
                        <Stack.Screen name="BlockedUsers" component={BlockedUsersScreen} />
                        <Stack.Screen name="PhotoVerification" component={PhotoVerificationScreen} options={{ presentation: 'modal' }} />
                        <Stack.Screen name="VideoCall" component={VideoCallScreen} options={{ headerShown: false }} />
                        <Stack.Screen name="EditProfile" component={EditProfileScreen} />
                        <Stack.Screen name="SafeMode" component={SafeModeScreen} options={{ gestureEnabled: false }} />
                    </Stack.Group>
                ) : (
                    // Auth Stack
                    <Stack.Group>
                        <Stack.Screen name="Login" component={LoginScreen} />
                        <Stack.Screen name="Register" component={RegisterScreen} />
                        <Stack.Screen name="OTP" component={OTPScreen} />
                    </Stack.Group>
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
}

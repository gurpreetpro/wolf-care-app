import { View, Text, StyleSheet } from 'react-native';
import { Tabs } from 'expo-router';

// Wolf HMS Theme
const theme = {
    primary: '#10B981',
    darkNavy: '#0f172a',
    gray: '#94a3b8',
    white: '#ffffff',
};

export default function TabsLayout() {
    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: theme.primary,
                tabBarInactiveTintColor: theme.gray,
                tabBarStyle: {
                    backgroundColor: theme.white,
                    borderTopColor: '#e2e8f0',
                    paddingBottom: 8,
                    paddingTop: 8,
                    height: 60,
                },
                tabBarLabelStyle: {
                    fontSize: 12,
                    fontWeight: '500',
                },
            }}
        >
            <Tabs.Screen 
                name="index" 
                options={{ 
                    title: 'Home',
                    tabBarIcon: ({ color }) => <Text style={{ fontSize: 24 }}>🏠</Text>
                }} 
            />
            <Tabs.Screen 
                name="appointments" 
                options={{ 
                    title: 'Appointments',
                    tabBarIcon: ({ color }) => <Text style={{ fontSize: 24 }}>📅</Text>
                }} 
            />
            <Tabs.Screen 
                name="records" 
                options={{ 
                    title: 'Records',
                    tabBarIcon: ({ color }) => <Text style={{ fontSize: 24 }}>📋</Text>
                }} 
            />
            <Tabs.Screen 
                name="profile" 
                options={{ 
                    title: 'Profile',
                    tabBarIcon: ({ color }) => <Text style={{ fontSize: 24 }}>👤</Text>
                }} 
            />
        </Tabs>
    );
}

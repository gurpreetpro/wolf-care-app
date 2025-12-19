import { View, Text, StyleSheet } from 'react-native';
import { Tabs } from 'expo-router';
import Svg, { Circle, Path, Rect, G } from 'react-native-svg';

// Premium Aurora Neural Theme
const theme = {
    gradientStart: '#0f172a',
    primary: '#14b8a6',
    secondary: '#8b5cf6',
    accent: '#f472b6',
    cyan: '#06b6d4',
    white: '#ffffff',
    textMuted: 'rgba(255,255,255,0.5)',
    glassBorder: 'rgba(255,255,255,0.1)',
};

// Custom Tab Icons (Premium Style)
const TabIcon = ({ name, focused }) => {
    const color = focused ? theme.primary : theme.textMuted;
    const size = 24;
    
    const icons = {
        home: (
            <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
                <Path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
                <Path d="M9 22V12h6v10" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
                {focused && <Circle cx="12" cy="8" r="2" fill={theme.cyan} opacity={0.6}/>}
            </Svg>
        ),
        calendar: (
            <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
                <Rect x="3" y="4" width="18" height="18" rx="2" stroke={color} strokeWidth={2}/>
                <Path d="M16 2v4M8 2v4M3 10h18" stroke={color} strokeWidth={2} strokeLinecap="round"/>
                {focused && <Circle cx="12" cy="15" r="2" fill={theme.accent} opacity={0.8}/>}
            </Svg>
        ),
        records: (
            <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
                <Path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" stroke={color} strokeWidth={2}/>
                <Path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" stroke={color} strokeWidth={2} strokeLinecap="round"/>
                {focused && <Circle cx="16" cy="6" r="2" fill={theme.secondary} opacity={0.8}/>}
            </Svg>
        ),
        blood: (
            <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
                <Path d="M12 2c0 0-6 7-6 11a6 6 0 1012 0c0-4-6-11-6-11z" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
                {focused && <Circle cx="12" cy="14" r="3" fill="#ef4444" opacity={0.8}/>}
            </Svg>
        ),
        profile: (
            <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
                <Circle cx="12" cy="8" r="4" stroke={color} strokeWidth={2}/>
                <Path d="M20 21a8 8 0 10-16 0" stroke={color} strokeWidth={2} strokeLinecap="round"/>
                {focused && <Circle cx="12" cy="8" r="2" fill={theme.cyan} opacity={0.6}/>}
            </Svg>
        ),
    };
    
    return icons[name] || null;
};

export default function TabsLayout() {
    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: theme.primary,
                tabBarInactiveTintColor: theme.textMuted,
                tabBarStyle: {
                    backgroundColor: theme.gradientStart,
                    borderTopColor: theme.glassBorder,
                    borderTopWidth: 1,
                    paddingBottom: 8,
                    paddingTop: 12,
                    height: 70,
                    elevation: 0,
                    shadowOpacity: 0,
                },
                tabBarLabelStyle: {
                    fontSize: 11,
                    fontWeight: '500',
                    marginTop: 4,
                },
            }}
        >
            <Tabs.Screen 
                name="index" 
                options={{ 
                    title: 'Home',
                    tabBarIcon: ({ focused }) => <TabIcon name="home" focused={focused} />
                }} 
            />
            <Tabs.Screen 
                name="appointments" 
                options={{ 
                    title: 'Appointments',
                    tabBarIcon: ({ focused }) => <TabIcon name="calendar" focused={focused} />
                }} 
            />
            <Tabs.Screen 
                name="records" 
                options={{ 
                    title: 'Records',
                    tabBarIcon: ({ focused }) => <TabIcon name="records" focused={focused} />
                }} 
            />
            <Tabs.Screen 
                name="blood" 
                options={{ 
                    title: 'Blood',
                    tabBarIcon: ({ focused }) => <TabIcon name="blood" focused={focused} />
                }} 
            />
            <Tabs.Screen 
                name="profile" 
                options={{ 
                    title: 'Profile',
                    tabBarIcon: ({ focused }) => <TabIcon name="profile" focused={focused} />
                }} 
            />
        </Tabs>
    );
}

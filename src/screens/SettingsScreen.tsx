import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';

export default function SettingsScreen({ navigation }: any) {
    const { logout, user } = useAuth();

    const handleLogout = () => {
        Alert.alert(
            'Logout',
            'Are you sure you want to logout?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Logout',
                    style: 'destructive',
                    onPress: async () => {
                        await logout();
                        // Navigation happens automatically via AuthContext
                    }
                }
            ]
        );
    };

    const SettingItem = ({ icon, label, onPress, color = '#fff', showArrow = true }: any) => (
        <TouchableOpacity style={styles.settingItem} onPress={onPress}>
            <Ionicons name={icon} size={22} color={color} />
            <Text style={[styles.settingLabel, { color }]}>{label}</Text>
            {showArrow && <Ionicons name="chevron-forward" size={20} color="#666" />}
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <LinearGradient colors={['#0F0F1A', '#1A1A2E']} style={StyleSheet.absoluteFill} />

            <SafeAreaView style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name="chevron-back" size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Settings</Text>
                <View style={{ width: 34 }} />
            </SafeAreaView>

            <ScrollView contentContainerStyle={styles.content}>
                {/* Account Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>ACCOUNT</Text>
                    <View style={styles.sectionCard}>
                        <SettingItem
                            icon="person-outline"
                            label="Edit Profile"
                            onPress={() => navigation.navigate('EditProfile')}
                        />
                        <View style={styles.divider} />
                        <SettingItem
                            icon="notifications-outline"
                            label="Notifications"
                            onPress={() => navigation.navigate('NotificationSettings')}
                        />
                    </View>
                </View>

                {/* Privacy Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>PRIVACY & SECURITY</Text>
                    <View style={styles.sectionCard}>
                        <SettingItem
                            icon="shield-outline"
                            label="Privacy Settings"
                            onPress={() => navigation.navigate('PrivacySettings')}
                        />
                        <View style={styles.divider} />
                        <SettingItem
                            icon="lock-closed-outline"
                            label="Security"
                            onPress={() => navigation.navigate('SecuritySettings')}
                        />
                        <View style={styles.divider} />
                        <SettingItem
                            icon="eye-off-outline"
                            label="Blocked Users"
                            onPress={() => navigation.navigate('BlockedUsers')}
                        />
                    </View>
                </View>

                {/* Support Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>SUPPORT</Text>
                    <View style={styles.sectionCard}>
                        <SettingItem
                            icon="help-circle-outline"
                            label="Help Center"
                            onPress={() => Alert.alert('Coming Soon', 'Help center will be available soon!')}
                        />
                        <View style={styles.divider} />
                        <SettingItem
                            icon="flag-outline"
                            label="Report a Problem"
                            onPress={() => Alert.alert('Coming Soon', 'Reporting will be available soon!')}
                        />
                    </View>
                </View>

                {/* About Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>ABOUT</Text>
                    <View style={styles.sectionCard}>
                        <SettingItem
                            icon="information-circle-outline"
                            label="About Pride Connect"
                            onPress={() => Alert.alert('Pride Connect', 'Version 1.0.0\n\nA safe space for the LGBTQ+ community.')}
                        />
                        <View style={styles.divider} />
                        <SettingItem
                            icon="document-text-outline"
                            label="Terms of Service"
                            onPress={() => { }}
                        />
                        <View style={styles.divider} />
                        <SettingItem
                            icon="shield-checkmark-outline"
                            label="Privacy Policy"
                            onPress={() => { }}
                        />
                    </View>
                </View>

                {/* Logout Button */}
                <View style={styles.section}>
                    <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
                        <Ionicons name="log-out-outline" size={22} color="#FF6B6B" />
                        <Text style={styles.logoutText}>Logout</Text>
                    </TouchableOpacity>
                </View>

                {/* Version */}
                <Text style={styles.version}>Pride Connect v1.0.0</Text>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 15,
        paddingTop: 10,
        paddingBottom: 15
    },
    backBtn: { padding: 5 },
    headerTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },

    content: { padding: 20, paddingBottom: 40 },

    section: { marginBottom: 25 },
    sectionTitle: { color: '#888', fontSize: 12, fontWeight: '600', marginBottom: 10, marginLeft: 5, letterSpacing: 1 },
    sectionCard: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 15,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        overflow: 'hidden'
    },

    settingItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
    },
    settingLabel: { flex: 1, fontSize: 16, marginLeft: 15 },
    divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.1)', marginLeft: 52 },

    logoutBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255, 107, 107, 0.1)',
        padding: 15,
        borderRadius: 15,
        borderWidth: 1,
        borderColor: 'rgba(255, 107, 107, 0.3)'
    },
    logoutText: { color: '#FF6B6B', fontSize: 16, fontWeight: '600', marginLeft: 10 },

    version: { color: '#666', fontSize: 12, textAlign: 'center', marginTop: 10 }
});

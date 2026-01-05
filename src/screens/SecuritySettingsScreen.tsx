import React, { useState } from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';

export default function SecuritySettingsScreen({ navigation }: any) {
    const { logout } = useAuth();
    const [biometricEnabled, setBiometricEnabled] = useState(false);

    const handleDeleteAccount = () => {
        Alert.alert(
            'Delete Account',
            'Are you sure you want to delete your account? This action is irreversible.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        // In a real app we would call API to delete
                        await logout();
                        Alert.alert('Account Deleted');
                    }
                }
            ]
        );
    };

    return (
        <View style={styles.container}>
            <LinearGradient colors={['#0F0F1A', '#1A1A2E']} style={StyleSheet.absoluteFill} />

            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Security</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Login & Access</Text>
                    <View style={styles.item}>
                        <Text style={styles.itemText}>Biometric Unlock</Text>
                        <Switch
                            value={biometricEnabled}
                            onValueChange={setBiometricEnabled}
                            trackColor={{ false: '#333', true: '#6C5CE7' }}
                            thumbColor={biometricEnabled ? '#fff' : '#aaa'}
                        />
                    </View>
                    <View style={styles.divider} />
                    <TouchableOpacity style={styles.item} onPress={() => Alert.alert('Change Password', 'Coming in next update')}>
                        <Text style={styles.itemText}>Change Password</Text>
                        <Ionicons name="chevron-forward" size={20} color="#666" />
                    </TouchableOpacity>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Sessions</Text>
                    <TouchableOpacity style={styles.item}>
                        <Text style={styles.itemText}>Active Sessions</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Text style={{ color: '#888', marginRight: 5 }}>1 device</Text>
                            <Ionicons name="chevron-forward" size={20} color="#666" />
                        </View>
                    </TouchableOpacity>
                </View>

                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: '#FF6B6B' }]}>Danger Zone</Text>
                    <TouchableOpacity style={[styles.buttonItem, styles.deleteBtn]} onPress={handleDeleteAccount}>
                        <Text style={styles.deleteText}>Delete Account</Text>
                        <Ionicons name="trash-outline" size={20} color="#FF6B6B" />
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingTop: 50, backgroundColor: 'rgba(0,0,0,0.2)' },
    headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
    backBtn: { padding: 5 },
    content: { padding: 20 },
    section: { marginBottom: 30 },
    sectionTitle: { color: '#00CEC9', fontSize: 14, fontWeight: 'bold', marginBottom: 15, textTransform: 'uppercase', letterSpacing: 1 },
    item: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12 },
    itemText: { color: '#fff', fontSize: 16 },
    divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.1)', marginVertical: 8 },
    buttonItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 15, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 12, paddingHorizontal: 15 },
    deleteBtn: { backgroundColor: 'rgba(255, 107, 107, 0.1)', borderColor: 'rgba(255, 107, 107, 0.3)', borderWidth: 1 },
    deleteText: { color: '#FF6B6B', fontSize: 16, fontWeight: 'bold' }
});

import React, { useState } from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import api from '../services/api';

import { useAuth } from '../context/AuthContext';

export default function PrivacySettingsScreen({ navigation }: any) {
    const { user, checkAuthStatus } = useAuth();
    // Initialize with user's current setting, default to false if undefined
    const [ghostMode, setGhostMode] = useState(user?.isGhostMode === 1);
    const [showAge, setShowAge] = useState(true);
    const [showDistance, setShowDistance] = useState(true);

    return (
        <View style={styles.container}>
            <LinearGradient colors={['#0F0F1A', '#1A1A2E']} style={StyleSheet.absoluteFill} />

            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Privacy</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Visibility</Text>
                    <View style={styles.item}>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.itemText}>Ghost Mode</Text>
                            <Text style={styles.itemSubtext}>Browse anonymously. You won't appear in Star Map.</Text>
                        </View>
                        <Switch
                            value={ghostMode}
                            onValueChange={async (value) => {
                                setGhostMode(value);
                                try {
                                    await api.put('/auth/privacy', { isGhostMode: value });
                                    // Refresh user context to persist state locally
                                    checkAuthStatus();
                                } catch (error) {
                                    console.error('Failed to update privacy:', error);
                                    // Revert on error
                                    setGhostMode(!value);
                                }
                            }}
                            trackColor={{ false: '#333', true: '#6C5CE7' }}
                            thumbColor={ghostMode ? '#fff' : '#aaa'}
                        />
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Profile Details</Text>
                    <View style={styles.item}>
                        <Text style={styles.itemText}>Show Age</Text>
                        <Switch
                            value={showAge}
                            onValueChange={setShowAge}
                            trackColor={{ false: '#333', true: '#6C5CE7' }}
                            thumbColor={showAge ? '#fff' : '#aaa'}
                        />
                    </View>
                    <View style={styles.divider} />
                    <View style={styles.item}>
                        <Text style={styles.itemText}>Show Distance</Text>
                        <Switch
                            value={showDistance}
                            onValueChange={setShowDistance}
                            trackColor={{ false: '#333', true: '#6C5CE7' }}
                            thumbColor={showDistance ? '#fff' : '#aaa'}
                        />
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Data</Text>
                    <TouchableOpacity style={styles.buttonItem}>
                        <Text style={styles.buttonText}>Download My Data</Text>
                        <Ionicons name="cloud-download-outline" size={20} color="#fff" />
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
    itemSubtext: { color: '#888', fontSize: 12, marginTop: 4, paddingRight: 10 },
    divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.1)', marginVertical: 8 },
    buttonItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 15, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 12, paddingHorizontal: 15 },
    buttonText: { color: '#fff', fontSize: 16 }
});

import React, { useState } from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

export default function NotificationSettingsScreen({ navigation }: any) {
    const [pushEnabled, setPushEnabled] = useState(true);
    const [emailEnabled, setEmailEnabled] = useState(true);
    const [matchesEnabled, setMatchesEnabled] = useState(true);
    const [messagesEnabled, setMessagesEnabled] = useState(true);

    return (
        <View style={styles.container}>
            <LinearGradient colors={['#0F0F1A', '#1A1A2E']} style={StyleSheet.absoluteFill} />

            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Notifications</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Push Notifications</Text>
                    <View style={styles.item}>
                        <Text style={styles.itemText}>Enable Push Notifications</Text>
                        <Switch
                            value={pushEnabled}
                            onValueChange={setPushEnabled}
                            trackColor={{ false: '#333', true: '#6C5CE7' }}
                            thumbColor={pushEnabled ? '#fff' : '#aaa'}
                        />
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Email Notifications</Text>
                    <View style={styles.item}>
                        <Text style={styles.itemText}>Marketing Emails</Text>
                        <Switch
                            value={emailEnabled}
                            onValueChange={setEmailEnabled}
                            trackColor={{ false: '#333', true: '#6C5CE7' }}
                            thumbColor={emailEnabled ? '#fff' : '#aaa'}
                        />
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Activity</Text>
                    <View style={styles.item}>
                        <Text style={styles.itemText}>New Matches</Text>
                        <Switch
                            value={matchesEnabled}
                            onValueChange={setMatchesEnabled}
                            trackColor={{ false: '#333', true: '#6C5CE7' }}
                            thumbColor={matchesEnabled ? '#fff' : '#aaa'}
                        />
                    </View>
                    <View style={styles.divider} />
                    <View style={styles.item}>
                        <Text style={styles.itemText}>New Messages</Text>
                        <Switch
                            value={messagesEnabled}
                            onValueChange={setMessagesEnabled}
                            trackColor={{ false: '#333', true: '#6C5CE7' }}
                            thumbColor={messagesEnabled ? '#fff' : '#aaa'}
                        />
                    </View>
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
    divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.1)', marginVertical: 8 }
});

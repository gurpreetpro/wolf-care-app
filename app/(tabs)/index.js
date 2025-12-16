import { View, Text, StyleSheet, ScrollView, Pressable, RefreshControl } from 'react-native';
import { useState, useCallback } from 'react';
import { router } from 'expo-router';

// Wolf HMS Theme
const theme = {
    primary: '#10B981',
    darkNavy: '#0f172a',
    tealDark: '#0d3d56',
    lightCream: '#f0f9ff',
    white: '#ffffff',
    gray: '#94a3b8',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6',
};

export default function HomeScreen() {
    const [refreshing, setRefreshing] = useState(false);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        setTimeout(() => setRefreshing(false), 1500);
    }, []);

    const quickActions = [
        { id: 1, icon: '📅', title: 'Book Appointment', route: '/(tabs)/appointments', color: theme.primary },
        { id: 2, icon: '🧪', title: 'Lab Tests', route: '/(tabs)/records', color: theme.info },
        { id: 3, icon: '💊', title: 'Pharmacy', route: '/(tabs)/records', color: theme.warning },
        { id: 4, icon: '🤖', title: 'AI Health Guard', route: '/ai/chat', color: '#8b5cf6' },
    ];

    const healthStats = [
        { id: 1, icon: '❤️', label: 'Heart Rate', value: '72', unit: 'bpm', status: 'normal' },
        { id: 2, icon: '🩸', label: 'Blood Pressure', value: '120/80', unit: 'mmHg', status: 'normal' },
        { id: 3, icon: '🌡️', label: 'Temperature', value: '98.6', unit: '°F', status: 'normal' },
    ];

    const recentActivity = [
        { id: 1, type: 'appointment', title: 'Dr. Sharma - Cardiology', date: 'Dec 10, 2024', status: 'completed' },
        { id: 2, type: 'lab', title: 'Complete Blood Count', date: 'Dec 8, 2024', status: 'results ready' },
        { id: 3, type: 'prescription', title: 'Metformin 500mg', date: 'Dec 5, 2024', status: 'active' },
    ];

    return (
        <ScrollView 
            style={styles.container}
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.primary} />
            }
        >
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerTop}>
                    <View>
                        <Text style={styles.greeting}>Hello, Patient 👋</Text>
                        <Text style={styles.subtitle}>How are you feeling today?</Text>
                    </View>
                    <Pressable style={styles.notificationBtn}>
                        <Text style={styles.notificationIcon}>🔔</Text>
                        <View style={styles.notificationBadge} />
                    </Pressable>
                </View>
            </View>

            {/* Health Stats */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Your Health</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.statsScroll}>
                    {healthStats.map((stat) => (
                        <View key={stat.id} style={styles.statCard}>
                            <Text style={styles.statIcon}>{stat.icon}</Text>
                            <Text style={styles.statLabel}>{stat.label}</Text>
                            <View style={styles.statValueRow}>
                                <Text style={styles.statValue}>{stat.value}</Text>
                                <Text style={styles.statUnit}>{stat.unit}</Text>
                            </View>
                            <View style={styles.statusBadge}>
                                <Text style={styles.statusText}>✓ Normal</Text>
                            </View>
                        </View>
                    ))}
                </ScrollView>
            </View>

            {/* Quick Actions */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Quick Actions</Text>
                <View style={styles.grid}>
                    {quickActions.map((action) => (
                        <Pressable 
                            key={action.id} 
                            style={[styles.actionCard, { borderLeftColor: action.color }]}
                            onPress={() => router.push(action.route)}
                        >
                            <Text style={styles.actionIcon}>{action.icon}</Text>
                            <Text style={styles.actionTitle}>{action.title}</Text>
                        </Pressable>
                    ))}
                </View>
            </View>

            {/* Upcoming Appointment */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Upcoming</Text>
                <View style={styles.appointmentCard}>
                    <View style={styles.appointmentLeft}>
                        <View style={styles.dateBox}>
                            <Text style={styles.dateDay}>15</Text>
                            <Text style={styles.dateMonth}>DEC</Text>
                        </View>
                    </View>
                    <View style={styles.appointmentRight}>
                        <Text style={styles.appointmentTime}>10:00 AM</Text>
                        <Text style={styles.appointmentDoctor}>Dr. Priya Sharma</Text>
                        <Text style={styles.appointmentDept}>Cardiology • Room 204</Text>
                        <View style={styles.appointmentActions}>
                            <Pressable style={styles.rescheduleBtn}>
                                <Text style={styles.rescheduleBtnText}>Reschedule</Text>
                            </Pressable>
                            <Pressable style={styles.joinBtn}>
                                <Text style={styles.joinBtnText}>Join Call</Text>
                            </Pressable>
                        </View>
                    </View>
                </View>
            </View>

            {/* Recent Activity */}
            <View style={[styles.section, { paddingBottom: 100 }]}>
                <Text style={styles.sectionTitle}>Recent Activity</Text>
                {recentActivity.map((activity) => (
                    <Pressable key={activity.id} style={styles.activityCard}>
                        <View style={styles.activityIcon}>
                            <Text style={styles.activityEmoji}>
                                {activity.type === 'appointment' ? '📅' : activity.type === 'lab' ? '🧪' : '💊'}
                            </Text>
                        </View>
                        <View style={styles.activityInfo}>
                            <Text style={styles.activityTitle}>{activity.title}</Text>
                            <Text style={styles.activityDate}>{activity.date}</Text>
                        </View>
                        <View style={[styles.activityStatus, 
                            activity.status === 'completed' && styles.statusCompleted,
                            activity.status === 'results ready' && styles.statusReady,
                            activity.status === 'active' && styles.statusActive,
                        ]}>
                            <Text style={styles.activityStatusText}>{activity.status}</Text>
                        </View>
                    </Pressable>
                ))}
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.lightCream },
    header: {
        backgroundColor: theme.tealDark,
        padding: 24,
        paddingTop: 60,
        paddingBottom: 30,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
    },
    headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    greeting: { fontSize: 28, fontWeight: 'bold', color: theme.white },
    subtitle: { fontSize: 16, color: theme.gray, marginTop: 4 },
    notificationBtn: {
        width: 44, height: 44, borderRadius: 22,
        backgroundColor: 'rgba(255,255,255,0.1)',
        justifyContent: 'center', alignItems: 'center',
    },
    notificationIcon: { fontSize: 20 },
    notificationBadge: {
        position: 'absolute', top: 8, right: 8,
        width: 10, height: 10, borderRadius: 5,
        backgroundColor: theme.error,
    },
    section: { padding: 20, paddingBottom: 0 },
    sectionTitle: { fontSize: 18, fontWeight: '600', color: theme.darkNavy, marginBottom: 16 },
    statsScroll: { marginHorizontal: -20, paddingHorizontal: 20 },
    statCard: {
        backgroundColor: theme.white,
        padding: 16, borderRadius: 16, marginRight: 12,
        width: 140, alignItems: 'center',
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
    },
    statIcon: { fontSize: 28, marginBottom: 8 },
    statLabel: { fontSize: 12, color: theme.gray, marginBottom: 4 },
    statValueRow: { flexDirection: 'row', alignItems: 'baseline' },
    statValue: { fontSize: 24, fontWeight: 'bold', color: theme.darkNavy },
    statUnit: { fontSize: 12, color: theme.gray, marginLeft: 4 },
    statusBadge: {
        backgroundColor: '#d1fae5', paddingHorizontal: 8, paddingVertical: 2,
        borderRadius: 4, marginTop: 8,
    },
    statusText: { fontSize: 10, color: theme.primary, fontWeight: '500' },
    grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
    actionCard: {
        width: '48%', backgroundColor: theme.white,
        padding: 20, borderRadius: 16, alignItems: 'center', gap: 12,
        borderLeftWidth: 4,
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
    },
    actionIcon: { fontSize: 32 },
    actionTitle: { fontSize: 14, fontWeight: '600', color: theme.darkNavy, textAlign: 'center' },
    appointmentCard: {
        backgroundColor: theme.white, borderRadius: 16,
        flexDirection: 'row', overflow: 'hidden',
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
    },
    appointmentLeft: { backgroundColor: theme.primary, padding: 16, justifyContent: 'center' },
    dateBox: { alignItems: 'center' },
    dateDay: { fontSize: 28, fontWeight: 'bold', color: theme.white },
    dateMonth: { fontSize: 14, color: 'rgba(255,255,255,0.8)' },
    appointmentRight: { flex: 1, padding: 16 },
    appointmentTime: { fontSize: 14, color: theme.primary, fontWeight: '600', marginBottom: 4 },
    appointmentDoctor: { fontSize: 18, fontWeight: '600', color: theme.darkNavy },
    appointmentDept: { fontSize: 14, color: theme.gray, marginTop: 2 },
    appointmentActions: { flexDirection: 'row', gap: 8, marginTop: 12 },
    rescheduleBtn: {
        paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8,
        borderWidth: 1, borderColor: theme.gray,
    },
    rescheduleBtnText: { fontSize: 12, color: theme.gray },
    joinBtn: {
        paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8,
        backgroundColor: theme.primary,
    },
    joinBtnText: { fontSize: 12, color: theme.white, fontWeight: '500' },
    activityCard: {
        backgroundColor: theme.white, borderRadius: 12,
        flexDirection: 'row', alignItems: 'center',
        padding: 16, marginBottom: 10,
        shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.03, shadowRadius: 4, elevation: 1,
    },
    activityIcon: {
        width: 44, height: 44, borderRadius: 12,
        backgroundColor: theme.lightCream,
        justifyContent: 'center', alignItems: 'center',
    },
    activityEmoji: { fontSize: 20 },
    activityInfo: { flex: 1, marginLeft: 12 },
    activityTitle: { fontSize: 15, fontWeight: '500', color: theme.darkNavy },
    activityDate: { fontSize: 13, color: theme.gray, marginTop: 2 },
    activityStatus: {
        paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6,
    },
    statusCompleted: { backgroundColor: '#d1fae5' },
    statusReady: { backgroundColor: '#dbeafe' },
    statusActive: { backgroundColor: '#fef3c7' },
    activityStatusText: { fontSize: 11, fontWeight: '500', color: theme.darkNavy, textTransform: 'capitalize' },
});

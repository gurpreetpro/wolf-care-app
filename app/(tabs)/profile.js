import { View, Text, StyleSheet, ScrollView, Pressable, Alert, ActivityIndicator, Switch } from 'react-native';
import { useState, useEffect } from 'react';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle, Line } from 'react-native-svg';
import { useAuth } from '../../contexts/AuthContext';
import { calculateAge } from '../../utils/date';
import biometric from '../../services/biometric';

const API_BASE = 'https://wolf-hms-server-1026194439642.asia-south1.run.app';

// Premium Aurora Neural Theme
const theme = {
    gradientStart: '#0f172a',
    gradientMid: '#1e293b',
    gradientEnd: '#0f172a',
    primary: '#14b8a6',
    secondary: '#8b5cf6',
    accent: '#f472b6',
    cyan: '#06b6d4',
    white: '#ffffff',
    textPrimary: '#f8fafc',
    textSecondary: 'rgba(255,255,255,0.7)',
    textMuted: 'rgba(255,255,255,0.5)',
    glassBackground: 'rgba(255,255,255,0.08)',
    glassBorder: 'rgba(255,255,255,0.15)',
    error: '#ef4444',
};

// Neural Background
const NeuralBackground = () => (
    <Svg style={StyleSheet.absoluteFill} width="100%" height="100%">
        <Circle cx="80" cy="120" r="3" fill={theme.cyan} opacity={0.4} />
        <Circle cx="300" cy="80" r="4" fill={theme.accent} opacity={0.3} />
        <Circle cx="50" cy="300" r="2" fill={theme.primary} opacity={0.5} />
        <Line x1="80" y1="120" x2="300" y2="80" stroke={theme.cyan} strokeWidth="0.5" opacity={0.2} />
    </Svg>
);

// Glass Card Component
const GlassCard = ({ children, style, onPress }) => (
    <Pressable style={[styles.glassCard, style]} onPress={onPress} disabled={!onPress}>
        {children}
    </Pressable>
);

export default function ProfileScreen() {
    const { patient, setPatient, signOut } = useAuth();
    const [stats, setStats] = useState({ appointments: 0, labReports: 0, medications: 0 });
    const [loading, setLoading] = useState(true);
    const [biometricEnabled, setBiometricEnabled] = useState(false);
    const [biometricAvailable, setBiometricAvailable] = useState(false);

    useEffect(() => {
        if (patient?.phone) {
            fetchProfileData();
            checkBiometricStatus();
        } else {
            setLoading(false);
        }
    }, [patient]);

    const checkBiometricStatus = async () => {
        const available = await biometric.isBiometricAvailable();
        setBiometricAvailable(available);
        if (available) {
            const enabled = await biometric.isBiometricLoginEnabled();
            setBiometricEnabled(enabled);
        }
    };

    const toggleBiometric = async (value) => {
        if (!biometricAvailable) {
            Alert.alert('Not Supported', 'Biometric authentication is not available on this device.');
            return;
        }

        if (value) {
            const success = await biometric.enableBiometricLogin(patient.phone);
            if (success) {
                setBiometricEnabled(true);
                Alert.alert('Success', 'Biometric login enabled');
            } else {
                Alert.alert('Error', 'Failed to enable biometric login');
            }
        } else {
            const success = await biometric.disableBiometricLogin();
            if (success) {
                setBiometricEnabled(false);
            }
        }
    };

    const fetchProfileData = async () => {
        try {
            const response = await fetch(
                `${API_BASE}/api/patients/app/profile?phone=${encodeURIComponent(patient.phone)}`
            );
            const data = await response.json();
            
            if (data.success) {
                setStats(data.stats || { appointments: 0, labReports: 0, medications: 0 });
                // Update patient data if needed
                if (data.patient) {
                    await setPatient(data.patient);
                }
            }
        } catch (error) {
            console.error('Error fetching profile:', error);
        } finally {
            setLoading(false);
        }
    };

    const menuItems = [
        { id: 1, icon: '👤', title: 'Edit Profile', action: () => handleMenuItem('Edit Profile') },
        { id: 2, icon: '🔔', title: 'Notifications', action: () => handleMenuItem('Notifications') },
        // Handling Privacy manually in render to include toggle
        // { id: 3, icon: '🔒', title: 'Privacy & Security', action: () => handleMenuItem('Privacy & Security') },
        { id: 4, icon: '🎨', title: 'Appearance', action: () => handleMenuItem('Appearance') },
        { id: 5, icon: '❓', title: 'Help & Support', action: () => handleMenuItem('Help & Support') },
        { id: 6, icon: '📄', title: 'Terms of Service', action: () => handleMenuItem('Terms of Service') },
    ];

    const handleMenuItem = (item) => {
        Alert.alert('Coming Soon', `${item} will be available in the next update.`);
    };

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
                        await signOut();
                        router.replace('/(auth)/login');
                    }
                },
            ]
        );
    };

    const getGenderEmoji = () => {
        const gender = patient?.gender?.toLowerCase();
        if (gender === 'male') return '👨‍⚕️';
        if (gender === 'female') return '👩‍⚕️';
        return '🧑‍⚕️';
    };

    const formatPhone = (phone) => {
        if (!phone) return '';
        // Format: +91 98765 43210
        const clean = phone.replace(/\D/g, '');
        if (clean.length === 10) {
            return `+91 ${clean.slice(0,5)} ${clean.slice(5)}`;
        }
        return phone;
    };

    // Calculate Age helper
    const displayAge = patient?.dob ? calculateAge(patient.dob) : (patient?.age || '');

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={[theme.gradientStart, theme.gradientMid, theme.gradientEnd]}
                style={StyleSheet.absoluteFill}
            />
            <NeuralBackground />
            
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Profile</Text>
                </View>

                {/* Profile Card */}
                <GlassCard style={styles.profileCard}>
                    <View style={styles.avatarContainer}>
                        <LinearGradient
                            colors={[theme.primary, theme.cyan]}
                            style={styles.avatarGradient}
                        >
                            <Text style={styles.avatarEmoji}>{getGenderEmoji()}</Text>
                        </LinearGradient>
                        <View style={styles.onlineIndicator} />
                    </View>
                    <Text style={styles.profileName}>
                        {patient?.name || 'Patient User'}
                    </Text>
                    <Text style={styles.profilePhone}>
                        {formatPhone(patient?.phone) || '+91 98765 43210'}
                    </Text>
                    {patient?.gender && (
                        <Text style={styles.profileMeta}>
                            {displayAge ? `${displayAge} yrs • ` : ''}{patient.gender}
                            {patient.blood_group ? ` • ${patient.blood_group}` : ''}
                        </Text>
                    )}
                    <View style={styles.verifiedBadge}>
                        <Text style={styles.verifiedIcon}>✓</Text>
                        <Text style={styles.verifiedText}>Verified Account</Text>
                    </View>
                </GlassCard>

                {/* Quick Stats */}
                {loading ? (
                    <View style={styles.loadingStats}>
                        <ActivityIndicator color={theme.primary} />
                    </View>
                ) : (
                    <View style={styles.statsRow}>
                        <GlassCard style={styles.statCard}>
                            <Text style={styles.statValue}>{stats.appointments}</Text>
                            <Text style={styles.statLabel}>Appointments</Text>
                        </GlassCard>
                        <GlassCard style={styles.statCard}>
                            <Text style={styles.statValue}>{stats.labReports}</Text>
                            <Text style={styles.statLabel}>Lab Reports</Text>
                        </GlassCard>
                        <GlassCard style={styles.statCard}>
                            <Text style={styles.statValue}>{stats.medications}</Text>
                            <Text style={styles.statLabel}>Medications</Text>
                        </GlassCard>
                    </View>
                )}

                {/* Menu Items */}
                <View style={styles.menuSection}>
                    <GlassCard style={styles.menuItem}>
                        <View style={styles.menuIconContainer}>
                            <Text style={styles.menuIcon}>🔒</Text>
                        </View>
                        <View style={{ flex: 1 }}>
                             <Text style={styles.menuTitle}>Biometric Login</Text>
                             <Text style={styles.menuSubtitle}>Enable FaceID / Fingerprint</Text>
                        </View>
                        <Switch
                            trackColor={{ false: theme.glassBorder, true: theme.primary }}
                            thumbColor={theme.white}
                            ios_backgroundColor="#3e3e3e"
                            onValueChange={toggleBiometric}
                            value={biometricEnabled}
                            disabled={!biometricAvailable}
                        />
                    </GlassCard>

                    {menuItems.map((item) => (
                        <GlassCard key={item.id} style={styles.menuItem} onPress={item.action}>
                            <View style={styles.menuIconContainer}>
                                <Text style={styles.menuIcon}>{item.icon}</Text>
                            </View>
                            <Text style={styles.menuTitle}>{item.title}</Text>
                            <Text style={styles.menuArrow}>→</Text>
                        </GlassCard>
                    ))}
                </View>

                {/* Logout Button */}
                <Pressable style={styles.logoutBtn} onPress={handleLogout}>
                    <LinearGradient
                        colors={[theme.error, '#dc2626']}
                        style={styles.logoutGradient}
                    >
                        <Text style={styles.logoutText}>Logout</Text>
                    </LinearGradient>
                </Pressable>

                <View style={{ height: 100 }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.gradientStart,
    },
    scrollContent: {
        paddingTop: 60,
    },
    header: {
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: theme.white,
    },
    glassCard: {
        backgroundColor: theme.glassBackground,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: theme.glassBorder,
        overflow: 'hidden',
    },
    profileCard: {
        marginHorizontal: 20,
        padding: 24,
        alignItems: 'center',
        marginBottom: 20,
    },
    avatarContainer: {
        position: 'relative',
        marginBottom: 16,
    },
    avatarGradient: {
        width: 100,
        height: 100,
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarEmoji: {
        fontSize: 48,
    },
    onlineIndicator: {
        position: 'absolute',
        bottom: 4,
        right: 4,
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: theme.primary,
        borderWidth: 3,
        borderColor: theme.gradientStart,
    },
    profileName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: theme.white,
        marginBottom: 4,
    },
    profilePhone: {
        fontSize: 14,
        color: theme.textSecondary,
        marginBottom: 4,
    },
    profileMeta: {
        fontSize: 13,
        color: theme.textMuted,
        marginBottom: 12,
    },
    verifiedBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(20, 184, 166, 0.2)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    verifiedIcon: {
        color: theme.primary,
        fontWeight: 'bold',
        marginRight: 6,
    },
    verifiedText: {
        fontSize: 12,
        color: theme.primary,
    },
    loadingStats: {
        paddingVertical: 40,
        alignItems: 'center',
    },
    statsRow: {
        flexDirection: 'row',
        paddingHorizontal: 12,
        marginBottom: 20,
    },
    statCard: {
        flex: 1,
        marginHorizontal: 8,
        padding: 16,
        alignItems: 'center',
    },
    statValue: {
        fontSize: 24,
        fontWeight: 'bold',
        color: theme.white,
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 11,
        color: theme.textMuted,
    },
    menuSection: {
        paddingHorizontal: 20,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        marginBottom: 10,
    },
    menuIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    menuIcon: {
        fontSize: 20,
    },
    menuTitle: {
        fontSize: 16,
        color: theme.textPrimary,
    },
    menuSubtitle: {
        fontSize: 12,
        color: theme.textMuted,
    },
    menuArrow: {
        fontSize: 18,
        color: theme.textMuted,
        marginLeft: 'auto'
    },
    logoutBtn: {
        marginHorizontal: 20,
        marginTop: 20,
        borderRadius: 12,
        overflow: 'hidden',
    },
    logoutGradient: {
        paddingVertical: 16,
        alignItems: 'center',
    },
    logoutText: {
        fontSize: 16,
        fontWeight: '600',
        color: theme.white,
    },
});

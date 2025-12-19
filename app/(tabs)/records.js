import { View, Text, StyleSheet, ScrollView, Pressable, RefreshControl, ActivityIndicator } from 'react-native';
import { useState, useEffect, useCallback } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle, Line, Path } from 'react-native-svg';
import { useAuth } from '../../contexts/AuthContext';
import { getPatientLabOrders, getPatientPrescriptions, getPharmacyOrders } from '../../services/api';

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
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
};

// Neural Background
const NeuralBackground = () => (
    <Svg style={StyleSheet.absoluteFill} width="100%" height="100%">
        <Circle cx="70" cy="80" r="3" fill={theme.cyan} opacity={0.4} />
        <Circle cx="340" cy="120" r="4" fill={theme.accent} opacity={0.3} />
        <Circle cx="30" cy="350" r="2" fill={theme.primary} opacity={0.5} />
        <Line x1="70" y1="80" x2="340" y2="120" stroke={theme.cyan} strokeWidth="0.5" opacity={0.2} />
    </Svg>
);

// Glass Card Component
const GlassCard = ({ children, style, onPress }) => (
    <Pressable style={[styles.glassCard, style]} onPress={onPress} disabled={!onPress}>
        {children}
    </Pressable>
);

// Tab Component
const TabButton = ({ title, icon, active, onPress }) => (
    <Pressable 
        style={[styles.tab, active && styles.tabActive]} 
        onPress={onPress}
    >
        <Text style={styles.tabIcon}>{icon}</Text>
        <Text style={[styles.tabText, active && styles.tabTextActive]}>{title}</Text>
    </Pressable>
);

export default function RecordsScreen() {
    const { patient } = useAuth();
    const [activeTab, setActiveTab] = useState('lab');
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const [labResults, setLabResults] = useState([]);
    const [medications, setMedications] = useState([]);
    const [prescriptions, setPrescriptions] = useState([]);

    const loadData = async () => {
        if (!patient?.phone) return;
        
        setLoading(true);
        try {
            // Load all data in parallel
            const [labRes, rxRes, medRes] = await Promise.all([
                getPatientLabOrders(patient.phone),
                getPatientPrescriptions(patient.phone),
                getPharmacyOrders(patient.phone)
            ]);

            if (labRes.success) setLabResults(labRes.data || []);
            if (rxRes.success) setPrescriptions(rxRes.data || []);
            // Using pharmacy orders as proxy for active medications if needed, 
            // or just mock active meds from prescriptions if backend doesn't support "active meds" specifically yet.
            // For now, let's use pharmacy orders or prescriptions to derive medications.
            if (medRes.success) setMedications(medRes.data || []);

        } catch (error) {
            console.error('Failed to load records:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [patient]);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        loadData();
    }, []);

    const tabs = [
        { id: 'lab', title: 'Lab Results', icon: '🧪' },
        { id: 'medications', title: 'Medications', icon: '💊' },
        { id: 'prescriptions', title: 'Rx', icon: '📝' },
    ];

    const getStatusStyle = (status) => {
        switch (status?.toLowerCase()) {
            case 'ready':
            case 'completed': 
            case 'delivered':
                return { bg: `${theme.success}20`, color: theme.success };
            case 'active': 
            case 'processing':
                return { bg: `${theme.primary}20`, color: theme.primary };
            case 'pending': 
                return { bg: `${theme.warning}20`, color: theme.warning };
            default: return { bg: theme.glassBackground, color: theme.textMuted };
        }
    };

    const renderLabResults = () => (
        <View style={styles.content}>
            {labResults.length > 0 ? labResults.map((result) => (
                <GlassCard key={result.id || result.order_id} style={styles.recordCard}>
                    <View style={styles.recordIcon}>
                        <Text style={styles.recordEmoji}>🧪</Text>
                    </View>
                    <View style={styles.recordInfo}>
                        <Text style={styles.recordName}>{result.test_name || result.testName || 'Lab Test'}</Text>
                        <Text style={styles.recordDate}>{result.date ? new Date(result.date).toLocaleDateString() : 'Date TBD'}</Text>
                    </View>
                    <View style={styles.recordMeta}>
                        <View style={[styles.statusBadge, { backgroundColor: getStatusStyle(result.status).bg }]}>
                            <Text style={[styles.statusText, { color: getStatusStyle(result.status).color }]}>
                                {result.status || 'Pending'}
                            </Text>
                        </View>
                    </View>
                </GlassCard>
            )) : (
                <GlassCard style={styles.emptyCard}>
                    <Text style={styles.emptyIcon}>🧪</Text>
                    <Text style={styles.emptyTitle}>No lab results yet</Text>
                    <Text style={styles.emptyText}>Your lab reports will appear here</Text>
                </GlassCard>
            )}
        </View>
    );

    const renderMedications = () => (
        <View style={styles.content}>
            {medications.length > 0 ? medications.map((med) => (
                <GlassCard key={med.id || med.order_id} style={styles.recordCard}>
                    <View style={[styles.recordIcon, { backgroundColor: 'rgba(244, 114, 182, 0.2)' }]}>
                        <Text style={styles.recordEmoji}>💊</Text>
                    </View>
                    <View style={styles.recordInfo}>
                        <Text style={styles.recordName}>{med.medicine_name || med.items?.[0]?.name || 'Medication'}</Text>
                        <Text style={styles.recordDate}>{med.dosage || 'Dosage via Doctor'}</Text>
                    </View>
                    <View style={styles.recordMeta}>
                        <View style={[styles.statusBadge, { backgroundColor: getStatusStyle(med.status).bg }]}>
                            <Text style={[styles.statusText, { color: getStatusStyle(med.status).color }]}>
                                {med.status || 'Active'}
                            </Text>
                        </View>
                    </View>
                </GlassCard>
            )) : (
                <GlassCard style={styles.emptyCard}>
                    <Text style={styles.emptyIcon}>💊</Text>
                    <Text style={styles.emptyTitle}>No medications</Text>
                    <Text style={styles.emptyText}>Active medications will list here</Text>
                </GlassCard>
            )}
        </View>
    );

    const renderPrescriptions = () => (
        <View style={styles.content}>
            {prescriptions.length > 0 ? prescriptions.map((rx) => (
                <GlassCard key={rx.id || rx._id} style={styles.recordCard}>
                    <View style={[styles.recordIcon, { backgroundColor: 'rgba(139, 92, 246, 0.2)' }]}>
                        <Text style={styles.recordEmoji}>📝</Text>
                    </View>
                    <View style={styles.recordInfo}>
                        <Text style={styles.recordName}>{rx.doctor_name || 'Dr. Consult'}</Text>
                        <Text style={styles.recordDate}>{rx.date ? new Date(rx.date).toLocaleDateString() : 'Recent'}</Text>
                    </View>
                    <View style={styles.recordMeta}>
                        <View style={styles.itemsBadge}>
                            <Text style={styles.itemsText}>{rx.medicines?.length || 0} items</Text>
                        </View>
                        <Text style={styles.viewLink}>View →</Text>
                    </View>
                </GlassCard>
            )) : (
                 <GlassCard style={styles.emptyCard}>
                    <Text style={styles.emptyIcon}>📝</Text>
                    <Text style={styles.emptyTitle}>No prescriptions</Text>
                    <Text style={styles.emptyText}>Doctor prescriptions appear here</Text>
                </GlassCard>
            )}
        </View>
    );

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={[theme.gradientStart, theme.gradientMid, theme.gradientEnd]}
                style={StyleSheet.absoluteFill}
            />
            <NeuralBackground />
            
            <ScrollView 
                contentContainerStyle={styles.scrollContent} 
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.primary} />
                }
            >
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Medical Records</Text>
                    <Text style={styles.headerSubtitle}>Your health history at a glance</Text>
                    {loading && !refreshing && <ActivityIndicator color={theme.primary} style={{marginTop: 10}} />}
                </View>

                {/* Tabs */}
                <ScrollView 
                    horizontal 
                    showsHorizontalScrollIndicator={false} 
                    style={styles.tabsContainer}
                    contentContainerStyle={styles.tabsContent}
                >
                    {tabs.map((tab) => (
                        <TabButton
                            key={tab.id}
                            title={tab.title}
                            icon={tab.icon}
                            active={activeTab === tab.id}
                            onPress={() => setActiveTab(tab.id)}
                        />
                    ))}
                </ScrollView>

                {/* Content */}
                {activeTab === 'lab' && renderLabResults()}
                {activeTab === 'medications' && renderMedications()}
                {activeTab === 'prescriptions' && renderPrescriptions()}

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
    headerSubtitle: {
        fontSize: 14,
        color: theme.textSecondary,
        marginTop: 4,
    },
    tabsContainer: {
        marginBottom: 20,
    },
    tabsContent: {
        paddingHorizontal: 16,
        gap: 8,
    },
    tab: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 20,
        backgroundColor: theme.glassBackground,
        marginRight: 8,
        borderWidth: 1,
        borderColor: theme.glassBorder,
    },
    tabActive: {
        backgroundColor: theme.primary,
        borderColor: theme.primary,
    },
    tabIcon: {
        fontSize: 16,
        marginRight: 8,
    },
    tabText: {
        fontSize: 14,
        color: theme.textSecondary,
        fontWeight: '500',
    },
    tabTextActive: {
        color: theme.white,
    },
    content: {
        paddingHorizontal: 20,
    },
    glassCard: {
        backgroundColor: theme.glassBackground,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: theme.glassBorder,
        overflow: 'hidden',
    },
    recordCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        marginBottom: 12,
    },
    recordIcon: {
        width: 48,
        height: 48,
        borderRadius: 14,
        backgroundColor: 'rgba(20, 184, 166, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 14,
    },
    recordEmoji: {
        fontSize: 24,
    },
    recordInfo: {
        flex: 1,
    },
    recordName: {
        fontSize: 15,
        fontWeight: '600',
        color: theme.white,
        marginBottom: 2,
    },
    recordDate: {
        fontSize: 13,
        color: theme.textMuted,
    },
    recordMeta: {
        alignItems: 'flex-end',
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 10,
        marginBottom: 4,
    },
    statusText: {
        fontSize: 11,
        fontWeight: '600',
        textTransform: 'capitalize',
    },
    valueText: {
        fontSize: 12,
        color: theme.textSecondary,
    },
    itemsBadge: {
        backgroundColor: 'rgba(139, 92, 246, 0.2)',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 10,
        marginBottom: 4,
    },
    itemsText: {
        fontSize: 11,
        color: theme.secondary,
        fontWeight: '500',
    },
    viewLink: {
        fontSize: 12,
        color: theme.primary,
    },
    emptyCard: {
        padding: 40,
        alignItems: 'center',
    },
    emptyIcon: {
        fontSize: 48,
        marginBottom: 16,
        opacity: 0.5,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: theme.white,
        marginBottom: 8,
    },
    emptyText: {
        fontSize: 14,
        color: theme.textMuted,
    },
});

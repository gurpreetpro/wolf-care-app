import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator, Alert } from 'react-native';
import { useState, useEffect } from 'react';

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
    criticalBg: '#fef2f2',
    criticalBorder: '#dc2626',
};

const prescriptions = [
    {
        id: 1,
        doctor: 'Dr. Priya Sharma',
        date: 'Dec 10, 2024',
        status: 'active',
        medicines: [
            { name: 'Atorvastatin 10mg', dosage: 'Once daily at bedtime', duration: '30 days' },
            { name: 'Aspirin 75mg', dosage: 'Once daily after breakfast', duration: '30 days' },
        ]
    },
];

export default function RecordsScreen() {
    const [activeTab, setActiveTab] = useState('labs');
    const [expandedLab, setExpandedLab] = useState(null);
    const [labResults, setLabResults] = useState([]);
    const [medications, setMedications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [medsLoading, setMedsLoading] = useState(true);
    const [selectedResult, setSelectedResult] = useState(null);

    // TODO: Get this from user session
    const patientPhone = '7777777777';

    useEffect(() => {
        fetchLabOrders();
        fetchMedications();
    }, []);

    const fetchLabOrders = async () => {
        try {
            const response = await fetch(`http://localhost:5000/api/patients/app/lab-orders?phone=${patientPhone}`);
            const data = await response.json();
            
            if (data.success && data.labOrders) {
                setLabResults(data.labOrders);
            }
        } catch (error) {
            console.error('Failed to fetch lab orders:', error);
            setLabResults([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchMedications = async () => {
        try {
            const response = await fetch(`http://localhost:5000/api/patients/app/medications?phone=${patientPhone}`);
            const data = await response.json();
            
            if (data.success && data.medications) {
                setMedications(data.medications);
            }
        } catch (error) {
            console.error('Failed to fetch medications:', error);
            setMedications([]);
        } finally {
            setMedsLoading(false);
        }
    };

    const fetchLabResult = async (requestId) => {
        try {
            const response = await fetch(`http://localhost:5000/api/patients/app/lab-results/${requestId}`);
            const data = await response.json();
            
            if (data.success) {
                setSelectedResult(data);
                setExpandedLab(requestId);
            }
        } catch (error) {
            console.error('Failed to fetch lab result:', error);
            Alert.alert('Error', 'Failed to load lab results');
        }
    };

    const handleLabPress = (lab) => {
        if (expandedLab === lab.id) {
            setExpandedLab(null);
            setSelectedResult(null);
        } else if (lab.has_results) {
            fetchLabResult(lab.id);
        } else {
            setExpandedLab(lab.id);
        }
    };

    const getStatusBadge = (status, hasCritical) => {
        if (hasCritical) {
            return { bg: theme.criticalBg, text: '⚠️ Critical', color: theme.error };
        }
        switch (status?.toLowerCase()) {
            case 'completed':
                return { bg: '#d1fae5', text: '✓ Ready', color: theme.primary };
            case 'processing':
                return { bg: '#fef3c7', text: '🔄 Processing', color: theme.warning };
            case 'collected':
                return { bg: '#dbeafe', text: '📦 Collected', color: theme.info };
            default:
                return { bg: '#f1f5f9', text: '⏳ Pending', color: theme.gray };
        }
    };

    const getValueStatus = (param) => {
        if (param.status === 'low') return { color: theme.warning, icon: '↓' };
        if (param.status === 'high' || param.status === 'critical') return { color: theme.error, icon: '↑' };
        return { color: theme.primary, icon: '' };
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.title}>Medical Records</Text>
                <Text style={styles.subtitle}>Your health history at a glance</Text>
            </View>

            {/* Tabs */}
            <View style={styles.tabBar}>
                <Pressable 
                    style={[styles.tab, activeTab === 'labs' && styles.tabActive]}
                    onPress={() => setActiveTab('labs')}
                >
                    <Text style={[styles.tabText, activeTab === 'labs' && styles.tabTextActive]}>
                        🧪 Lab Results
                    </Text>
                </Pressable>
                <Pressable 
                    style={[styles.tab, activeTab === 'medications' && styles.tabActive]}
                    onPress={() => setActiveTab('medications')}
                >
                    <Text style={[styles.tabText, activeTab === 'medications' && styles.tabTextActive]}>
                        💊 Medications
                    </Text>
                </Pressable>
                <Pressable 
                    style={[styles.tab, activeTab === 'prescriptions' && styles.tabActive]}
                    onPress={() => setActiveTab('prescriptions')}
                >
                    <Text style={[styles.tabText, activeTab === 'prescriptions' && styles.tabTextActive]}>
                        📋 Rx
                    </Text>
                </Pressable>
            </View>

            <ScrollView style={styles.content}>
                {/* Lab Results Tab */}
                {activeTab === 'labs' && (
                    <View style={styles.section}>
                        {loading ? (
                            <View style={styles.loadingContainer}>
                                <ActivityIndicator size="large" color={theme.primary} />
                                <Text style={styles.loadingText}>Loading lab results...</Text>
                            </View>
                        ) : labResults.length === 0 ? (
                            <View style={styles.emptyContainer}>
                                <Text style={styles.emptyIcon}>🧪</Text>
                                <Text style={styles.emptyText}>No lab results yet</Text>
                                <Text style={styles.emptySubtext}>Your lab reports will appear here</Text>
                            </View>
                        ) : (
                            labResults.map((lab) => {
                                const badge = getStatusBadge(lab.status, lab.has_critical_value);
                                return (
                                    <Pressable 
                                        key={lab.id} 
                                        style={[
                                            styles.labCard,
                                            lab.has_critical_value && styles.criticalCard
                                        ]}
                                        onPress={() => handleLabPress(lab)}
                                    >
                                        <View style={styles.labHeader}>
                                            <View style={{ flex: 1 }}>
                                                <Text style={styles.labName}>{lab.test_name}</Text>
                                                <Text style={styles.labDate}>
                                                    {formatDate(lab.requested_at)} • {lab.doctor_name}
                                                </Text>
                                            </View>
                                            <View style={[styles.statusBadge, { backgroundColor: badge.bg }]}>
                                                <Text style={[styles.statusText, { color: badge.color }]}>
                                                    {badge.text}
                                                </Text>
                                            </View>
                                        </View>

                                        {/* Expanded Results */}
                                        {expandedLab === lab.id && selectedResult?.results?.parameters && (
                                            <View style={styles.resultsContainer}>
                                                {selectedResult.results.parameters.map((param, idx) => {
                                                    const valueStatus = getValueStatus(param);
                                                    return (
                                                        <View key={idx} style={styles.resultRow}>
                                                            <Text style={styles.resultTest}>{param.name}</Text>
                                                            <View style={styles.resultValues}>
                                                                <Text style={[styles.resultValue, { color: valueStatus.color }]}>
                                                                    {valueStatus.icon} {param.value} {param.unit}
                                                                </Text>
                                                                <Text style={styles.resultRange}>
                                                                    Normal: {param.normalMin} - {param.normalMax}
                                                                </Text>
                                                            </View>
                                                        </View>
                                                    );
                                                })}
                                                
                                                {/* Summary */}
                                                {selectedResult.results.summary && (
                                                    <View style={styles.summaryBox}>
                                                        <Text style={styles.summaryTitle}>📋 Summary</Text>
                                                        <Text style={styles.summaryText}>
                                                            {selectedResult.results.summary}
                                                        </Text>
                                                    </View>
                                                )}
                                            </View>
                                        )}

                                        {/* Pending/No Results Message */}
                                        {expandedLab === lab.id && !lab.has_results && (
                                            <View style={styles.pendingBox}>
                                                <Text style={styles.pendingText}>
                                                    ⏳ Results not yet available. Check back later.
                                                </Text>
                                            </View>
                                        )}

                                        <Text style={styles.expandHint}>
                                            {expandedLab === lab.id ? '▲ Tap to collapse' : '▼ Tap to view details'}
                                        </Text>
                                    </Pressable>
                                );
                            })
                        )}
                    </View>
                )}

                {/* Medications Tab */}
                {activeTab === 'medications' && (
                    <View style={styles.section}>
                        {medsLoading ? (
                            <View style={styles.loadingContainer}>
                                <ActivityIndicator size="large" color={theme.primary} />
                                <Text style={styles.loadingText}>Loading medications...</Text>
                            </View>
                        ) : medications.length === 0 ? (
                            <View style={styles.emptyContainer}>
                                <Text style={styles.emptyIcon}>💊</Text>
                                <Text style={styles.emptyText}>No medications yet</Text>
                                <Text style={styles.emptySubtext}>Your dispensed medications will appear here</Text>
                            </View>
                        ) : (
                            medications.map((med) => (
                                <View key={med.id} style={[styles.medCard, med.is_controlled && styles.controlledCard]}>
                                    <View style={styles.medHeader}>
                                        <View style={{ flex: 1 }}>
                                            <Text style={styles.medName}>{med.drug_name}</Text>
                                            {med.generic_name && (
                                                <Text style={styles.medGeneric}>{med.generic_name}</Text>
                                            )}
                                        </View>
                                        <View style={styles.medQtyBadge}>
                                            <Text style={styles.medQtyText}>Qty: {med.quantity}</Text>
                                        </View>
                                    </View>
                                    
                                    {med.dosage_instructions && (
                                        <View style={styles.dosageBox}>
                                            <Text style={styles.dosageLabel}>📋 Dosage Instructions</Text>
                                            <Text style={styles.dosageText}>{med.dosage_instructions}</Text>
                                        </View>
                                    )}
                                    
                                    <Text style={styles.medDate}>
                                        Dispensed on {formatDate(med.dispensed_at)}
                                        {med.dispensed_by_name && ` by ${med.dispensed_by_name}`}
                                    </Text>
                                    
                                    {med.is_controlled && (
                                        <View style={styles.controlledBadge}>
                                            <Text style={styles.controlledText}>⚠️ Controlled Substance</Text>
                                        </View>
                                    )}
                                </View>
                            ))
                        )}
                    </View>
                )}

                {/* Prescriptions Tab */}
                {activeTab === 'prescriptions' && (
                    <View style={styles.section}>
                        {prescriptions.map((rx) => (
                            <View key={rx.id} style={styles.rxCard}>
                                <View style={styles.rxHeader}>
                                    <View>
                                        <Text style={styles.rxDoctor}>{rx.doctor}</Text>
                                        <Text style={styles.rxDate}>{rx.date}</Text>
                                    </View>
                                    <View style={[
                                        styles.rxStatus,
                                        rx.status === 'active' ? styles.rxActive : styles.rxCompleted
                                    ]}>
                                        <Text style={styles.rxStatusText}>{rx.status}</Text>
                                    </View>
                                </View>

                                <View style={styles.medicineList}>
                                    {rx.medicines.map((med, idx) => (
                                        <View key={idx} style={styles.medicineItem}>
                                            <Text style={styles.medicineName}>💊 {med.name}</Text>
                                            <Text style={styles.medicineDosage}>{med.dosage}</Text>
                                            <Text style={styles.medicineDuration}>{med.duration}</Text>
                                        </View>
                                    ))}
                                </View>
                            </View>
                        ))}
                    </View>
                )}

                <View style={{ height: 100 }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.lightCream },
    header: { backgroundColor: theme.tealDark, padding: 24, paddingTop: 60 },
    title: { fontSize: 28, fontWeight: 'bold', color: theme.white },
    subtitle: { fontSize: 14, color: theme.gray, marginTop: 4 },
    tabBar: {
        flexDirection: 'row', backgroundColor: theme.white,
        paddingHorizontal: 20, paddingVertical: 8,
        borderBottomWidth: 1, borderBottomColor: '#e2e8f0',
    },
    tab: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 8 },
    tabActive: { backgroundColor: '#d1fae5' },
    tabText: { fontSize: 14, color: theme.gray },
    tabTextActive: { color: theme.primary, fontWeight: '600' },
    content: { flex: 1 },
    section: { padding: 20 },
    
    // Loading & Empty states
    loadingContainer: { padding: 40, alignItems: 'center' },
    loadingText: { fontSize: 14, color: theme.gray, marginTop: 12 },
    emptyContainer: { padding: 40, alignItems: 'center' },
    emptyIcon: { fontSize: 48, marginBottom: 12 },
    emptyText: { fontSize: 18, fontWeight: '600', color: theme.darkNavy },
    emptySubtext: { fontSize: 14, color: theme.gray, marginTop: 4 },
    
    // Lab Cards
    labCard: {
        backgroundColor: theme.white, borderRadius: 16, padding: 16, marginBottom: 16,
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
    },
    criticalCard: {
        backgroundColor: theme.criticalBg,
        borderWidth: 2,
        borderColor: theme.criticalBorder,
    },
    labHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    labName: { fontSize: 16, fontWeight: '600', color: theme.darkNavy, maxWidth: 200 },
    labDate: { fontSize: 13, color: theme.gray, marginTop: 4 },
    statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
    statusText: { fontSize: 12, fontWeight: '500' },
    expandHint: { fontSize: 12, color: theme.gray, textAlign: 'center', marginTop: 12 },
    
    // Results
    resultsContainer: { marginTop: 16, borderTopWidth: 1, borderTopColor: '#e2e8f0', paddingTop: 12 },
    resultRow: {
        flexDirection: 'row', justifyContent: 'space-between',
        paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#f1f5f9',
    },
    resultTest: { fontSize: 14, color: theme.darkNavy, flex: 1 },
    resultValues: { alignItems: 'flex-end' },
    resultValue: { fontSize: 14, fontWeight: '600' },
    resultRange: { fontSize: 11, color: theme.gray },
    
    // Summary
    summaryBox: {
        marginTop: 12, padding: 12, backgroundColor: '#f0fdf4',
        borderRadius: 8, borderLeftWidth: 3, borderLeftColor: theme.primary,
    },
    summaryTitle: { fontSize: 14, fontWeight: '600', color: theme.darkNavy },
    summaryText: { fontSize: 13, color: theme.gray, marginTop: 4 },
    
    // Pending
    pendingBox: {
        marginTop: 12, padding: 12, backgroundColor: '#fef3c7',
        borderRadius: 8, alignItems: 'center',
    },
    pendingText: { fontSize: 13, color: theme.warning },
    
    // Prescriptions
    rxCard: {
        backgroundColor: theme.white, borderRadius: 16, padding: 16, marginBottom: 16,
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
    },
    rxHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
    rxDoctor: { fontSize: 16, fontWeight: '600', color: theme.darkNavy },
    rxDate: { fontSize: 13, color: theme.gray, marginTop: 4 },
    rxStatus: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
    rxActive: { backgroundColor: '#d1fae5' },
    rxCompleted: { backgroundColor: '#f1f5f9' },
    rxStatusText: { fontSize: 12, fontWeight: '500', textTransform: 'capitalize' },
    medicineList: { gap: 12 },
    medicineItem: {
        backgroundColor: theme.lightCream, padding: 12, borderRadius: 10,
        borderLeftWidth: 3, borderLeftColor: theme.primary,
    },
    medicineName: { fontSize: 15, fontWeight: '600', color: theme.darkNavy },
    medicineDosage: { fontSize: 13, color: theme.gray, marginTop: 4 },
    medicineDuration: { fontSize: 12, color: theme.primary, marginTop: 2 },
    
    // Medications Tab
    medCard: {
        backgroundColor: theme.white, borderRadius: 16, padding: 16, marginBottom: 16,
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
    },
    controlledCard: {
        backgroundColor: '#fffbeb',
        borderWidth: 2,
        borderColor: theme.warning,
    },
    medHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    medName: { fontSize: 16, fontWeight: '600', color: theme.darkNavy },
    medGeneric: { fontSize: 13, color: theme.gray, marginTop: 2, fontStyle: 'italic' },
    medQtyBadge: { backgroundColor: '#dbeafe', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
    medQtyText: { fontSize: 12, color: theme.info, fontWeight: '600' },
    dosageBox: {
        marginTop: 12, padding: 12, backgroundColor: '#f0fdf4',
        borderRadius: 8, borderLeftWidth: 3, borderLeftColor: theme.primary,
    },
    dosageLabel: { fontSize: 12, fontWeight: '600', color: theme.darkNavy },
    dosageText: { fontSize: 13, color: theme.gray, marginTop: 4 },
    medDate: { fontSize: 12, color: theme.gray, marginTop: 12 },
    controlledBadge: {
        marginTop: 8, padding: 8, backgroundColor: '#fef3c7',
        borderRadius: 6, alignItems: 'center',
    },
    controlledText: { fontSize: 12, color: theme.warning, fontWeight: '500' },
});

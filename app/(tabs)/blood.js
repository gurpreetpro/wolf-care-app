/**
 * Blood Bank Tab
 * Patient view of blood bank requests and donation history
 */
import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    RefreshControl,
    ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../contexts/AuthContext';

const API_URL = 'https://wolf-hms-server-1026194439642.asia-south1.run.app';

export default function BloodBankScreen() {
    const { patient, trackActivity } = useAuth();
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [bloodRequests, setBloodRequests] = useState([]);
    const [bloodGroup, setBloodGroup] = useState(null);
    const [activeTab, setActiveTab] = useState('requests');

    useEffect(() => {
        loadBloodData();
    }, []);

    const loadBloodData = async () => {
        try {
            trackActivity?.();
            if (!patient?.phone) {
                setLoading(false);
                return;
            }

            // Fetch patient blood profile
            const response = await fetch(
                `${API_URL}/api/blood-bank/patient/${patient.id || 'unknown'}/blood-profile`
            );
            const data = await response.json();
            
            if (data.success) {
                setBloodGroup(data.profile?.blood_group || patient.blood_group);
                setBloodRequests(data.activeRequests || []);
            }
        } catch (error) {
            console.error('[BloodBank] Load error:', error);
        } finally {
            setLoading(false);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await loadBloodData();
        setRefreshing(false);
    };

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'approved': return '#10b981';
            case 'pending': return '#f59e0b';
            case 'completed': return '#3b82f6';
            case 'rejected': return '#ef4444';
            default: return '#64748b';
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#ef4444" />
                <Text style={styles.loadingText}>Loading Blood Bank...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <LinearGradient colors={['#1e293b', '#0f172a']} style={styles.header}>
                <Text style={styles.headerTitle}>🩸 Blood Bank</Text>
                {bloodGroup && (
                    <View style={styles.bloodGroupBadge}>
                        <Text style={styles.bloodGroupText}>{bloodGroup}</Text>
                    </View>
                )}
            </LinearGradient>

            {/* Tabs */}
            <View style={styles.tabContainer}>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'requests' && styles.activeTab]}
                    onPress={() => setActiveTab('requests')}
                >
                    <Text style={[styles.tabText, activeTab === 'requests' && styles.activeTabText]}>
                        Requests
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'donate' && styles.activeTab]}
                    onPress={() => setActiveTab('donate')}
                >
                    <Text style={[styles.tabText, activeTab === 'donate' && styles.activeTabText]}>
                        Donate
                    </Text>
                </TouchableOpacity>
            </View>

            <ScrollView
                style={styles.content}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#ef4444" />
                }
            >
                {activeTab === 'requests' ? (
                    <>
                        {bloodRequests.length === 0 ? (
                            <View style={styles.emptyState}>
                                <Text style={styles.emptyIcon}>🩸</Text>
                                <Text style={styles.emptyTitle}>No Blood Requests</Text>
                                <Text style={styles.emptyText}>
                                    You don't have any active blood requests
                                </Text>
                            </View>
                        ) : (
                            bloodRequests.map((request, index) => (
                                <View key={index} style={styles.card}>
                                    <View style={styles.cardHeader}>
                                        <Text style={styles.cardTitle}>
                                            {request.blood_group} - {request.component_type}
                                        </Text>
                                        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(request.status) }]}>
                                            <Text style={styles.statusText}>{request.status}</Text>
                                        </View>
                                    </View>
                                    <Text style={styles.cardDetail}>Units: {request.units_required}</Text>
                                    <Text style={styles.cardDetail}>Priority: {request.priority}</Text>
                                    {request.indication && (
                                        <Text style={styles.cardDetail}>Indication: {request.indication}</Text>
                                    )}
                                </View>
                            ))
                        )}
                    </>
                ) : (
                    <View style={styles.donateSection}>
                        <View style={styles.card}>
                            <Text style={styles.cardTitle}>🎗️ Become a Donor</Text>
                            <Text style={styles.donateText}>
                                Help save lives by registering as a blood donor.
                            </Text>
                            <TouchableOpacity style={styles.donateButton}>
                                <Text style={styles.donateButtonText}>Register as Donor</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.infoCard}>
                            <Text style={styles.infoTitle}>Blood Donation Facts</Text>
                            <Text style={styles.infoText}>• One donation can save up to 3 lives</Text>
                            <Text style={styles.infoText}>• You can donate every 3 months</Text>
                            <Text style={styles.infoText}>• Takes only 10-15 minutes</Text>
                            <Text style={styles.infoText}>• Free health check-up included</Text>
                        </View>
                    </View>
                )}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0f172a',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#0f172a',
    },
    loadingText: {
        color: '#94a3b8',
        marginTop: 12,
    },
    header: {
        paddingTop: 60,
        paddingBottom: 20,
        paddingHorizontal: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#ffffff',
    },
    bloodGroupBadge: {
        backgroundColor: '#ef4444',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
    },
    bloodGroupText: {
        color: '#ffffff',
        fontWeight: 'bold',
        fontSize: 18,
    },
    tabContainer: {
        flexDirection: 'row',
        backgroundColor: '#1e293b',
        marginHorizontal: 16,
        borderRadius: 12,
        padding: 4,
    },
    tab: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
        borderRadius: 10,
    },
    activeTab: {
        backgroundColor: '#ef4444',
    },
    tabText: {
        color: '#94a3b8',
        fontWeight: '600',
    },
    activeTabText: {
        color: '#ffffff',
    },
    content: {
        flex: 1,
        padding: 16,
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: 60,
    },
    emptyIcon: {
        fontSize: 64,
        marginBottom: 16,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#ffffff',
        marginBottom: 8,
    },
    emptyText: {
        color: '#94a3b8',
        textAlign: 'center',
    },
    card: {
        backgroundColor: '#1e293b',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#ffffff',
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusText: {
        color: '#ffffff',
        fontSize: 12,
        fontWeight: '600',
    },
    cardDetail: {
        color: '#94a3b8',
        marginBottom: 4,
    },
    donateSection: {
        gap: 16,
    },
    donateText: {
        color: '#94a3b8',
        marginVertical: 12,
        lineHeight: 22,
    },
    donateButton: {
        backgroundColor: '#ef4444',
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
    },
    donateButtonText: {
        color: '#ffffff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    infoCard: {
        backgroundColor: '#1e293b',
        borderRadius: 16,
        padding: 16,
        borderLeftWidth: 4,
        borderLeftColor: '#ef4444',
    },
    infoTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#ffffff',
        marginBottom: 12,
    },
    infoText: {
        color: '#94a3b8',
        marginBottom: 8,
        lineHeight: 20,
    },
});

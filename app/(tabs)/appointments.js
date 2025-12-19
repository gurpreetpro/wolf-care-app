import { View, Text, StyleSheet, ScrollView, Pressable, TextInput, ActivityIndicator, RefreshControl } from 'react-native';
import { useState, useEffect, useCallback } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle, Line } from 'react-native-svg';
import { getDoctors, checkApiHealth, getPatientAppointments } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import BookingModal from '../components/BookingModal';

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
        <Circle cx="60" cy="100" r="3" fill={theme.cyan} opacity={0.4} />
        <Circle cx="320" cy="150" r="4" fill={theme.accent} opacity={0.3} />
        <Circle cx="40" cy="400" r="2" fill={theme.primary} opacity={0.5} />
        <Line x1="60" y1="100" x2="320" y2="150" stroke={theme.cyan} strokeWidth="0.5" opacity={0.2} />
    </Svg>
);

// Glass Card Component
const GlassCard = ({ children, style, onPress }) => (
    <Pressable style={[styles.glassCard, style]} onPress={onPress} disabled={!onPress}>
        {children}
    </Pressable>
);

export default function AppointmentsScreen() {
    const { patient } = useAuth();
    const [searchQuery, setSearchQuery] = useState('');
    const [doctors, setDoctors] = useState([]);
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [apiConnected, setApiConnected] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    
    // Booking Modal State
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedDoctor, setSelectedDoctor] = useState(null);

    useEffect(() => {
        loadData();
    }, [patient]);

    const loadData = async () => {
        setLoading(true);
        setError(null);
        
        // 1. Check API Health
        const healthCheck = await checkApiHealth();
        setApiConnected(healthCheck.success);
        
        if (!healthCheck.success) {
            setError('Cannot connect to Wolf HMS server');
            setLoading(false);
            return;
        }
        
        // 2. Load Doctors
        const docResult = await getDoctors();
        if (docResult.success) {
            setDoctors(docResult.data || []);
        }

        // 3. Load My Appointments
        if (patient?.phone) {
            const aptResult = await getPatientAppointments(patient.phone);
            if (aptResult.success) {
                setAppointments(aptResult.data || []);
            }
        }
        
        setLoading(false);
        setRefreshing(false);
    };

    const handleRefresh = useCallback(() => {
        setRefreshing(true);
        loadData();
    }, []);

    const handleBookPress = (doctor) => {
        setSelectedDoctor(doctor);
        setModalVisible(true);
    };

    const handleBookingSuccess = () => {
        loadData(); // Refresh list after booking
    };

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'confirmed': return theme.success;
            case 'completed': return theme.secondary;
            case 'cancelled': return theme.error;
            case 'pending': return theme.warning;
            default: return theme.textMuted;
        }
    };

    // Filter doctors based on search
    const filteredDoctors = doctors.filter(doctor => 
        doctor.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doctor.specialty?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doctor.department?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={[theme.gradientStart, theme.gradientMid, theme.gradientEnd]}
                style={StyleSheet.absoluteFill}
            />
            <NeuralBackground />
            
            {/* Booking Modal */}
            <BookingModal 
                visible={modalVisible}
                doctor={selectedDoctor}
                patientPhone={patient?.phone}
                onClose={() => setModalVisible(false)}
                onSuccess={handleBookingSuccess}
            />

            <ScrollView 
                contentContainerStyle={styles.scrollContent} 
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={theme.primary} />
                }
            >
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Appointments</Text>
                    <Text style={styles.headerSubtitle}>Book or manage your appointments</Text>
                    
                    {/* API Status Indicator */}
                    <View style={[styles.apiStatus, { backgroundColor: apiConnected ? `${theme.success}30` : `${theme.error}30` }]}>
                        <View style={[styles.apiDot, { backgroundColor: apiConnected ? theme.success : theme.error }]} />
                        <Text style={[styles.apiText, { color: apiConnected ? theme.success : theme.error }]}>
                            {apiConnected ? 'Connected to Wolf HMS' : 'Offline Mode'}
                        </Text>
                    </View>
                </View>

                {/* Search Bar */}
                <GlassCard style={styles.searchCard}>
                    <Text style={styles.searchIcon}>🔍</Text>
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search doctors, specialties..."
                        placeholderTextColor={theme.textMuted}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </GlassCard>

                {/* My Appointments Section */}
                {appointments.length > 0 && (
                    <>
                        <Text style={styles.sectionTitle}>My Appointments</Text>
                        {appointments.map((apt) => (
                            <GlassCard key={apt.id} style={styles.appointmentCard}>
                                <View style={styles.appointmentHeader}>
                                    <View style={styles.appointmentInfo}>
                                        <Text style={styles.doctorName}>{apt.doctor_name || 'Dr. Unknown'}</Text>
                                        <Text style={styles.specialty}>{apt.department || 'General'}</Text>
                                    </View>
                                    <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(apt.status)}20` }]}>
                                        <Text style={[styles.statusText, { color: getStatusColor(apt.status) }]}>
                                            {apt.status || 'Pending'}
                                        </Text>
                                    </View>
                                </View>
                                <View style={styles.appointmentDetails}>
                                    <View style={styles.detailItem}>
                                        <Text style={styles.detailIcon}>📅</Text>
                                        <Text style={styles.detailText}>{apt.date ? new Date(apt.date).toLocaleDateString() : 'TBD'}</Text>
                                    </View>
                                    <View style={styles.detailItem}>
                                        <Text style={styles.detailIcon}>⏰</Text>
                                        <Text style={styles.detailText}>{apt.time || 'TBD'}</Text>
                                    </View>
                                    <View style={styles.detailItem}>
                                        <Text style={styles.detailIcon}>🏥</Text>
                                        <Text style={styles.detailText}>{apt.type || 'In-Person'}</Text>
                                    </View>
                                </View>
                            </GlassCard>
                        ))}
                    </>
                )}

                {/* Book Appointment Section */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>
                        Available Doctors
                    </Text>
                </View>

                {/* Loading State */}
                {loading && !refreshing && (
                    <GlassCard style={styles.loadingCard}>
                        <ActivityIndicator color={theme.primary} size="large" />
                        <Text style={styles.loadingText}>Loading doctors...</Text>
                    </GlassCard>
                )}

                {/* Error State */}
                {error && !loading && !refreshing && (
                    <GlassCard style={styles.errorCard}>
                        <Text style={styles.errorIcon}>⚠️</Text>
                        <Text style={styles.errorText}>{error}</Text>
                    </GlassCard>
                )}

                {/* Doctors List */}
                {!loading && filteredDoctors.map((doctor) => (
                    <GlassCard key={doctor.id || doctor.user_id} style={styles.doctorCard}>
                        <View style={styles.doctorAvatar}>
                            <Text style={styles.doctorEmoji}>
                                {doctor.gender === 'female' ? '👩‍⚕️' : '👨‍⚕️'}
                            </Text>
                        </View>
                        <View style={styles.doctorInfo}>
                            <Text style={styles.doctorName}>
                                {doctor.name || `Dr. ${doctor.first_name || ''} ${doctor.last_name || ''}`.trim()}
                            </Text>
                            <Text style={styles.doctorSpecialty}>
                                {doctor.specialty || doctor.department || 'General'}
                            </Text>
                            <View style={styles.doctorMeta}>
                                <Text style={styles.rating}>⭐ {doctor.rating || '4.5'}</Text>
                                <Text style={styles.fee}>₹{doctor.consultation_fee || doctor.fee || '500'}</Text>
                            </View>
                        </View>
                        <Pressable 
                            style={styles.bookBtn}
                            onPress={() => handleBookPress(doctor)}
                        >
                            <LinearGradient
                                colors={[theme.primary, theme.cyan]}
                                style={styles.bookGradient}
                            >
                                <Text style={styles.bookText}>Book</Text>
                            </LinearGradient>
                        </Pressable>
                    </GlassCard>
                ))}

                {/* No Results */}
                {!loading && filteredDoctors.length === 0 && (
                    <GlassCard style={styles.emptyCard}>
                        <Text style={styles.emptyIcon}>🔍</Text>
                        <Text style={styles.emptyText}>No doctors found</Text>
                    </GlassCard>
                )}

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
    apiStatus: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 12,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        alignSelf: 'flex-start',
    },
    apiDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 8,
    },
    apiText: {
        fontSize: 12,
        fontWeight: '500',
    },
    glassCard: {
        backgroundColor: theme.glassBackground,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: theme.glassBorder,
        overflow: 'hidden',
    },
    searchCard: {
        marginHorizontal: 20,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        marginBottom: 24,
    },
    searchIcon: {
        fontSize: 18,
        marginRight: 12,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: theme.white,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: theme.white,
        paddingHorizontal: 20,
        marginBottom: 16,
    },
    appointmentCard: {
        marginHorizontal: 20,
        padding: 16,
        marginBottom: 12,
    },
    appointmentHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    appointmentInfo: {
        flex: 1,
    },
    doctorName: {
        fontSize: 16,
        fontWeight: '600',
        color: theme.white,
    },
    specialty: {
        fontSize: 13,
        color: theme.textSecondary,
        marginTop: 2,
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '500',
        textTransform: 'capitalize',
    },
    appointmentDetails: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 12,
        gap: 16,
    },
    detailItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    detailIcon: {
        fontSize: 14,
        marginRight: 6,
    },
    detailText: {
        fontSize: 13,
        color: theme.textSecondary,
    },
    loadingCard: {
        marginHorizontal: 20,
        padding: 40,
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 16,
        fontSize: 14,
        color: theme.textSecondary,
    },
    errorCard: {
        marginHorizontal: 20,
        padding: 24,
        alignItems: 'center',
    },
    errorIcon: {
        fontSize: 32,
        marginBottom: 12,
    },
    errorText: {
        fontSize: 14,
        color: theme.error,
        textAlign: 'center',
        marginBottom: 16,
    },
    doctorCard: {
        marginHorizontal: 20,
        padding: 16,
        marginBottom: 12,
        flexDirection: 'row',
        alignItems: 'center',
    },
    doctorAvatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: 'rgba(255,255,255,0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    doctorEmoji: {
        fontSize: 28,
    },
    doctorInfo: {
        flex: 1,
    },
    doctorSpecialty: {
        fontSize: 13,
        color: theme.textSecondary,
    },
    doctorMeta: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 4,
    },
    rating: {
        fontSize: 12,
        color: theme.warning,
    },
    fee: {
        fontSize: 12,
        color: theme.primary,
        fontWeight: '600',
    },
    bookBtn: {
        borderRadius: 10,
        overflow: 'hidden',
    },
    bookGradient: {
        paddingVertical: 10,
        paddingHorizontal: 20,
    },
    bookText: {
        fontSize: 14,
        fontWeight: '600',
        color: theme.white,
    },
    emptyCard: {
        marginHorizontal: 20,
        padding: 40,
        alignItems: 'center',
    },
    emptyIcon: {
        fontSize: 40,
        marginBottom: 12,
        opacity: 0.5,
    },
    emptyText: {
        fontSize: 14,
        color: theme.textMuted,
    },
});

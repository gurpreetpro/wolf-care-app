import { View, Text, StyleSheet, ScrollView, Pressable, Modal, TextInput, ActivityIndicator } from 'react-native';
import { useState, useEffect } from 'react';
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

// Default time slots (can be enhanced to fetch per doctor)
const defaultTimeSlots = ['9:00 AM', '10:00 AM', '11:00 AM', '2:00 PM', '3:00 PM', '4:00 PM'];

const upcomingAppointments = [
    { id: 1, doctor: 'Dr. Priya Sharma', dept: 'Cardiology', date: 'Dec 15, 2024', time: '10:00 AM', status: 'confirmed' },
];

export default function AppointmentsScreen() {
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showBooking, setShowBooking] = useState(false);
    const [selectedDoctor, setSelectedDoctor] = useState(null);
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [selectedDate, setSelectedDate] = useState('Dec 16, 2024');
    const [consultationType, setConsultationType] = useState('in-person'); // 'in-person' | 'tele'

    // Fetch doctors from Wolf HMS API
    useEffect(() => {
        fetchDoctors();
    }, []);

    const fetchDoctors = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/patients/app/doctors');
            const data = await response.json();
            if (data.success && data.doctors) {
                // Map API response to expected format
                const formattedDoctors = data.doctors.map(d => ({
                    id: d.id,
                    name: d.name,
                    dept: d.department || 'General',
                    rating: 4.5 + Math.random() * 0.5, // Random rating for now
                    fee: d.fee || 500,
                    available: defaultTimeSlots,
                }));
                setDoctors(formattedDoctors);
            }
        } catch (error) {
            console.error('Failed to fetch doctors:', error);
            // Fallback to mock data if API fails
            setDoctors([
                { id: 1, name: 'Dr. Demo', dept: 'General', rating: 4.5, fee: 500, available: defaultTimeSlots },
            ]);
        } finally {
            setLoading(false);
        }
    };

    const handleBook = (doctor) => {
        setSelectedDoctor(doctor);
        setShowBooking(true);
    };

    const confirmBooking = () => {
        if (!selectedSlot) {
            alert('Please select a time slot');
            return;
        }
        setShowBooking(false);
        // Navigate to payment with booking details
        router.push({
            pathname: '/payment/checkout',
            params: {
                type: 'appointment',
                doctor: selectedDoctor.name,
                doctorId: selectedDoctor.id,
                dept: selectedDoctor.dept,
                date: selectedDate,
                time: selectedSlot,
                amount: selectedDoctor.fee,
                consultationType: consultationType, // 'in-person' or 'tele'
            }
        });
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.title}>Appointments</Text>
                <Text style={styles.subtitle}>Book or manage your appointments</Text>
            </View>

            <ScrollView style={styles.content}>
                {/* Upcoming */}
                {upcomingAppointments.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Upcoming</Text>
                        {upcomingAppointments.map((apt) => (
                            <View key={apt.id} style={styles.upcomingCard}>
                                <View style={styles.upcomingLeft}>
                                    <Text style={styles.upcomingDoctor}>{apt.doctor}</Text>
                                    <Text style={styles.upcomingDept}>{apt.dept}</Text>
                                    <Text style={styles.upcomingTime}>{apt.date} • {apt.time}</Text>
                                </View>
                                <View style={[styles.statusBadge, apt.status === 'confirmed' && styles.statusConfirmed]}>
                                    <Text style={styles.statusText}>{apt.status}</Text>
                                </View>
                            </View>
                        ))}
                    </View>
                )}

                {/* Book New */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>
                        Book Appointment {doctors.length > 0 && `(${doctors.length} doctors)`}
                    </Text>
                    {loading ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color={theme.primary} />
                            <Text style={styles.loadingText}>Loading doctors from HMS...</Text>
                        </View>
                    ) : doctors.length === 0 ? (
                        <Text style={styles.noDataText}>No doctors available</Text>
                    ) : (
                    doctors.map((doctor) => (
                        <View key={doctor.id} style={styles.doctorCard}>
                            <View style={styles.doctorAvatar}>
                                <Text style={styles.avatarEmoji}>👨‍⚕️</Text>
                            </View>
                            <View style={styles.doctorInfo}>
                                <Text style={styles.doctorName}>{doctor.name}</Text>
                                <Text style={styles.doctorDept}>{doctor.dept}</Text>
                                <View style={styles.doctorMeta}>
                                    <Text style={styles.rating}>⭐ {doctor.rating}</Text>
                                    <Text style={styles.fee}>₹{doctor.fee}</Text>
                                </View>
                            </View>
                            <Pressable style={styles.bookBtn} onPress={() => handleBook(doctor)}>
                                <Text style={styles.bookBtnText}>Book</Text>
                            </Pressable>
                        </View>
                    ))
                    )}
                </View>
            </ScrollView>

            {/* Booking Modal */}
            <Modal visible={showBooking} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Book Appointment</Text>
                        
                        {selectedDoctor && (
                            <>
                                <View style={styles.selectedDoctorCard}>
                                    <Text style={styles.selectedDoctorName}>{selectedDoctor.name}</Text>
                                    <Text style={styles.selectedDoctorDept}>{selectedDoctor.dept} • ₹{selectedDoctor.fee}</Text>
                                </View>

                                <Text style={styles.dateLabel}>Date: {selectedDate}</Text>

                                {/* Consultation Type Toggle */}
                                <Text style={styles.slotLabel}>Consultation Type</Text>
                                <View style={styles.consultTypeContainer}>
                                    <Pressable 
                                        style={[styles.consultTypeBtn, consultationType === 'in-person' && styles.consultTypeBtnActive]}
                                        onPress={() => setConsultationType('in-person')}
                                    >
                                        <Text style={styles.consultTypeIcon}>🏥</Text>
                                        <Text style={[styles.consultTypeText, consultationType === 'in-person' && styles.consultTypeTextActive]}>In-Person</Text>
                                    </Pressable>
                                    <Pressable 
                                        style={[styles.consultTypeBtn, consultationType === 'tele' && styles.consultTypeBtnActive]}
                                        onPress={() => setConsultationType('tele')}
                                    >
                                        <Text style={styles.consultTypeIcon}>📹</Text>
                                        <Text style={[styles.consultTypeText, consultationType === 'tele' && styles.consultTypeTextActive]}>Video Call</Text>
                                    </Pressable>
                                </View>

                                <Text style={styles.slotLabel}>Select Time Slot</Text>
                                <View style={styles.slotsContainer}>
                                    {selectedDoctor.available.map((slot) => (
                                        <Pressable 
                                            key={slot} 
                                            style={[styles.slotBtn, selectedSlot === slot && styles.slotBtnSelected]}
                                            onPress={() => setSelectedSlot(slot)}
                                        >
                                            <Text style={[styles.slotText, selectedSlot === slot && styles.slotTextSelected]}>
                                                {slot}
                                            </Text>
                                        </Pressable>
                                    ))}
                                </View>

                                <View style={styles.modalActions}>
                                    <Pressable style={styles.cancelBtn} onPress={() => setShowBooking(false)}>
                                        <Text style={styles.cancelBtnText}>Cancel</Text>
                                    </Pressable>
                                    <Pressable style={styles.confirmBtn} onPress={confirmBooking}>
                                        <Text style={styles.confirmBtnText}>Proceed to Pay</Text>
                                    </Pressable>
                                </View>
                            </>
                        )}
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.lightCream },
    header: { backgroundColor: theme.tealDark, padding: 24, paddingTop: 60 },
    title: { fontSize: 28, fontWeight: 'bold', color: theme.white },
    subtitle: { fontSize: 14, color: theme.gray, marginTop: 4 },
    content: { flex: 1 },
    section: { padding: 20 },
    sectionTitle: { fontSize: 18, fontWeight: '600', color: theme.darkNavy, marginBottom: 16 },
    upcomingCard: {
        backgroundColor: theme.white, borderRadius: 12, padding: 16,
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        borderLeftWidth: 4, borderLeftColor: theme.primary,
    },
    upcomingLeft: {},
    upcomingDoctor: { fontSize: 16, fontWeight: '600', color: theme.darkNavy },
    upcomingDept: { fontSize: 14, color: theme.gray },
    upcomingTime: { fontSize: 13, color: theme.primary, marginTop: 4 },
    statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
    statusConfirmed: { backgroundColor: '#d1fae5' },
    statusText: { fontSize: 12, color: theme.primary, fontWeight: '500', textTransform: 'capitalize' },
    doctorCard: {
        backgroundColor: theme.white, borderRadius: 12, padding: 16,
        flexDirection: 'row', alignItems: 'center', marginBottom: 12,
        shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.03, shadowRadius: 4, elevation: 1,
    },
    doctorAvatar: {
        width: 56, height: 56, borderRadius: 28, backgroundColor: '#e0f2fe',
        justifyContent: 'center', alignItems: 'center',
    },
    avatarEmoji: { fontSize: 28 },
    doctorInfo: { flex: 1, marginLeft: 12 },
    doctorName: { fontSize: 16, fontWeight: '600', color: theme.darkNavy },
    doctorDept: { fontSize: 14, color: theme.gray },
    doctorMeta: { flexDirection: 'row', gap: 12, marginTop: 4 },
    rating: { fontSize: 13, color: theme.warning },
    fee: { fontSize: 13, color: theme.primary, fontWeight: '600' },
    bookBtn: {
        backgroundColor: theme.primary, paddingHorizontal: 16, paddingVertical: 10,
        borderRadius: 8,
    },
    bookBtnText: { color: theme.white, fontWeight: '600', fontSize: 14 },
    modalOverlay: {
        flex: 1, backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: theme.white, borderTopLeftRadius: 24, borderTopRightRadius: 24,
        padding: 24, maxHeight: '70%',
    },
    modalTitle: { fontSize: 22, fontWeight: 'bold', color: theme.darkNavy, marginBottom: 20 },
    selectedDoctorCard: {
        backgroundColor: theme.lightCream, padding: 16, borderRadius: 12, marginBottom: 20,
    },
    selectedDoctorName: { fontSize: 18, fontWeight: '600', color: theme.darkNavy },
    selectedDoctorDept: { fontSize: 14, color: theme.gray, marginTop: 4 },
    dateLabel: { fontSize: 14, color: theme.gray, marginBottom: 16 },
    slotLabel: { fontSize: 16, fontWeight: '600', color: theme.darkNavy, marginBottom: 12 },
    slotsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 24 },
    slotBtn: {
        paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8,
        borderWidth: 1, borderColor: '#e2e8f0', backgroundColor: theme.white,
    },
    slotBtnSelected: { backgroundColor: theme.primary, borderColor: theme.primary },
    slotText: { fontSize: 14, color: theme.darkNavy },
    slotTextSelected: { color: theme.white, fontWeight: '600' },
    modalActions: { flexDirection: 'row', gap: 12 },
    cancelBtn: {
        flex: 1, paddingVertical: 14, borderRadius: 12,
        borderWidth: 1, borderColor: '#e2e8f0', alignItems: 'center',
    },
    cancelBtnText: { fontSize: 16, color: theme.gray },
    confirmBtn: {
        flex: 1, paddingVertical: 14, borderRadius: 12,
        backgroundColor: theme.primary, alignItems: 'center',
    },
    confirmBtnText: { fontSize: 16, color: theme.white, fontWeight: '600' },
    // Consultation Type Toggle Styles
    consultTypeContainer: { 
        flexDirection: 'row', gap: 12, marginBottom: 20,
    },
    consultTypeBtn: {
        flex: 1, paddingVertical: 16, borderRadius: 12,
        borderWidth: 2, borderColor: '#e2e8f0', alignItems: 'center',
        backgroundColor: theme.white,
    },
    consultTypeBtnActive: { 
        borderColor: theme.primary, backgroundColor: '#f0fdf4',
    },
    consultTypeIcon: { fontSize: 28, marginBottom: 4 },
    consultTypeText: { fontSize: 14, color: theme.gray, fontWeight: '500' },
    consultTypeTextActive: { color: theme.primary, fontWeight: '600' },
    // Loading indicator styles
    loadingContainer: {
        padding: 40, alignItems: 'center',
    },
    loadingText: { 
        fontSize: 14, color: theme.gray, marginTop: 12,
    },
    noDataText: { 
        fontSize: 14, color: theme.gray, padding: 20, textAlign: 'center',
    },
});

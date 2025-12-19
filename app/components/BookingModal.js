import { View, Text, StyleSheet, Modal, Pressable, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { bookAppointment } from '../../services/api';

// Theme (matching the rest of the app)
const theme = {
    gradientStart: '#0f172a',
    glassBackground: 'rgba(30, 41, 59, 0.95)',
    glassBorder: 'rgba(255,255,255,0.15)',
    primary: '#14b8a6',
    white: '#ffffff',
    textSecondary: 'rgba(255,255,255,0.7)',
    textMuted: 'rgba(255,255,255,0.5)',
    error: '#ef4444',
};

export default function BookingModal({ visible, onClose, doctor, patientPhone, onSuccess }) {
    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedTime, setSelectedTime] = useState(null);
    const [loading, setLoading] = useState(false);

    // Generate next 7 days
    const getDates = () => {
        const dates = [];
        for (let i = 1; i <= 7; i++) {
            const d = new Date();
            d.setDate(d.getDate() + i);
            dates.push({
                fullDate: d.toISOString().split('T')[0],
                day: d.toLocaleDateString('en-US', { weekday: 'short' }),
                date: d.getDate(),
            });
        }
        return dates;
    };

    // Generate time slots
    const timeSlots = [
        '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM',
        '11:00 AM', '11:30 AM', '04:00 PM', '04:30 PM',
        '05:00 PM', '05:30 PM', '06:00 PM', '06:30 PM'
    ];

    const handleBook = async () => {
        if (!selectedDate || !selectedTime) {
            Alert.alert('Selection Required', 'Please select both a date and time.');
            return;
        }

        setLoading(true);
        try {
            const appointmentData = {
                patientPhone,
                doctorId: doctor.id || doctor.user_id, // Handle both ID formats
                doctorName: doctor.name || `Dr. ${doctor.first_name || ''} ${doctor.last_name || ''}`,
                date: selectedDate,
                time: selectedTime,
                type: 'In-Person', // Default for now
                notes: 'Booked via Wolf Care App'
            };

            const result = await bookAppointment(appointmentData);

            if (result.success) {
                Alert.alert('Success', 'Appointment booked successfully! 🎉', [
                    { text: 'OK', onPress: () => {
                         onSuccess();
                         onClose();
                    }}
                ]);
            } else {
                Alert.alert('Booking Failed', result.error || 'Please try again.');
            }
        } catch (error) {
            Alert.alert('Error', 'Something went wrong.');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (!visible || !doctor) return null;

    const dates = getDates();

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={styles.modalContainer}>
                    <LinearGradient
                        colors={[theme.gradientStart, '#1e293b']}
                        style={StyleSheet.absoluteFill}
                    />
                    
                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={styles.title}>Book Appointment</Text>
                        <Pressable onPress={onClose} style={styles.closeBtn}>
                            <Text style={styles.closeText}>✕</Text>
                        </Pressable>
                    </View>

                    {/* Doctor Info */}
                    <View style={styles.doctorInfo}>
                        <View style={styles.avatar}>
                            <Text style={{fontSize: 24}}>{doctor.gender === 'female' ? '👩‍⚕️' : '👨‍⚕️'}</Text>
                        </View>
                        <View>
                            <Text style={styles.doctorName}>
                                {doctor.name || `Dr. ${doctor.first_name || ''} ${doctor.last_name || ''}`}
                            </Text>
                            <Text style={styles.specialty}>
                                {doctor.specialty || doctor.department || 'Specialist'}
                            </Text>
                        </View>
                    </View>

                    <ScrollView showsVerticalScrollIndicator={false}>
                        {/* Date Selection */}
                        <Text style={styles.sectionTitle}>Select Date</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dateScroll}>
                            {dates.map((item) => (
                                <Pressable
                                    key={item.fullDate}
                                    style={[
                                        styles.dateChip,
                                        selectedDate === item.fullDate && styles.dateChipSelected
                                    ]}
                                    onPress={() => setSelectedDate(item.fullDate)}
                                >
                                    <Text style={[
                                        styles.dateDay,
                                        selectedDate === item.fullDate && styles.textSelected
                                    ]}>{item.day}</Text>
                                    <Text style={[
                                        styles.dateNum,
                                        selectedDate === item.fullDate && styles.textSelected
                                    ]}>{item.date}</Text>
                                </Pressable>
                            ))}
                        </ScrollView>

                        {/* Time Selection */}
                        <Text style={styles.sectionTitle}>Select Time</Text>
                        <View style={styles.timeGrid}>
                            {timeSlots.map((time) => (
                                <Pressable
                                    key={time}
                                    style={[
                                        styles.timeChip,
                                        selectedTime === time && styles.timeChipSelected
                                    ]}
                                    onPress={() => setSelectedTime(time)}
                                >
                                    <Text style={[
                                        styles.timeText,
                                        selectedTime === time && styles.textSelected
                                    ]}>{time}</Text>
                                </Pressable>
                            ))}
                        </View>
                    </ScrollView>

                    {/* Confirm Button */}
                    <View style={styles.footer}>
                        <Pressable 
                            style={[styles.confirmBtn, loading && styles.disabledBtn]}
                            onPress={handleBook}
                            disabled={loading}
                        >
                            <LinearGradient
                                colors={loading ? ['#64748b', '#64748b'] : [theme.primary, '#06b6d4']}
                                style={styles.btnGradient}
                            >
                                {loading ? (
                                    <ActivityIndicator color="white" />
                                ) : (
                                    <Text style={styles.btnText}>Confirm Booking</Text>
                                )}
                            </LinearGradient>
                        </Pressable>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.7)',
        justifyContent: 'flex-end',
    },
    modalContainer: {
        height: '85%',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        overflow: 'hidden',
        backgroundColor: theme.gradientStart,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: theme.glassBorder,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: theme.white,
    },
    closeBtn: {
        padding: 8,
    },
    closeText: {
        fontSize: 20,
        color: theme.textSecondary,
    },
    doctorInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
        backgroundColor: 'rgba(255,255,255,0.05)',
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: 'rgba(255,255,255,0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    doctorName: {
        fontSize: 18,
        fontWeight: '600',
        color: theme.white,
    },
    specialty: {
        color: theme.textSecondary,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: theme.white,
        marginLeft: 20,
        marginTop: 20,
        marginBottom: 12,
    },
    dateScroll: {
        paddingLeft: 20,
        marginBottom: 8,
    },
    dateChip: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 12,
        padding: 12,
        alignItems: 'center',
        marginRight: 12,
        width: 70,
        borderWidth: 1,
        borderColor: theme.glassBorder,
    },
    dateChipSelected: {
        backgroundColor: theme.primary,
        borderColor: theme.primary,
    },
    dateDay: {
        color: theme.textSecondary,
        fontSize: 12,
        marginBottom: 4,
    },
    dateNum: {
        color: theme.white,
        fontSize: 18,
        fontWeight: 'bold',
    },
    textSelected: {
        color: '#ffffff',
    },
    timeGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: 20,
        gap: 12,
    },
    timeChip: {
        width: '30%',
        backgroundColor: 'rgba(255,255,255,0.05)',
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: theme.glassBorder,
    },
    timeChipSelected: {
        backgroundColor: theme.primary,
        borderColor: theme.primary,
    },
    timeText: {
        color: theme.textSecondary,
        fontSize: 14,
    },
    footer: {
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: theme.glassBorder,
        marginTop: 'auto',
    },
    confirmBtn: {
        borderRadius: 16,
        overflow: 'hidden',
    },
    btnGradient: {
        paddingVertical: 16,
        alignItems: 'center',
    },
    btnText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    disabledBtn: {
        opacity: 0.7,
    },
});

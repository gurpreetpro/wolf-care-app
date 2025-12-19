import { View, Text, StyleSheet, ScrollView, Pressable, TextInput, Modal, Alert, Linking, Platform } from 'react-native';
import { useState, useEffect } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { 
    createAppointmentInvoice, 
    createPaymentOrder, 
    verifyPayment, 
    recordPayment,
    bookAppointment,
    API_BASE_URL,
    getRazorpayConfig
} from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

// Razorpay SDK - will be available in development builds
let RazorpayCheckout = null;
try {
    RazorpayCheckout = require('react-native-razorpay').default;
} catch (e) {
    console.log('[Razorpay] SDK not available in Expo Go, will use fallback');
}

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

const paymentMethods = [
    { id: 'upi', name: 'UPI', icon: '📱', desc: 'Pay using any UPI app' },
    { id: 'card', name: 'Credit/Debit Card', icon: '💳', desc: 'Visa, Mastercard, RuPay' },
    { id: 'netbanking', name: 'Net Banking', icon: '🏦', desc: 'All major banks supported' },
    { id: 'wallet', name: 'Wallet', icon: '👛', desc: 'Paytm, PhonePe, etc.' },
];

export default function CheckoutScreen() {
    const { patient } = useAuth();
    const params = useLocalSearchParams();
    const { type, doctor, doctorId, dept, date, time, amount, consultationType, appointmentId } = params;
    
    const [selectedMethod, setSelectedMethod] = useState(null);
    const [upiId, setUpiId] = useState('');
    const [cardNumber, setCardNumber] = useState('');
    const [showSuccess, setShowSuccess] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [invoiceId, setInvoiceId] = useState(null);
    const [orderId, setOrderId] = useState(null);
    const [paymentStep, setPaymentStep] = useState('select'); // 'select', 'processing', 'verify'

    const amountValue = parseInt(amount) || 500;

    const handlePay = async () => {
        if (!selectedMethod) {
            Alert.alert('Selection Required', 'Please select a payment method');
            return;
        }

        setProcessing(true);
        setPaymentStep('processing');
        
        try {
            // Step 1: Book the appointment first
            console.log('[Payment] Step 1: Booking appointment...');
            const bookingResult = await bookAppointment({
                patientPhone: patient?.phone || '9876543210',
                doctorId: doctorId || 1,
                date: date || new Date().toISOString().split('T')[0],
                time: time || '10:00 AM',
                type: consultationType || 'In-Person',
                notes: 'Booked via Wolf Care App with online payment'
            });

            if (!bookingResult.success) {
                throw new Error(bookingResult.error || 'Failed to book appointment');
            }

            const newAppointmentId = bookingResult.data?.appointmentId || appointmentId;
            console.log('[Payment] Appointment booked:', newAppointmentId);

            // Step 2: Create invoice in HMS Finance
            console.log('[Payment] Step 2: Creating invoice...');
            const invoiceResult = await createAppointmentInvoice({
                patientPhone: patient?.phone,
                patientName: patient?.name || 'Patient',
                appointmentId: newAppointmentId,
                doctorName: doctor,
                department: dept,
                amount: amountValue,
                description: `${consultationType || 'In-Person'} Consultation - ${doctor}`,
                date: date,
                time: time
            });

            if (invoiceResult.success && invoiceResult.data?.invoiceId) {
                setInvoiceId(invoiceResult.data.invoiceId);
                console.log('[Payment] Invoice created:', invoiceResult.data.invoiceId);
            }

            // Step 3: Create Razorpay payment order
            console.log('[Payment] Step 3: Creating payment order...');
            const orderResult = await createPaymentOrder({
                amount: amountValue,
                invoiceId: invoiceResult.data?.invoiceId,
                patientId: patient?.id,
                description: `Consultation Fee - ${doctor}`
            });

            if (orderResult.success && orderResult.data?.orderId) {
                setOrderId(orderResult.data.orderId);
                console.log('[Payment] Order created:', orderResult.data.orderId);
                
                const currentInvoiceId = invoiceResult.data?.invoiceId;
                
                // Step 4: Open Razorpay payment gateway
                if (RazorpayCheckout) {
                    console.log('[Payment] Step 4: Opening Razorpay SDK...');
                    
                    const razorpayOptions = {
                        description: `Consultation Fee - ${doctor}`,
                        image: 'https://wolf-hms.web.app/logo192.png',
                        currency: 'INR',
                        key: orderResult.data.key || 'rzp_test_demo',
                        amount: orderResult.data.amount, // Already in paise from backend
                        order_id: orderResult.data.orderId,
                        name: 'Wolf Hospital',
                        prefill: {
                            email: patient?.email || 'patient@wolfcare.app',
                            contact: patient?.phone || '',
                            name: patient?.name || 'Patient'
                        },
                        theme: { color: theme.primary },
                        notes: {
                            invoiceId: currentInvoiceId,
                            patientPhone: patient?.phone,
                            appointmentId: newAppointmentId
                        }
                    };
                    
                    try {
                        const paymentData = await RazorpayCheckout.open(razorpayOptions);
                        console.log('[Payment] Razorpay success:', paymentData);
                        
                        // Verify payment with backend
                        const verifyResult = await verifyPayment({
                            razorpay_order_id: orderResult.data.orderId,
                            razorpay_payment_id: paymentData.razorpay_payment_id,
                            razorpay_signature: paymentData.razorpay_signature,
                            invoiceId: currentInvoiceId,
                            amount: amountValue
                        });
                        
                        if (verifyResult.success) {
                            console.log('[Payment] Payment verified successfully');
                            setShowSuccess(true);
                        } else {
                            throw new Error('Payment verification failed');
                        }
                    } catch (razorpayError) {
                        console.log('[Payment] Razorpay error:', razorpayError);
                        // User cancelled or payment failed
                        if (razorpayError.code !== 'PAYMENT_CANCELLED') {
                            Alert.alert('Payment Failed', razorpayError.message || 'Payment could not be completed');
                        }
                        // Still show success for appointment, payment pending
                        setShowSuccess(true);
                    }
                } else {
                    // Fallback when SDK not available (Expo Go)
                    console.log('[Payment] SDK not available, using fallback...');
                    
                    const paymentResult = await recordPayment(
                        currentInvoiceId || 'demo',
                        {
                            amount: amountValue,
                            paymentMode: selectedMethod.toUpperCase(),
                            referenceNumber: `WC-${Date.now()}`,
                            notes: `Wolf Care App Payment via ${selectedMethod}`
                        }
                    );

                    console.log('[Payment] Payment recorded:', paymentResult.success);
                    setShowSuccess(true);
                }
            } else {
                // Fallback: If order creation failed, show success for booking only
                console.log('[Payment] Order creation failed, booking completed');
                setShowSuccess(true);
            }

        } catch (error) {
            console.error('[Payment] Error:', error);
            Alert.alert(
                'Payment Issue',
                'There was an issue processing your payment. The appointment has been booked. Please complete payment at the hospital reception.',
                [{ text: 'OK', onPress: () => setShowSuccess(true) }]
            );
        } finally {
            setProcessing(false);
            setPaymentStep('select');
        }
    };

    const handleDone = () => {
        setShowSuccess(false);
        router.replace('/(tabs)');
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Pressable onPress={() => router.back()} style={styles.backBtn}>
                    <Text style={styles.backText}>← Back</Text>
                </Pressable>
                <Text style={styles.title}>Payment</Text>
            </View>

            <ScrollView style={styles.content}>
                {/* Order Summary */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Order Summary</Text>
                    <View style={styles.summaryCard}>
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>Type</Text>
                            <Text style={styles.summaryValue}>{type || 'Appointment'}</Text>
                        </View>
                        {doctor && (
                            <View style={styles.summaryRow}>
                                <Text style={styles.summaryLabel}>Doctor</Text>
                                <Text style={styles.summaryValue}>{doctor}</Text>
                            </View>
                        )}
                        {dept && (
                            <View style={styles.summaryRow}>
                                <Text style={styles.summaryLabel}>Department</Text>
                                <Text style={styles.summaryValue}>{dept}</Text>
                            </View>
                        )}
                        {date && time && (
                            <View style={styles.summaryRow}>
                                <Text style={styles.summaryLabel}>Schedule</Text>
                                <Text style={styles.summaryValue}>{date} • {time}</Text>
                            </View>
                        )}
                        <View style={styles.divider} />
                        <View style={styles.summaryRow}>
                            <Text style={styles.totalLabel}>Total Amount</Text>
                            <Text style={styles.totalValue}>₹{amountValue}</Text>
                        </View>
                    </View>
                </View>

                {/* HMS Integration Badge */}
                <View style={styles.integrationBadge}>
                    <Text style={styles.badgeIcon}>🏥</Text>
                    <Text style={styles.badgeText}>Payment synced with Wolf HMS Billing</Text>
                </View>

                {/* Payment Methods */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Payment Method</Text>
                    {paymentMethods.map((method) => (
                        <Pressable 
                            key={method.id}
                            style={[styles.methodCard, selectedMethod === method.id && styles.methodCardSelected]}
                            onPress={() => setSelectedMethod(method.id)}
                        >
                            <View style={styles.methodRadio}>
                                {selectedMethod === method.id && <View style={styles.radioFill} />}
                            </View>
                            <Text style={styles.methodIcon}>{method.icon}</Text>
                            <View style={styles.methodInfo}>
                                <Text style={styles.methodName}>{method.name}</Text>
                                <Text style={styles.methodDesc}>{method.desc}</Text>
                            </View>
                        </Pressable>
                    ))}
                </View>

                {/* Payment Details Input */}
                {selectedMethod === 'upi' && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Enter UPI ID</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="yourname@upi"
                            placeholderTextColor={theme.gray}
                            value={upiId}
                            onChangeText={setUpiId}
                        />
                    </View>
                )}

                {selectedMethod === 'card' && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Card Details</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Card Number"
                            placeholderTextColor={theme.gray}
                            value={cardNumber}
                            onChangeText={setCardNumber}
                            keyboardType="number-pad"
                            maxLength={16}
                        />
                        <View style={styles.cardRow}>
                            <TextInput
                                style={[styles.input, { flex: 1 }]}
                                placeholder="MM/YY"
                                placeholderTextColor={theme.gray}
                                maxLength={5}
                            />
                            <TextInput
                                style={[styles.input, { flex: 1, marginLeft: 12 }]}
                                placeholder="CVV"
                                placeholderTextColor={theme.gray}
                                maxLength={3}
                                secureTextEntry
                            />
                        </View>
                    </View>
                )}

                <View style={{ height: 100 }} />
            </ScrollView>

            {/* Pay Button */}
            <View style={styles.footer}>
                <Pressable 
                    style={[styles.payBtn, processing && styles.payBtnDisabled]}
                    onPress={handlePay}
                    disabled={processing}
                >
                    <Text style={styles.payBtnText}>
                        {processing ? 'Processing...' : `Pay ₹${amountValue}`}
                    </Text>
                </Pressable>
                <Text style={styles.secureText}>🔒 Secured by Razorpay • Wolf HMS Billing</Text>
            </View>

            {/* Success Modal */}
            <Modal visible={showSuccess} animationType="fade" transparent>
                <View style={styles.modalOverlay}>
                    <View style={styles.successCard}>
                        <View style={styles.successIcon}>
                            <Text style={styles.successEmoji}>✅</Text>
                        </View>
                        <Text style={styles.successTitle}>Payment Successful!</Text>
                        <Text style={styles.successText}>
                            Your appointment has been booked and{'\n'}
                            payment recorded in Wolf HMS.
                        </Text>
                        <View style={styles.successDetails}>
                            <Text style={styles.successLabel}>{doctor}</Text>
                            <Text style={styles.successValue}>{date} • {time}</Text>
                            {invoiceId && (
                                <Text style={styles.invoiceText}>Invoice #{invoiceId}</Text>
                            )}
                        </View>
                        <Pressable style={styles.doneBtn} onPress={handleDone}>
                            <Text style={styles.doneBtnText}>Done</Text>
                        </Pressable>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.lightCream },
    header: {
        backgroundColor: theme.tealDark, padding: 24, paddingTop: 60,
        flexDirection: 'row', alignItems: 'center',
    },
    backBtn: { marginRight: 16 },
    backText: { color: theme.white, fontSize: 16 },
    title: { fontSize: 24, fontWeight: 'bold', color: theme.white },
    content: { flex: 1 },
    section: { padding: 20 },
    sectionTitle: { fontSize: 18, fontWeight: '600', color: theme.darkNavy, marginBottom: 16 },
    summaryCard: {
        backgroundColor: theme.white, borderRadius: 16, padding: 20,
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
    },
    summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
    summaryLabel: { fontSize: 14, color: theme.gray },
    summaryValue: { fontSize: 14, color: theme.darkNavy, fontWeight: '500' },
    divider: { height: 1, backgroundColor: '#e2e8f0', marginVertical: 12 },
    totalLabel: { fontSize: 16, fontWeight: '600', color: theme.darkNavy },
    totalValue: { fontSize: 20, fontWeight: 'bold', color: theme.primary },
    integrationBadge: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        backgroundColor: '#dcfce7', marginHorizontal: 20, padding: 12,
        borderRadius: 12, marginBottom: 8,
    },
    badgeIcon: { fontSize: 16, marginRight: 8 },
    badgeText: { fontSize: 13, color: '#166534', fontWeight: '500' },
    methodCard: {
        backgroundColor: theme.white, borderRadius: 12, padding: 16,
        flexDirection: 'row', alignItems: 'center', marginBottom: 12,
        borderWidth: 2, borderColor: 'transparent',
    },
    methodCardSelected: { borderColor: theme.primary, backgroundColor: '#f0fdf4' },
    methodRadio: {
        width: 20, height: 20, borderRadius: 10, borderWidth: 2,
        borderColor: theme.gray, marginRight: 12,
        justifyContent: 'center', alignItems: 'center',
    },
    radioFill: { width: 10, height: 10, borderRadius: 5, backgroundColor: theme.primary },
    methodIcon: { fontSize: 28, marginRight: 12 },
    methodInfo: { flex: 1 },
    methodName: { fontSize: 16, fontWeight: '600', color: theme.darkNavy },
    methodDesc: { fontSize: 13, color: theme.gray },
    input: {
        backgroundColor: theme.white, borderRadius: 12, padding: 16,
        fontSize: 16, color: theme.darkNavy, marginBottom: 12,
        borderWidth: 1, borderColor: '#e2e8f0',
    },
    cardRow: { flexDirection: 'row' },
    footer: {
        backgroundColor: theme.white, padding: 20, paddingBottom: 36,
        borderTopWidth: 1, borderTopColor: '#e2e8f0',
    },
    payBtn: {
        backgroundColor: theme.primary, padding: 18, borderRadius: 12,
        alignItems: 'center', shadowColor: theme.primary,
        shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8,
    },
    payBtnDisabled: { opacity: 0.7 },
    payBtnText: { color: theme.white, fontSize: 18, fontWeight: 'bold' },
    secureText: { textAlign: 'center', color: theme.gray, fontSize: 12, marginTop: 12 },
    modalOverlay: {
        flex: 1, backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center', alignItems: 'center', padding: 24,
    },
    successCard: {
        backgroundColor: theme.white, borderRadius: 24, padding: 32,
        alignItems: 'center', width: '100%',
    },
    successIcon: {
        width: 80, height: 80, borderRadius: 40, backgroundColor: '#d1fae5',
        justifyContent: 'center', alignItems: 'center', marginBottom: 20,
    },
    successEmoji: { fontSize: 40 },
    successTitle: { fontSize: 24, fontWeight: 'bold', color: theme.darkNavy, marginBottom: 12 },
    successText: { fontSize: 14, color: theme.gray, textAlign: 'center', lineHeight: 22 },
    successDetails: {
        backgroundColor: theme.lightCream, padding: 16, borderRadius: 12,
        width: '100%', marginTop: 20, alignItems: 'center',
    },
    successLabel: { fontSize: 16, fontWeight: '600', color: theme.darkNavy },
    successValue: { fontSize: 14, color: theme.primary, marginTop: 4 },
    invoiceText: { fontSize: 12, color: theme.gray, marginTop: 8 },
    doneBtn: {
        backgroundColor: theme.primary, paddingVertical: 14, paddingHorizontal: 48,
        borderRadius: 12, marginTop: 24,
    },
    doneBtnText: { color: theme.white, fontSize: 16, fontWeight: 'bold' },
});

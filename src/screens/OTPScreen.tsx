import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useRoute } from '@react-navigation/native';
import { usePreventScreenCapture } from 'expo-screen-capture';

export default function OTPScreen({ navigation }: any) {
    usePreventScreenCapture();
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [loading, setLoading] = useState(false);
    const [timer, setTimer] = useState(300); // 5 minutes
    const { verifyOTP, resendOTP, user, isLoading } = useAuth();
    const route = useRoute();

    const { email } = route.params as { email: string };

    const inputRefs: any = [];

    useEffect(() => {
        const interval = setInterval(() => {
            setTimer((prev) => (prev > 0 ? prev - 1 : 0));
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    const handleChange = (text: string, index: number) => {
        if (text.length > 1) {
            // Handle paste
            const pasted = text.slice(0, 6).split('');
            const newOtp = [...otp];
            pasted.forEach((char, i) => {
                if (index + i < 6) newOtp[index + i] = char;
            });
            setOtp(newOtp);
            if (index + pasted.length < 6) {
                inputRefs[index + pasted.length]?.focus();
            } else {
                inputRefs[5]?.blur();
            }
            return;
        }

        const newOtp = [...otp];
        newOtp[index] = text;
        setOtp(newOtp);

        if (text && index < 5) {
            inputRefs[index + 1]?.focus();
        }
    };

    const handleBackspace = (text: string, index: number) => {
        if (!text && index > 0) {
            inputRefs[index - 1]?.focus();
        }
    };

    const handleVerify = async () => {
        const code = otp.join('');
        if (code.length !== 6) {
            Alert.alert('Invalid OTP', 'Please enter a 6-digit code');
            return;
        }

        setLoading(true);
        try {
            await verifyOTP(email, code);
            // Navigation is handled by AuthContext (loading user, which triggers Main stack)
            // But verifyOTP might not trigger state change automatically if using different logic
            // In AuthContext we probably reload user or set token
        } catch (error: any) {
            Alert.alert('Verification Failed', error.response?.data?.error || 'Invalid OTP');
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        if (timer > 0) return;
        try {
            await resendOTP(email);
            setTimer(300);
            Alert.alert('Success', 'OTP Resent successfully');
        } catch (error) {
            Alert.alert('Error', 'Failed to resend OTP');
        }
    };

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s < 10 ? '0' : ''}${s} `;
    };

    return (
        <LinearGradient colors={['#0F0F1A', '#1A1A2E']} style={styles.container}>
            <View style={styles.content}>
                <Text style={styles.title}>Verify Account</Text>
                <Text style={styles.subtitle}>
                    Enter the code sent to {email}
                </Text>

                <View style={styles.otpContainer}>
                    {otp.map((digit, index) => (
                        <TextInput
                            key={index}
                            ref={(ref) => inputRefs[index] = ref}
                            style={[styles.otpInput, digit ? styles.otpInputFilled : null]}
                            value={digit}
                            onChangeText={(text) => handleChange(text, index)}
                            onKeyPress={({ nativeEvent }) => {
                                if (nativeEvent.key === 'Backspace') handleBackspace(digit, index);
                            }}
                            keyboardType="number-pad"
                            maxLength={6} // Allow paste of 6 chars, logic handles it
                            selectTextOnFocus
                        />
                    ))}
                </View>

                <TouchableOpacity style={styles.button} onPress={handleVerify} disabled={loading}>
                    {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.buttonText}>Verify</Text>}
                </TouchableOpacity>

                <TouchableOpacity onPress={handleResend} disabled={timer > 0} style={styles.resendButton}>
                    <Text style={[styles.resendText, timer > 0 && styles.resendTextDisabled]}>
                        {timer > 0 ? `Resend code in ${formatTime(timer)} ` : 'Resend Code'}
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Text style={styles.backText}>Change Email</Text>
                </TouchableOpacity>
            </View>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    content: { padding: 30, paddingTop: 100, alignItems: 'center' },
    title: { fontSize: 28, fontWeight: 'bold', color: '#fff', marginBottom: 10 },
    subtitle: { fontSize: 16, color: '#aaa', marginBottom: 40, textAlign: 'center' },
    otpContainer: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginBottom: 40 },
    otpInput: {
        width: 45,
        height: 55,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
        backgroundColor: 'rgba(255,255,255,0.05)',
        color: '#fff',
        fontSize: 24,
        textAlign: 'center',
        fontWeight: 'bold',
    },
    otpInputFilled: {
        borderColor: '#00CEC9',
        backgroundColor: 'rgba(0, 206, 201, 0.1)',
    },
    button: {
        backgroundColor: '#00CEC9',
        borderRadius: 20,
        width: '100%',
        padding: 18,
        alignItems: 'center',
        shadowColor: '#00CEC9',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
    },
    buttonText: { color: '#000', fontSize: 18, fontWeight: 'bold' },
    resendButton: { marginTop: 25 },
    resendText: { color: '#00CEC9', fontSize: 16, fontWeight: '600' },
    resendTextDisabled: { color: '#666' },
    backButton: { marginTop: 20 },
    backText: { color: '#aaa', fontSize: 14 }
});

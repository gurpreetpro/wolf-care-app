import { View, Text, TextInput, StyleSheet, Pressable, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { useState, useRef } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle, Line } from 'react-native-svg';
import { useAuth } from '../../contexts/AuthContext';

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
        <Circle cx="40" cy="200" r="3" fill={theme.cyan} opacity={0.4} />
        <Circle cx="340" cy="150" r="4" fill={theme.accent} opacity={0.3} />
        <Circle cx="60" cy="550" r="2" fill={theme.primary} opacity={0.5} />
        <Circle cx="320" cy="650" r="3" fill={theme.secondary} opacity={0.4} />
        <Line x1="40" y1="200" x2="340" y2="150" stroke={theme.cyan} strokeWidth="0.5" opacity={0.2} />
        <Line x1="60" y1="550" x2="320" y2="650" stroke={theme.primary} strokeWidth="0.5" opacity={0.2} />
    </Svg>
);

export default function VerifyScreen() {
    const { phone } = useLocalSearchParams();
    const { setPatient } = useAuth();
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState('');
    const inputRefs = useRef([]);

    const handleOtpChange = (value, index) => {
        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        // Auto-focus next input
        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyPress = (e, index) => {
        if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handleVerify = async () => {
        const otpCode = otp.join('');
        if (otpCode.length !== 6) {
            setError('Please enter the complete 6-digit OTP');
            return;
        }

        setError('');
        setLoading(true);
        setStatus('Verifying OTP...');

        try {
            // For demo, accept any 6-digit OTP
            // In production: use Firebase confirmationResult.confirm(otpCode)
            
            setStatus('Checking patient profile...');
            
            // Check if patient exists in Wolf HMS
            const checkResponse = await fetch(
                `${API_BASE}/api/patients/app/check-patient?phone=${encodeURIComponent(phone)}`,
                { method: 'GET', headers: { 'Content-Type': 'application/json' } }
            );
            
            const checkData = await checkResponse.json();
            
            if (checkData.success && checkData.exists) {
                // Existing patient - save data and go to home
                setStatus('Welcome back!');
                await setPatient(checkData.patient);
                
                setTimeout(() => {
                    router.replace('/(tabs)');
                }, 500);
            } else {
                // New patient - go to registration
                setStatus('Setting up your profile...');
                
                setTimeout(() => {
                    router.replace({
                        pathname: '/(auth)/register',
                        params: { phone: phone }
                    });
                }, 500);
            }
        } catch (error) {
            console.error('Verification error:', error);
            
            // ============== OFFLINE LOGIN FIX ==============
            // If API fails, check if we have a cached user locally
            // This prevents the "Login Loop" where offline users are forced to register
            
            try {
                // Check cache using a direct import of secureStorage to avoid circular dependency
                const { getPatientSecure } = require('../../services/secureStorage');
                const cachedPatient = await getPatientSecure();
                
                if (cachedPatient && cachedPatient.phone === phone) {
                    console.log('[Verify] Offline mode: Logging in with cached patient');
                    setStatus('Offline mode: Using cached profile...');
                    await setPatient(cachedPatient);
                    setTimeout(() => {
                        router.replace('/(tabs)');
                    }, 500);
                    return;
                }
            } catch (cacheError) {
                console.error('[Verify] Cache check failed:', cacheError);
            }
            
            // If no cache or cache mismatch, we can't do anything because we can't verify if they are a new or existing user
            // Showing "Server Error" is better than forcing Registration
            setError('Server connection failed. Please try again later.');
            setStatus('');
            setLoading(false);
        }
    };

    const handleResend = () => {
        Alert.alert('OTP Resent', `A new OTP has been sent to ${phone}`);
    };

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={[theme.gradientStart, theme.gradientMid, theme.gradientEnd]}
                style={StyleSheet.absoluteFill}
            />
            <NeuralBackground />
            
            <KeyboardAvoidingView 
                style={styles.content}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.iconContainer}>
                        <Text style={styles.lockIcon}>🔐</Text>
                    </View>
                    <Text style={styles.title}>Verify OTP</Text>
                    <Text style={styles.subtitle}>
                        Enter the 6-digit code sent to
                    </Text>
                    <Text style={styles.phoneText}>{phone}</Text>
                </View>

                {/* OTP Input */}
                <View style={styles.otpSection}>
                    <View style={styles.otpContainer}>
                        {otp.map((digit, index) => (
                            <TextInput
                                key={index}
                                ref={(ref) => (inputRefs.current[index] = ref)}
                                style={[styles.otpInput, digit && styles.otpInputFilled]}
                                value={digit}
                                onChangeText={(value) => handleOtpChange(value.replace(/\D/g, ''), index)}
                                onKeyPress={(e) => handleKeyPress(e, index)}
                                keyboardType="number-pad"
                                maxLength={1}
                                selectTextOnFocus
                                editable={!loading}
                            />
                        ))}
                    </View>
                    
                    {error ? <Text style={styles.errorText}>{error}</Text> : null}
                    {status ? <Text style={styles.statusText}>{status}</Text> : null}

                    {/* Verify Button */}
                    <Pressable 
                        style={[styles.verifyBtn, loading && styles.verifyBtnDisabled]}
                        onPress={handleVerify}
                        disabled={loading}
                    >
                        <LinearGradient
                            colors={loading ? [theme.textMuted, theme.textMuted] : [theme.primary, theme.cyan]}
                            style={styles.verifyGradient}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                        >
                            <Text style={styles.verifyText}>
                                {loading ? 'PLEASE WAIT...' : 'VERIFY & LOGIN'}
                            </Text>
                        </LinearGradient>
                    </Pressable>

                    {/* Resend Link */}
                    <View style={styles.resendContainer}>
                        <Text style={styles.resendText}>Didn't receive code? </Text>
                        <Pressable onPress={handleResend} disabled={loading}>
                            <Text style={styles.resendLink}>Resend OTP</Text>
                        </Pressable>
                    </View>

                    {/* Back Link */}
                    <Pressable onPress={() => router.back()} style={styles.backLink} disabled={loading}>
                        <Text style={styles.backText}>← Change Phone Number</Text>
                    </Pressable>
                </View>
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.gradientStart,
    },
    content: {
        flex: 1,
        paddingHorizontal: 24,
        justifyContent: 'center',
    },
    header: {
        alignItems: 'center',
        marginBottom: 40,
    },
    iconContainer: {
        width: 80,
        height: 80,
        borderRadius: 20,
        backgroundColor: 'rgba(139, 92, 246, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
    },
    lockIcon: {
        fontSize: 40,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: theme.white,
        marginBottom: 12,
    },
    subtitle: {
        fontSize: 16,
        color: theme.textSecondary,
        textAlign: 'center',
    },
    phoneText: {
        fontSize: 18,
        color: theme.primary,
        fontWeight: '600',
        marginTop: 4,
    },
    otpSection: {
        width: '100%',
    },
    otpContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 24,
    },
    otpInput: {
        width: 48,
        height: 56,
        backgroundColor: theme.glassBackground,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: theme.glassBorder,
        textAlign: 'center',
        fontSize: 24,
        fontWeight: 'bold',
        color: theme.white,
    },
    otpInputFilled: {
        borderColor: theme.primary,
        backgroundColor: 'rgba(20, 184, 166, 0.1)',
    },
    errorText: {
        color: theme.error,
        fontSize: 14,
        textAlign: 'center',
        marginBottom: 16,
    },
    statusText: {
        color: theme.cyan,
        fontSize: 14,
        textAlign: 'center',
        marginBottom: 16,
    },
    verifyBtn: {
        borderRadius: 16,
        overflow: 'hidden',
        marginTop: 8,
    },
    verifyBtnDisabled: {
        opacity: 0.7,
    },
    verifyGradient: {
        paddingVertical: 18,
        alignItems: 'center',
    },
    verifyText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: theme.white,
        letterSpacing: 2,
    },
    resendContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 24,
    },
    resendText: {
        color: theme.textSecondary,
        fontSize: 14,
    },
    resendLink: {
        color: theme.primary,
        fontSize: 14,
        fontWeight: '600',
    },
    backLink: {
        marginTop: 20,
        alignItems: 'center',
    },
    backText: {
        color: theme.textSecondary,
        fontSize: 14,
    },
});

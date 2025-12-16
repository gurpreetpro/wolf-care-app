import { View, Text, TextInput, StyleSheet, Pressable, KeyboardAvoidingView, Platform } from 'react-native';
import { useState, useRef } from 'react';
import { router, useLocalSearchParams } from 'expo-router';

// Wolf HMS Theme
const theme = {
    primary: '#10B981',
    darkNavy: '#0f172a',
    tealDark: '#0d3d56',
    lightCream: '#f0f9ff',
    white: '#ffffff',
    gray: '#94a3b8',
    error: '#ef4444',
};

export default function VerifyScreen() {
    const { phone } = useLocalSearchParams();
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
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

        // For demo, accept any 6-digit OTP
        // In production, verify with Firebase confirmationResult.confirm(otpCode)
        setTimeout(() => {
            setLoading(false);
            // Navigate to main app (tabs)
            router.replace('/(tabs)');
        }, 1500);
    };

    const handleResend = () => {
        // TODO: Implement resend OTP logic
        alert('OTP resent to ' + phone);
    };

    return (
        <KeyboardAvoidingView 
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <View style={styles.content}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.emoji}>🔐</Text>
                    <Text style={styles.title}>Verify OTP</Text>
                    <Text style={styles.subtitle}>
                        Enter the 6-digit code sent to{'\n'}
                        <Text style={styles.phoneText}>{phone}</Text>
                    </Text>
                </View>

                {/* OTP Input */}
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
                        />
                    ))}
                </View>
                {error ? <Text style={styles.errorText}>{error}</Text> : null}

                {/* Verify Button */}
                <Pressable 
                    style={[styles.button, loading && styles.buttonDisabled]}
                    onPress={handleVerify}
                    disabled={loading}
                >
                    <Text style={styles.buttonText}>
                        {loading ? 'Verifying...' : 'VERIFY & LOGIN'}
                    </Text>
                </Pressable>

                {/* Resend Link */}
                <View style={styles.resendContainer}>
                    <Text style={styles.resendText}>Didn't receive code? </Text>
                    <Pressable onPress={handleResend}>
                        <Text style={styles.resendLink}>Resend OTP</Text>
                    </Pressable>
                </View>

                {/* Back Link */}
                <Pressable onPress={() => router.back()} style={styles.backLink}>
                    <Text style={styles.backText}>← Change Phone Number</Text>
                </Pressable>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.lightCream,
    },
    content: {
        flex: 1,
        padding: 24,
        justifyContent: 'center',
    },
    header: {
        alignItems: 'center',
        marginBottom: 40,
    },
    emoji: {
        fontSize: 64,
        marginBottom: 16,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: theme.darkNavy,
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: theme.gray,
        textAlign: 'center',
        lineHeight: 24,
    },
    phoneText: {
        color: theme.primary,
        fontWeight: '600',
    },
    otpContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 24,
        paddingHorizontal: 10,
    },
    otpInput: {
        width: 48,
        height: 56,
        backgroundColor: theme.white,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#e2e8f0',
        textAlign: 'center',
        fontSize: 24,
        fontWeight: 'bold',
        color: theme.darkNavy,
    },
    otpInputFilled: {
        borderColor: theme.primary,
        backgroundColor: '#f0fdf4',
    },
    errorText: {
        color: theme.error,
        fontSize: 14,
        textAlign: 'center',
        marginBottom: 16,
    },
    button: {
        backgroundColor: theme.primary,
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        shadowColor: theme.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    buttonDisabled: {
        opacity: 0.7,
    },
    buttonText: {
        color: theme.white,
        fontSize: 16,
        fontWeight: 'bold',
        letterSpacing: 1,
    },
    resendContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 24,
    },
    resendText: {
        color: theme.gray,
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
        color: theme.gray,
        fontSize: 14,
    },
});

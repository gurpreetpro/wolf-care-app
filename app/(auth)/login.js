import { View, Text, TextInput, StyleSheet, Pressable, KeyboardAvoidingView, Platform, Image, Alert } from 'react-native';
import { useState, useEffect } from 'react';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle, Line } from 'react-native-svg';
import { useAuth } from '../../contexts/AuthContext';
import biometric from '../../services/biometric';
import { getPatientSecure } from '../../services/secureStorage';

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
        <Circle cx="50" cy="150" r="3" fill={theme.cyan} opacity={0.4} />
        <Circle cx="320" cy="100" r="4" fill={theme.accent} opacity={0.3} />
        <Circle cx="80" cy="500" r="2" fill={theme.primary} opacity={0.5} />
        <Circle cx="300" cy="600" r="3" fill={theme.secondary} opacity={0.4} />
        <Line x1="50" y1="150" x2="320" y2="100" stroke={theme.cyan} strokeWidth="0.5" opacity={0.2} />
        <Line x1="80" y1="500" x2="300" y2="600" stroke={theme.primary} strokeWidth="0.5" opacity={0.2} />
    </Svg>
);

export default function LoginScreen() {
    const { setPatient } = useAuth();
    const [phone, setPhone] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showBiometric, setShowBiometric] = useState(false);
    const [biometricType, setBiometricType] = useState('biometric'); // face or fingerprint

    useEffect(() => {
        checkBiometric();
    }, []);

    const checkBiometric = async () => {
        const available = await biometric.isBiometricAvailable();
        const enabled = await biometric.isBiometricLoginEnabled();
        const type = await biometric.getBiometricType();
        
        setBiometricType(type);
        if (available && enabled) {
            setShowBiometric(true);
        }
    };

    const handleBiometricLogin = async () => {
        setLoading(true);
        setError('');
        
        const result = await biometric.authenticateWithBiometric();
        
        if (result.success) {
            // Get cached patient data
            const cachedPatient = await getPatientSecure();
            const bioPhone = await biometric.getBiometricPhone();
            
            if (cachedPatient && bioPhone && cachedPatient.phone === bioPhone) {
                // Success - Log in offline/online
                await setPatient(cachedPatient);
                router.replace('/(tabs)');
            } else {
                setError('Biometric login failed. Patient data not found.');
                setLoading(false);
            }
        } else {
            console.log('Biometric failed or cancelled');
            setLoading(false);
            if (result.error !== 'user_cancel') {
                 // Don't show error on manual cancel, just silent fail
            }
        }
    };

    const handleSendOTP = async () => {
        // Validate phone number
        const cleanPhone = phone.replace(/\D/g, '');
        if (cleanPhone.length < 10) {
            setError('Please enter a valid 10-digit phone number');
            return;
        }

        setError('');
        setLoading(true);

        // Navigate to verify screen
        setTimeout(() => {
            setLoading(false);
            router.push({
                pathname: '/(auth)/verify',
                params: { phone: `+91${cleanPhone}` }
            });
        }, 1000);
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
                {/* Header with Logo */}
                <View style={styles.header}>
                    <View style={styles.logoGlow}>
                        <Image 
                            source={require('../../assets/wolf-logo.png')} 
                            style={styles.logo}
                            resizeMode="contain"
                        />
                    </View>
                    <Text style={styles.title}>Welcome to Wolf <Text style={styles.titleAccent}>Care</Text></Text>
                    <Text style={styles.subtitle}>Enter your phone number to continue</Text>
                </View>

                {/* Phone Input */}
                <View style={styles.inputSection}>
                    <View style={styles.inputContainer}>
                        <View style={styles.countryCode}>
                            <Text style={styles.flag}>🇮🇳</Text>
                            <Text style={styles.code}>+91</Text>
                        </View>
                        <View style={styles.divider} />
                        <TextInput
                            style={styles.phoneInput}
                            placeholder="Enter phone number"
                            placeholderTextColor={theme.textMuted}
                            keyboardType="phone-pad"
                            value={phone}
                            onChangeText={setPhone}
                            maxLength={10}
                        />
                    </View>
                    
                    {error ? (
                        <Text style={styles.errorText}>{error}</Text>
                    ) : null}

                    {/* Send OTP Button */}
                    <Pressable 
                        style={[styles.sendBtn, loading && styles.sendBtnDisabled]}
                        onPress={handleSendOTP}
                        disabled={loading}
                    >
                        <LinearGradient
                            colors={loading ? [theme.textMuted, theme.textMuted] : [theme.primary, theme.cyan]}
                            style={styles.sendGradient}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                        >
                            <Text style={styles.sendText}>
                                {loading ? 'SENDING...' : 'SEND OTP'}
                            </Text>
                        </LinearGradient>
                    </Pressable>

                    {/* Biometric Login Button - Only if enabled */}
                    {showBiometric && (
                        <Pressable 
                            style={styles.biometricBtn}
                            onPress={handleBiometricLogin}
                            disabled={loading}
                        >
                            <Text style={styles.biometricIcon}>
                                {biometricType === 'face' ? '👤' : '👆'}
                            </Text>
                            <Text style={styles.biometricText}>
                                Login with {biometricType === 'face' ? 'Face ID' : 'Fingerprint'}
                            </Text>
                        </Pressable>
                    )}

                    {/* Back Link */}
                    <Pressable onPress={() => router.back()} style={styles.backLink}>
                        <Text style={styles.backText}>← Back to Home</Text>
                    </Pressable>
                </View>

                {/* Footer */}
                <View style={styles.footer}>
                    <Text style={styles.footerText}>
                        By continuing, you agree to our{' '}
                        <Text style={styles.link}>Terms</Text> &{' '}
                        <Text style={styles.link}>Privacy Policy</Text>
                    </Text>
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
        justifyContent: 'space-between',
        paddingVertical: 60,
    },
    header: {
        alignItems: 'center',
        paddingTop: 60,
    },
    logoGlow: {
        width: 100,
        height: 100,
        borderRadius: 24,
        backgroundColor: 'rgba(20, 184, 166, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
    },
    logo: {
        width: 80,
        height: 80,
        borderRadius: 16,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: theme.white,
        marginBottom: 8,
        textAlign: 'center',
    },
    titleAccent: {
        color: theme.accent,
    },
    subtitle: {
        fontSize: 16,
        color: theme.textSecondary,
        textAlign: 'center',
    },
    inputSection: {
        width: '100%',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.glassBackground,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: theme.glassBorder,
        overflow: 'hidden',
        marginBottom: 12,
    },
    countryCode: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 16,
    },
    flag: {
        fontSize: 20,
        marginRight: 8,
    },
    code: {
        fontSize: 16,
        color: theme.white,
        fontWeight: '500',
    },
    divider: {
        width: 1,
        height: 30,
        backgroundColor: theme.glassBorder,
    },
    phoneInput: {
        flex: 1,
        paddingHorizontal: 16,
        paddingVertical: 16,
        fontSize: 18,
        color: theme.white,
        letterSpacing: 2,
    },
    errorText: {
        color: theme.error,
        fontSize: 13,
        marginBottom: 12,
        marginLeft: 4,
    },
    sendBtn: {
        borderRadius: 16,
        overflow: 'hidden',
        marginTop: 8,
    },
    sendBtnDisabled: {
        opacity: 0.7,
    },
    sendGradient: {
        paddingVertical: 18,
        alignItems: 'center',
    },
    sendText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: theme.white,
        letterSpacing: 2,
    },
    biometricBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        paddingVertical: 16,
        borderRadius: 16,
        marginTop: 16,
        borderWidth: 1,
        borderColor: theme.glassBorder,
    },
    biometricIcon: {
        fontSize: 20,
        marginRight: 10,
    },
    biometricText: {
        color: theme.white,
        fontSize: 16,
        fontWeight: '500',
    },
    backLink: {
        alignItems: 'center',
        marginTop: 20,
    },
    backText: {
        fontSize: 14,
        color: theme.textSecondary,
    },
    footer: {
        alignItems: 'center',
        marginTop: 20,
    },
    footerText: {
        fontSize: 12,
        color: theme.textMuted,
        textAlign: 'center',
    },
    link: {
        color: theme.primary,
    },
});

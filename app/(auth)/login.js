import { View, Text, TextInput, StyleSheet, Pressable, KeyboardAvoidingView, Platform } from 'react-native';
import { useState } from 'react';
import { router } from 'expo-router';

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

export default function LoginScreen() {
    const [phone, setPhone] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSendOTP = async () => {
        // Validate phone number
        const cleanPhone = phone.replace(/\D/g, '');
        if (cleanPhone.length < 10) {
            setError('Please enter a valid 10-digit phone number');
            return;
        }

        setError('');
        setLoading(true);

        // For demo, skip actual Firebase OTP and go to verify screen
        // In production, you would call Firebase signInWithPhoneNumber here
        setTimeout(() => {
            setLoading(false);
            router.push({
                pathname: '/(auth)/verify',
                params: { phone: `+91${cleanPhone}` }
            });
        }, 1000);
    };

    return (
        <KeyboardAvoidingView 
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <View style={styles.content}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.emoji}>🐺</Text>
                    <Text style={styles.title}>Welcome to Wolf Care</Text>
                    <Text style={styles.subtitle}>Enter your phone number to continue</Text>
                </View>

                {/* Phone Input */}
                <View style={styles.inputContainer}>
                    <View style={styles.phoneRow}>
                        <View style={styles.countryCode}>
                            <Text style={styles.countryText}>🇮🇳 +91</Text>
                        </View>
                        <TextInput
                            style={styles.phoneInput}
                            placeholder="Enter phone number"
                            placeholderTextColor={theme.gray}
                            value={phone}
                            onChangeText={setPhone}
                            keyboardType="phone-pad"
                            maxLength={10}
                        />
                    </View>
                    {error ? <Text style={styles.errorText}>{error}</Text> : null}
                </View>

                {/* Send OTP Button */}
                <Pressable 
                    style={[styles.button, loading && styles.buttonDisabled]}
                    onPress={handleSendOTP}
                    disabled={loading}
                >
                    <Text style={styles.buttonText}>
                        {loading ? 'Sending OTP...' : 'SEND OTP'}
                    </Text>
                </Pressable>

                {/* Back Link */}
                <Pressable onPress={() => router.back()} style={styles.backLink}>
                    <Text style={styles.backText}>← Back to Home</Text>
                </Pressable>
            </View>

            {/* Footer */}
            <Text style={styles.footer}>
                By continuing, you agree to our Terms & Privacy Policy
            </Text>
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
    },
    inputContainer: {
        marginBottom: 24,
    },
    phoneRow: {
        flexDirection: 'row',
        backgroundColor: theme.white,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        overflow: 'hidden',
    },
    countryCode: {
        backgroundColor: '#f1f5f9',
        paddingHorizontal: 16,
        justifyContent: 'center',
        borderRightWidth: 1,
        borderRightColor: '#e2e8f0',
    },
    countryText: {
        fontSize: 16,
        color: theme.darkNavy,
    },
    phoneInput: {
        flex: 1,
        padding: 16,
        fontSize: 18,
        color: theme.darkNavy,
    },
    errorText: {
        color: theme.error,
        fontSize: 14,
        marginTop: 8,
        marginLeft: 4,
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
    backLink: {
        marginTop: 20,
        alignItems: 'center',
    },
    backText: {
        color: theme.gray,
        fontSize: 14,
    },
    footer: {
        textAlign: 'center',
        color: theme.gray,
        fontSize: 12,
        padding: 20,
    },
});

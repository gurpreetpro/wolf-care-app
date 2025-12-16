import { View, Text, StyleSheet, Pressable } from 'react-native';
import { router } from 'expo-router';

// Wolf HMS Theme Colors
const theme = {
    primary: '#10B981',      // Teal green (buttons)
    darkNavy: '#0f172a',     // Dark background
    tealDark: '#0d3d56',     // Left panel teal
    lightCream: '#f0f9ff',   // Light backgrounds
    white: '#ffffff',
    gray: '#94a3b8',
};

export default function LandingScreen() {
    return (
        <View style={styles.container}>
            {/* Left Panel - Dark Teal with Branding */}
            <View style={styles.leftPanel}>
                {/* Wolf Logo Placeholder */}
                <View style={styles.logoContainer}>
                    <View style={styles.logoPlaceholder}>
                        <Text style={styles.logoEmoji}>🐺</Text>
                    </View>
                </View>

                <Text style={styles.brandName}>WOLF CARE</Text>
                <Text style={styles.tagline}>The Ultimate Patient Assistant.</Text>
                <Text style={styles.subTagline}>Integrated. Intelligent. Secure.</Text>
            </View>

            {/* Right Panel - Light with CTA */}
            <View style={styles.rightPanel}>
                <Text style={styles.welcomeTitle}>Welcome!</Text>
                <Text style={styles.welcomeSubtitle}>
                    Your personal health guardian.{'\n'}Access appointments, records & more.
                </Text>

                <Pressable 
                    style={styles.ctaButton}
                    onPress={() => router.push('/(auth)/login')}
                >
                    <Text style={styles.ctaText}>GET STARTED</Text>
                </Pressable>

                <Text style={styles.version}>v1.0.0 • Wolf Technologies India</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'row',
    },
    // Left Panel Styles
    leftPanel: {
        flex: 1,
        backgroundColor: '#0d3d56',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
    },
    logoContainer: {
        marginBottom: 30,
    },
    logoPlaceholder: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: 'rgba(16, 185, 129, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: '#10B981',
    },
    logoEmoji: {
        fontSize: 60,
    },
    brandName: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#ffffff',
        letterSpacing: 4,
        marginBottom: 16,
    },
    tagline: {
        fontSize: 18,
        color: '#ffffff',
        fontWeight: '500',
        marginBottom: 8,
    },
    subTagline: {
        fontSize: 14,
        color: '#10B981',
        fontStyle: 'italic',
    },
    // Right Panel Styles
    rightPanel: {
        flex: 1,
        backgroundColor: '#f0f9ff',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
    },
    welcomeTitle: {
        fontSize: 36,
        fontWeight: 'bold',
        color: '#0f172a',
        marginBottom: 16,
    },
    welcomeSubtitle: {
        fontSize: 16,
        color: '#64748b',
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: 40,
    },
    ctaButton: {
        backgroundColor: '#10B981',
        paddingVertical: 16,
        paddingHorizontal: 48,
        borderRadius: 8,
        shadowColor: '#10B981',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    ctaText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: 'bold',
        letterSpacing: 1,
    },
    version: {
        position: 'absolute',
        bottom: 20,
        color: '#94a3b8',
        fontSize: 12,
    },
});

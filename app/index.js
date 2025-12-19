import { View, Text, StyleSheet, Pressable, Image, Dimensions } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle, Line, Path, Defs, RadialGradient, Stop } from 'react-native-svg';

const { width, height } = Dimensions.get('window');

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
};

// Animated Neural Background
const NeuralBackground = () => (
    <Svg style={StyleSheet.absoluteFill} width="100%" height="100%">
        <Defs>
            <RadialGradient id="glow1" cx="50%" cy="50%" r="50%">
                <Stop offset="0%" stopColor={theme.cyan} stopOpacity="0.4" />
                <Stop offset="100%" stopColor={theme.cyan} stopOpacity="0" />
            </RadialGradient>
            <RadialGradient id="glow2" cx="50%" cy="50%" r="50%">
                <Stop offset="0%" stopColor={theme.accent} stopOpacity="0.3" />
                <Stop offset="100%" stopColor={theme.accent} stopOpacity="0" />
            </RadialGradient>
        </Defs>
        
        {/* Neural nodes */}
        <Circle cx="60" cy="120" r="20" fill="url(#glow1)" />
        <Circle cx="60" cy="120" r="4" fill={theme.cyan} opacity={0.8} />
        
        <Circle cx="320" cy="80" r="15" fill="url(#glow2)" />
        <Circle cx="320" cy="80" r="3" fill={theme.accent} opacity={0.6} />
        
        <Circle cx="180" cy="200" r="18" fill="url(#glow1)" />
        <Circle cx="180" cy="200" r="4" fill={theme.primary} opacity={0.7} />
        
        <Circle cx="40" cy="350" r="12" fill="url(#glow2)" />
        <Circle cx="40" cy="350" r="3" fill={theme.secondary} opacity={0.5} />
        
        <Circle cx="350" cy="450" r="16" fill="url(#glow1)" />
        <Circle cx="350" cy="450" r="4" fill={theme.cyan} opacity={0.6} />
        
        <Circle cx="100" cy="550" r="14" fill="url(#glow2)" />
        <Circle cx="100" cy="550" r="3" fill={theme.accent} opacity={0.5} />
        
        <Circle cx="280" cy="280" r="10" fill="url(#glow1)" />
        <Circle cx="280" cy="280" r="2" fill={theme.primary} opacity={0.6} />
        
        {/* Connection lines */}
        <Line x1="60" y1="120" x2="180" y2="200" stroke={theme.cyan} strokeWidth="1" opacity={0.3} />
        <Line x1="180" y1="200" x2="320" y2="80" stroke={theme.primary} strokeWidth="1" opacity={0.2} />
        <Line x1="180" y1="200" x2="280" y2="280" stroke={theme.accent} strokeWidth="0.5" opacity={0.3} />
        <Line x1="280" y1="280" x2="350" y2="450" stroke={theme.secondary} strokeWidth="0.5" opacity={0.2} />
        <Line x1="40" y1="350" x2="100" y2="550" stroke={theme.cyan} strokeWidth="0.5" opacity={0.3} />
        
        {/* Decorative circuit patterns */}
        <Path
            d="M20 650 L60 650 L60 620 L100 620"
            stroke={theme.primary}
            strokeWidth="1"
            fill="none"
            opacity={0.3}
        />
        <Path
            d="M350 700 L320 700 L320 670 L280 670"
            stroke={theme.cyan}
            strokeWidth="1"
            fill="none"
            opacity={0.2}
        />
    </Svg>
);

export default function LandingScreen() {
    return (
        <View style={styles.container}>
            <LinearGradient
                colors={[theme.gradientStart, theme.gradientMid, theme.gradientEnd]}
                style={StyleSheet.absoluteFill}
            />
            <NeuralBackground />
            
            <View style={styles.content}>
                {/* Logo Section */}
                <View style={styles.logoSection}>
                    <View style={styles.logoGlow}>
                        <Image 
                            source={require('../assets/wolf-logo.png')} 
                            style={styles.logo}
                            resizeMode="contain"
                        />
                    </View>
                    
                    <Text style={styles.brandName}>
                        Wolf <Text style={styles.brandAccent}>Care</Text>
                    </Text>
                    
                    {/* AI Badge */}
                    <View style={styles.aiBadge}>
                        <Text style={styles.aiBadgeIcon}>🧠</Text>
                        <Text style={styles.aiBadgeText}>Health insights powered by AI</Text>
                    </View>
                </View>

                {/* Tagline Section */}
                <View style={styles.taglineSection}>
                    <Text style={styles.tagline}>The Ultimate Patient Assistant</Text>
                    <Text style={styles.subTagline}>
                        Integrated. Intelligent. Secure.
                    </Text>
                </View>

                {/* CTA Section */}
                <View style={styles.ctaSection}>
                    <Pressable 
                        style={styles.ctaButton}
                        onPress={() => router.push('/(auth)/login')}
                    >
                        <LinearGradient
                            colors={[theme.primary, theme.cyan]}
                            style={styles.ctaGradient}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                        >
                            <Text style={styles.ctaText}>GET STARTED</Text>
                            <Text style={styles.ctaArrow}>→</Text>
                        </LinearGradient>
                    </Pressable>
                    
                    <Text style={styles.version}>v1.0.0 • Wolf Technologies India</Text>
                </View>
            </View>
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
        justifyContent: 'space-between',
        paddingVertical: 80,
        paddingHorizontal: 32,
    },
    logoSection: {
        alignItems: 'center',
        paddingTop: 40,
    },
    logoGlow: {
        width: 140,
        height: 140,
        borderRadius: 30,
        backgroundColor: 'rgba(20, 184, 166, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
        shadowColor: theme.primary,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 30,
        elevation: 10,
    },
    logo: {
        width: 120,
        height: 120,
        borderRadius: 24,
    },
    brandName: {
        fontSize: 42,
        fontWeight: 'bold',
        color: theme.white,
        letterSpacing: 2,
        marginBottom: 16,
    },
    brandAccent: {
        color: theme.accent,
    },
    aiBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(139, 92, 246, 0.2)',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 24,
        borderWidth: 1,
        borderColor: 'rgba(139, 92, 246, 0.3)',
    },
    aiBadgeIcon: {
        fontSize: 16,
        marginRight: 8,
    },
    aiBadgeText: {
        fontSize: 13,
        color: theme.textSecondary,
        fontWeight: '500',
    },
    taglineSection: {
        alignItems: 'center',
    },
    tagline: {
        fontSize: 22,
        fontWeight: '600',
        color: theme.white,
        textAlign: 'center',
        marginBottom: 8,
    },
    subTagline: {
        fontSize: 16,
        color: theme.primary,
        fontWeight: '500',
        letterSpacing: 1,
    },
    ctaSection: {
        alignItems: 'center',
    },
    ctaButton: {
        width: '100%',
        borderRadius: 16,
        overflow: 'hidden',
        marginBottom: 24,
        shadowColor: theme.primary,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4,
        shadowRadius: 16,
        elevation: 8,
    },
    ctaGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 18,
        gap: 12,
    },
    ctaText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: theme.white,
        letterSpacing: 2,
    },
    ctaArrow: {
        fontSize: 20,
        color: theme.white,
        fontWeight: 'bold',
    },
    version: {
        fontSize: 12,
        color: theme.textMuted,
    },
});

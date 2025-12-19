import { View, Text, TextInput, StyleSheet, Pressable, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle, Line } from 'react-native-svg';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import { isValidDate } from '../../utils/date';

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
        <Circle cx="50" cy="100" r="3" fill={theme.cyan} opacity={0.4} />
        <Circle cx="340" cy="80" r="4" fill={theme.accent} opacity={0.3} />
        <Circle cx="60" cy="600" r="2" fill={theme.primary} opacity={0.5} />
        <Line x1="50" y1="100" x2="340" y2="80" stroke={theme.cyan} strokeWidth="0.5" opacity={0.2} />
    </Svg>
);

// Glass Input Component
const GlassInput = ({ label, placeholder, value, onChangeText, keyboardType, maxLength }) => (
    <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>{label}</Text>
        <TextInput
            style={styles.textInput}
            placeholder={placeholder}
            placeholderTextColor={theme.textMuted}
            value={value}
            onChangeText={onChangeText}
            keyboardType={keyboardType || 'default'}
            maxLength={maxLength}
        />
    </View>
);

// Gender Selector
const GenderSelector = ({ selected, onSelect }) => (
    <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Gender</Text>
        <View style={styles.genderRow}>
            {['Male', 'Female', 'Other'].map((gender) => (
                <Pressable 
                    key={gender}
                    style={[styles.genderBtn, selected === gender && styles.genderBtnActive]}
                    onPress={() => onSelect(gender)}
                >
                    <Text style={[styles.genderText, selected === gender && styles.genderTextActive]}>
                        {gender === 'Male' ? '👨' : gender === 'Female' ? '👩' : '🧑'} {gender}
                    </Text>
                </Pressable>
            ))}
        </View>
    </View>
);

export default function RegisterScreen() {
    const { phone } = useLocalSearchParams();
    const { setPatient } = useAuth();
    
    const [formData, setFormData] = useState({
        name: '',
        dob: '',
        gender: '',
        address: '',
        bloodGroup: '',
    });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    const validateForm = () => {
        const newErrors = {};
        if (!formData.name.trim()) newErrors.name = 'Name is required';
        
        if (!formData.dob) {
            newErrors.dob = 'Date of Birth is required';
        } else if (!isValidDate(formData.dob)) {
            newErrors.dob = 'Invalid date. Use YYYY-MM-DD format (e.g. 1990-01-31)';
        }

        if (!formData.gender) newErrors.gender = 'Gender is required';
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleRegister = async () => {
        if (!validateForm()) return;
        
        setLoading(true);
        
        try {
            // Register patient with Wolf HMS server
            // Send dob instead of age
            const response = await api.registerPatient({
                phone: phone,
                name: formData.name.trim(),
                dob: formData.dob,
                gender: formData.gender,
                address: formData.address.trim(),
                blood_group: formData.bloodGroup,
            });
            
            const data = response.data;
            
            if (response.success) {
                // Store patient data in context
                await setPatient({
                    id: data.patientId,
                    phone: phone,
                    name: formData.name.trim(),
                    dob: formData.dob,
                    gender: formData.gender,
                    address: formData.address.trim(),
                    bloodGroup: formData.bloodGroup,
                });
                
                // Navigate to main app
                router.replace('/(tabs)');
            } else {
                Alert.alert('Registration Failed', data.error || 'Please try again');
            }
        } catch (error) {
            console.error('Registration error:', error);
            // If server fails, still allow basic registration locally
            await setPatient({
                phone: phone,
                name: formData.name.trim(),
                dob: formData.dob,
                gender: formData.gender,
                address: formData.address.trim(),
                bloodGroup: formData.bloodGroup,
                isLocal: true,
            });
            router.replace('/(tabs)');
        } finally {
            setLoading(false);
        }
    };

    // Auto-format DOB input
    const handleDobChange = (text) => {
        // Allow only numbers and dashes
        let cleaned = text.replace(/[^0-9-]/g, '');
        
        // Auto-insert dashes
        if (cleaned.length === 4 && formData.dob.length === 3) cleaned += '-';
        if (cleaned.length === 7 && formData.dob.length === 6) cleaned += '-';
        
        setFormData({...formData, dob: cleaned});
    };

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={[theme.gradientStart, theme.gradientMid, theme.gradientEnd]}
                style={StyleSheet.absoluteFill}
            />
            <NeuralBackground />
            
            <KeyboardAvoidingView 
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <ScrollView 
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={styles.headerIcon}>📋</Text>
                        <Text style={styles.headerTitle}>Complete Your Profile</Text>
                        <Text style={styles.headerSubtitle}>
                            Please provide your details to continue
                        </Text>
                        <View style={styles.phoneBadge}>
                            <Text style={styles.phoneText}>📱 {phone}</Text>
                        </View>
                    </View>

                    {/* Form */}
                    <View style={styles.form}>
                        <GlassInput
                            label="Full Name *"
                            placeholder="Enter your full name"
                            value={formData.name}
                            onChangeText={(text) => setFormData({...formData, name: text})}
                        />
                        {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}

                        <GlassInput
                            label="Date of Birth *"
                            placeholder="YYYY-MM-DD (e.g. 1990-05-20)"
                            value={formData.dob}
                            onChangeText={handleDobChange}
                            keyboardType="numbers-and-punctuation"
                            maxLength={10}
                        />
                        {errors.dob && <Text style={styles.errorText}>{errors.dob}</Text>}

                        <GenderSelector
                            selected={formData.gender}
                            onSelect={(gender) => setFormData({...formData, gender})}
                        />
                        {errors.gender && <Text style={styles.errorText}>{errors.gender}</Text>}

                        <GlassInput
                            label="Address"
                            placeholder="Enter your address"
                            value={formData.address}
                            onChangeText={(text) => setFormData({...formData, address: text})}
                        />


                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Blood Group (optional)</Text>
                            <View style={styles.bloodGroupRow}>
                                {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map((bg) => (
                                    <Pressable 
                                        key={bg}
                                        style={[styles.bloodGroupBtn, formData.bloodGroup === bg && styles.bloodGroupBtnActive]}
                                        onPress={() => setFormData({...formData, bloodGroup: bg})}
                                    >
                                        <Text style={[styles.bloodGroupText, formData.bloodGroup === bg && styles.bloodGroupTextActive]}>
                                            {bg}
                                        </Text>
                                    </Pressable>
                                ))}
                            </View>
                        </View>
                    </View>

                    {/* Submit Button */}
                    <Pressable 
                        style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
                        onPress={handleRegister}
                        disabled={loading}
                    >
                        <LinearGradient
                            colors={loading ? [theme.textMuted, theme.textMuted] : [theme.primary, theme.cyan]}
                            style={styles.submitGradient}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                        >
                            <Text style={styles.submitText}>
                                {loading ? 'REGISTERING...' : 'COMPLETE REGISTRATION'}
                            </Text>
                        </LinearGradient>
                    </Pressable>

                    <View style={{ height: 40 }} />
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.gradientStart,
    },
    scrollContent: {
        paddingTop: 60,
        paddingHorizontal: 24,
    },
    header: {
        alignItems: 'center',
        marginBottom: 32,
    },
    headerIcon: {
        fontSize: 48,
        marginBottom: 16,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: theme.white,
        marginBottom: 8,
    },
    headerSubtitle: {
        fontSize: 14,
        color: theme.textSecondary,
        textAlign: 'center',
    },
    phoneBadge: {
        backgroundColor: theme.glassBackground,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        marginTop: 12,
        borderWidth: 1,
        borderColor: theme.glassBorder,
    },
    phoneText: {
        color: theme.primary,
        fontWeight: '500',
    },
    form: {
        marginBottom: 24,
    },
    inputGroup: {
        marginBottom: 16,
    },
    inputLabel: {
        fontSize: 14,
        color: theme.textSecondary,
        marginBottom: 8,
        fontWeight: '500',
    },
    textInput: {
        backgroundColor: theme.glassBackground,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: theme.glassBorder,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 16,
        color: theme.white,
    },
    genderRow: {
        flexDirection: 'row',
        gap: 10,
    },
    genderBtn: {
        flex: 1,
        backgroundColor: theme.glassBackground,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: theme.glassBorder,
        paddingVertical: 12,
        alignItems: 'center',
    },
    genderBtnActive: {
        backgroundColor: 'rgba(20, 184, 166, 0.2)',
        borderColor: theme.primary,
    },
    genderText: {
        fontSize: 14,
        color: theme.textSecondary,
    },
    genderTextActive: {
        color: theme.primary,
        fontWeight: '600',
    },
    bloodGroupRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    bloodGroupBtn: {
        backgroundColor: theme.glassBackground,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: theme.glassBorder,
        paddingHorizontal: 14,
        paddingVertical: 8,
    },
    bloodGroupBtnActive: {
        backgroundColor: 'rgba(244, 114, 182, 0.2)',
        borderColor: theme.accent,
    },
    bloodGroupText: {
        fontSize: 12,
        color: theme.textSecondary,
        fontWeight: '500',
    },
    bloodGroupTextActive: {
        color: theme.accent,
    },
    errorText: {
        color: theme.error,
        fontSize: 12,
        marginTop: 4,
        marginLeft: 4,
    },
    submitBtn: {
        borderRadius: 16,
        overflow: 'hidden',
    },
    submitBtnDisabled: {
        opacity: 0.7,
    },
    submitGradient: {
        paddingVertical: 18,
        alignItems: 'center',
    },
    submitText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: theme.white,
        letterSpacing: 1,
    },
});

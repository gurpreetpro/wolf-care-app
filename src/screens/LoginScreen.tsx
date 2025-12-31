import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, Alert, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { AuthService } from '../services/authService';
// @ts-ignore
import Logo from '../../assets/logo.png'; // Make sure this file exists from previous step

export default function LoginScreen({ navigation }: any) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        if (!username || !password) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }
        setLoading(true);
        try {
            await AuthService.login({ username, password });
            // Navigation will auto-switch due to AuthContext/AppNavigator check, 
            // but for now let's force a reload or rely on navigation props if we add a context later.
            // For this MVP Navigator, we might need to manually trigger the state update in App.tsx
            // But simpler: just reload or use a reset.
            // Actually, AppNavigator checks SecureStore on mount. We need a way to refresh it.
            // For V1, let's just use RN Restart or assume user re-opens. 
            // BETTER: We'll fix AppNavigator to listen to a context later. 
            // For now, let's just Alert Success.
            Alert.alert('Success', 'Logged in!', [
                { text: 'OK', onPress: () => { } } // In a real app, context updates here
            ]);
        } catch (error: any) {
            Alert.alert('Login Failed', error.error || 'Unknown error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <LinearGradient colors={['#0F0F1A', '#1A1A2E']} style={styles.container}>
            <View style={styles.content}>
                <Image source={Logo} style={styles.logo} resizeMode="contain" />
                <Text style={styles.title}>Welcome Back</Text>
                <Text style={styles.subtitle}>Sign in to continue connection</Text>

                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Username</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter username"
                        placeholderTextColor="#666"
                        value={username}
                        onChangeText={setUsername}
                        autoCapitalize="none"
                    />
                </View>

                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Password</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter password"
                        placeholderTextColor="#666"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                    />
                </View>

                <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
                    {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.buttonText}>Login</Text>}
                </TouchableOpacity>

                <TouchableOpacity onPress={() => navigation.navigate('Register')} style={styles.linkButton}>
                    <Text style={styles.linkText}>Don't have an account? <Text style={{ color: '#00CEC9' }}>Sign Up</Text></Text>
                </TouchableOpacity>
            </View>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    content: { flex: 1, padding: 30, justifyContent: 'center' },
    logo: { width: 120, height: 120, alignSelf: 'center', marginBottom: 20 },
    title: { fontSize: 32, fontWeight: 'bold', color: '#fff', textAlign: 'center', marginBottom: 5 },
    subtitle: { fontSize: 16, color: '#aaa', textAlign: 'center', marginBottom: 40 },
    inputContainer: { marginBottom: 20 },
    label: { color: '#bbb', marginBottom: 8, fontSize: 14, marginLeft: 5 },
    input: {
        backgroundColor: 'rgba(255,255,255,0.08)',
        borderRadius: 15,
        padding: 15,
        color: '#fff',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    button: {
        backgroundColor: '#6C5CE7',
        borderRadius: 20,
        padding: 18,
        alignItems: 'center',
        shadowColor: '#6C5CE7',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        marginTop: 20,
    },
    buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
    linkButton: { marginTop: 25, alignItems: 'center' },
    linkText: { color: '#aaa', fontSize: 14 }
});

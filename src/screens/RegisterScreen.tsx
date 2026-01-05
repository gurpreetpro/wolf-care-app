import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../context/AuthContext';
import * as SecureStore from 'expo-secure-store';
import * as Crypto from 'expo-crypto';

const GENDER_OPTIONS = [
  'Woman', 'Man', 'Non-Binary',
  'Transgender', 'Agender', 'Genderfluid',
  'Hijra', 'Kinnar', 'Kothi', 'Two-Spirit',
  'Intersex', 'Pangender', 'Questioning'
];

// Helper to convert Uint8Array to base64
function uint8ArrayToBase64(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

import CityPicker from '../components/CityPicker';

export default function RegisterScreen({ navigation }: any) {
  const { register } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedGenders, setSelectedGenders] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // Location state
  const [city, setCity] = useState('');
  const [coordinates, setCoordinates] = useState<{ lat: number, lng: number } | null>(null);
  const [showCityPicker, setShowCityPicker] = useState(false);

  const toggleGender = (gender: string) => {
    if (selectedGenders.includes(gender)) {
      setSelectedGenders(selectedGenders.filter(g => g !== gender));
    } else {
      setSelectedGenders([...selectedGenders, gender]);
    }
  };

  const handleRegister = async () => {
    if (!username || !password || !phone || selectedGenders.length === 0 || !city) {
      Alert.alert('Incomplete', 'Please fill all fields, select a city and at least one gender.');
      return;
    }

    setLoading(true);
    try {
      // Generate E2EE keys
      const randomBytes = await Crypto.getRandomBytesAsync(32);
      const publicKeyBase64 = uint8ArrayToBase64(randomBytes);
      const secretBytes = await Crypto.getRandomBytesAsync(32);
      const secretKeyBase64 = uint8ArrayToBase64(secretBytes);

      const response = await register({
        username,
        password,
        phone,
        gender: selectedGenders.join(','),
        pronouns: 'Not specified',
        publicKey: publicKeyBase64,
        city: city,
        latitude: coordinates?.lat,
        longitude: coordinates?.lng
      });

      // Store secret key locally
      await SecureStore.setItemAsync('user_secret_key', secretKeyBase64);
      await SecureStore.setItemAsync('user_public_key', publicKeyBase64);

      if (response && response.requireVerification) {
        Alert.alert('Verification Required', 'Please check your email for the OTP code.', [
          { text: 'OK', onPress: () => navigation.navigate('OTP', { email: username }) }
        ]);
      } else {
        Alert.alert('Welcome!', 'Account created successfully.', [
          { text: 'Login', onPress: () => navigation.navigate('Login') }
        ]);
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      Alert.alert('Registration Failed', error.response?.data?.error || error.message || 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={['#0F0F1A', '#1A1A2E']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Join Pride Connect</Text>
        <Text style={styles.subtitle}>Be your authentic self.</Text>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Username</Text>
          <TextInput
            style={styles.input}
            placeholder="Choose a username"
            placeholderTextColor="#666"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Phone (for verification)</Text>
          <TextInput
            style={styles.input}
            placeholder="+91 99999 99999"
            placeholderTextColor="#666"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Location</Text>
          <TouchableOpacity
            style={styles.input}
            onPress={() => setShowCityPicker(true)}
          >
            <Text style={{ color: city ? '#fff' : '#666' }}>
              {city || "Select your city"}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            placeholder="Secure password"
            placeholderTextColor="#666"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>

        <Text style={styles.label}>I identify as (Select all that apply)</Text>
        <View style={styles.genderContainer}>
          {GENDER_OPTIONS.map((gender) => {
            const isSelected = selectedGenders.includes(gender);
            return (
              <TouchableOpacity
                key={gender}
                style={[styles.genderChip, isSelected && styles.genderChipSelected]}
                onPress={() => toggleGender(gender)}
              >
                <Text style={[styles.genderText, isSelected && styles.genderTextSelected]}>
                  {gender}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={loading}>
          {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.buttonText}>Create Account</Text>}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.linkButton}>
          <Text style={styles.linkText}>Already have an account? Login</Text>
        </TouchableOpacity>

        <View style={{ height: 50 }} />

        <CityPicker
          visible={showCityPicker}
          onClose={() => setShowCityPicker(false)}
          onSelect={(item) => {
            setCity(item.name);
            setCoordinates({ lat: item.lat, lng: item.lng });
          }}
        />
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 30, paddingTop: 60 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#fff', marginBottom: 5 },
  subtitle: { fontSize: 16, color: '#aaa', marginBottom: 30 },
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
  genderContainer: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 10, marginBottom: 20 },
  genderChip: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#6C5CE7',
    marginRight: 10,
    marginBottom: 10,
    backgroundColor: 'transparent'
  },
  genderChipSelected: {
    backgroundColor: '#6C5CE7',
  },
  genderText: { color: '#6C5CE7', fontWeight: '600' },
  genderTextSelected: { color: '#fff' },
  button: {
    backgroundColor: '#00CEC9',
    borderRadius: 20,
    padding: 18,
    alignItems: 'center',
    shadowColor: '#00CEC9',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    marginTop: 10,
  },
  buttonText: { color: '#000', fontSize: 18, fontWeight: 'bold' },
  linkButton: { marginTop: 25, alignItems: 'center' },
  linkText: { color: '#aaa', fontSize: 14 }
});

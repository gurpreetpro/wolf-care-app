import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { AuthService } from '../services/authService';

const GENDER_OPTIONS = [
  'Woman', 'Man', 'Non-Binary', 
  'Transgender', 'Agender', 'Genderfluid',
  'Hijra', 'Kinnar', 'Kothi', 'Two-Spirit',
  'Intersex', 'Pangender', 'Questioning'
];

export default function RegisterScreen({ navigation }: any) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedGenders, setSelectedGenders] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const toggleGender = (gender: string) => {
    if (selectedGenders.includes(gender)) {
      setSelectedGenders(selectedGenders.filter(g => g !== gender));
    } else {
      setSelectedGenders([...selectedGenders, gender]);
    }
  };

  const handleRegister = async () => {
    if (!username || !password || !phone || selectedGenders.length === 0) {
      Alert.alert('Incomplete', 'Please fill all fields and select at least one gender.');
      return;
    }

    setLoading(true);
    try {
      await AuthService.register({
        username,
        password,
        phone,
        gender: selectedGenders.join(','), // Store as CSV for MVP
        pronouns: 'Not specified' // Add field later
      });
      
      Alert.alert('Welcome!', 'Account created successfully.', [
        { text: 'Login', onPress: () => navigation.navigate('Login') }
      ]);
    } catch (error: any) {
      Alert.alert('Registration Failed', error.error || 'Unknown error');
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

        <View style={{height: 50}} /> 
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

import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import api from '../services/api';
import CityPicker from '../components/CityPicker';
import * as ImagePicker from 'expo-image-picker';

export default function EditProfileScreen({ navigation }: any) {
    const { user, user: contextUser, checkAuthStatus } = useAuth();
    const [loading, setLoading] = useState(false);

    // Form state
    const [bio, setBio] = useState(user?.bio || '');
    const [interests, setInterests] = useState(user?.interests || '');
    const [gender, setGender] = useState(user?.gender || '');
    const [pronouns, setPronouns] = useState(user?.pronouns || '');
    const [city, setCity] = useState(user?.city || '');
    const [showCityPicker, setShowCityPicker] = useState(false);
    const [profilePhoto, setProfilePhoto] = useState<string | null>(null);

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });

        if (!result.canceled) {
            setProfilePhoto(result.assets[0].uri);
        }
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            // 1. Upload Photo if selected
            let photoUrl = null;
            if (profilePhoto) {
                const formData = new FormData();
                formData.append('photo', {
                    uri: profilePhoto,
                    name: 'profile.jpg',
                    type: 'image/jpeg'
                } as any);

                const uploadResponse = await api.post('/uploads/profile', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                photoUrl = uploadResponse.data.url;
            }

            // 2. Update Profile Data
            await api.put('/auth/profile', {
                bio,
                interests,
                gender,
                pronouns,
                city,
                // If we had a profile_photo column, we'd send photoUrl here.
                // For now, we just uploaded it. 
                // TODO: Backend should be updated to store this URL in user profile.
                // Currently upload endpoint returns URL but doesn't auto-update user record unless we add logic there.
                // Re-reading uploadController.ts: "let's update a NEW 'profile_photo' column... For now, return the URL."
                // So I need to send this URL to updateProfile endpoint.
                // I need to update authController.ts to accept profile_photo.
                profile_photo: photoUrl
            });

            Alert.alert('Success', 'Profile updated', [
                { text: 'OK', onPress: () => navigation.goBack() }
            ]);
        } catch (error) {
            console.error('Update failed:', error);
            Alert.alert('Error', 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <LinearGradient colors={['#0F0F1A', '#1A1A2E']} style={StyleSheet.absoluteFill} />

            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Edit Profile</Text>
                <TouchableOpacity onPress={handleSave} disabled={loading}>
                    {loading ? <ActivityIndicator color="#00CEC9" /> : <Text style={styles.saveText}>Save</Text>}
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                {/* Photo Picker */}
                <View style={styles.avatarSection}>
                    <TouchableOpacity onPress={pickImage} style={styles.avatarContainer}>
                        {profilePhoto ? (
                            <Image source={{ uri: profilePhoto }} style={styles.avatar} />
                        ) : (
                            <View style={styles.avatarPlaceholder}>
                                <Text style={styles.avatarText}>
                                    {user?.username?.substring(0, 2).toUpperCase()}
                                </Text>
                                <View style={styles.editIconBadge}>
                                    <Ionicons name="camera" size={16} color="#fff" />
                                </View>
                            </View>
                        )}
                    </TouchableOpacity>
                    <Text style={styles.changePhotoText}>Change Photo</Text>
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Bio</Text>
                    <TextInput
                        style={[styles.input, styles.textArea]}
                        value={bio}
                        onChangeText={setBio}
                        multiline
                        placeholder="Tell others about yourself..."
                        placeholderTextColor="#666"
                    />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Interests (comma separated)</Text>
                    <TextInput
                        style={styles.input}
                        value={interests}
                        onChangeText={setInterests}
                        placeholder="Gaming, Hiking, Coding..."
                        placeholderTextColor="#666"
                    />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Gender Identity</Text>
                    <TextInput
                        style={styles.input}
                        value={gender}
                        onChangeText={setGender}
                    />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Pronouns</Text>
                    <TextInput
                        style={styles.input}
                        value={pronouns}
                        onChangeText={setPronouns}
                    />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>City</Text>
                    <TouchableOpacity style={styles.input} onPress={() => setShowCityPicker(true)}>
                        <Text style={{ color: city ? '#fff' : '#666' }}>{city || 'Select City'}</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>

            <CityPicker
                visible={showCityPicker}
                onClose={() => setShowCityPicker(false)}
                onSelect={(item) => setCity(item.name)}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingTop: 50, backgroundColor: 'rgba(0,0,0,0.2)' },
    headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
    backBtn: { padding: 5 },
    saveText: { color: '#00CEC9', fontSize: 18, fontWeight: 'bold' },
    content: { padding: 20 },

    avatarSection: { alignItems: 'center', marginBottom: 25 },
    avatarContainer: { marginBottom: 10 },
    avatar: { width: 100, height: 100, borderRadius: 50 },
    avatarPlaceholder: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#6C5CE7', alignItems: 'center', justifyContent: 'center' },
    avatarText: { fontSize: 40, color: '#fff', fontWeight: 'bold' },
    editIconBadge: { position: 'absolute', bottom: 0, right: 0, backgroundColor: '#00CEC9', padding: 6, borderRadius: 15, borderWidth: 2, borderColor: '#0F0F1A' },
    changePhotoText: { color: '#00CEC9', fontSize: 14, fontWeight: '600' },

    inputGroup: { marginBottom: 20 },
    label: { color: '#aaa', marginBottom: 8, fontSize: 14 },
    input: {
        backgroundColor: 'rgba(255,255,255,0.08)',
        borderRadius: 12,
        padding: 15,
        color: '#fff',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)'
    },
    textArea: { height: 100, textAlignVertical: 'top' }
});

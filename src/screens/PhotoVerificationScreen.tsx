import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert, ActivityIndicator } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as ImageManipulator from 'expo-image-manipulator';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function PhotoVerificationScreen({ navigation }: any) {
    const [permission, requestPermission] = useCameraPermissions();
    const [cameraRef, setCameraRef] = useState<CameraView | null>(null);
    const [photo, setPhoto] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);
    const { user, checkAuthStatus } = useAuth(); // Refresh user to get new status

    useEffect(() => {
        if (!permission?.granted) {
            requestPermission();
        }
    }, [permission]);

    if (!permission) {
        return <View />;
    }

    if (!permission.granted) {
        return (
            <View style={styles.container}>
                <Text style={styles.text}>We need your permission to show the camera</Text>
                <TouchableOpacity onPress={requestPermission} style={styles.button}>
                    <Text style={styles.buttonText}>Grant Permission</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const takePicture = async () => {
        if (cameraRef) {
            try {
                const photoData = await cameraRef.takePictureAsync({
                    quality: 0.5,
                    base64: true,
                    skipProcessing: true // Faster
                });

                // Compress/Resize further if needed to save DB space
                const manipulated = await ImageManipulator.manipulateAsync(
                    photoData.uri,
                    [{ resize: { width: 600 } }],
                    { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
                );

                setPhoto(manipulated.uri);
            } catch (error) {
                console.log('Camera Error:', error);
                Alert.alert('Error', 'Failed to take photo');
            }
        }
    };

    const handleRetake = () => {
        setPhoto(null);
    };

    const handleSubmit = async () => {
        if (!photo) return;
        setUploading(true);

        try {
            // 1. Upload photo to server
            // Convert base64 to formData (simulated since we have a base64 string from expo-camera usually)
            // But expo-camera with `base64: true` gives us the string. 
            // Wait, we can't easily upload base64 to multer which expects multipart.
            // Better to use the URI to create a file object if we can, or just send base64 to a helper.
            // `expo-image-manipulator` returns a URI. We can use that.

            // We need the URI, not the base64 string for FormData in React Native.
            // My takePicture set `photo` to base64 string. I should change takePicture to store URI too.
            // Let's rely on the URI we get from manipulator.

            // I need to change takePicture to set a URI in state as well, or just re-implement handleSubmit.
            // IF I change `photo` state to be URI, I need to update `Image source` usage (which accepts uri).
            // Currently `setPhoto` logic was: `setPhoto(manipulated.base64 ? ... : null)`

            // I'll update takePicture to store URI in a ref or state, or just change logic here to fetch it if I persisted it.
            // Actually, let's update `takePicture` to set `photo` to URI (file path), not base64.
            // And update render to use that URI.
            // And use that URI for FormData.

            // Wait, I can't update takePicture in this `replace_file_content` block effectively without changing the whole file state.
            // I'll update `takePicture` separately.

            // Assuming `photo` IS THE URI (I will update takePicture next):
            const formData = new FormData();
            formData.append('photo', {
                uri: photo,
                name: 'verification.jpg',
                type: 'image/jpeg'
            } as any);

            const uploadResponse = await api.post('/uploads/profile', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            const photoUrl = uploadResponse.data.url;

            // 2. Request Verification
            await api.post('/verification/request', { photoUrl });

            Alert.alert('Success', 'Verification submitted! We will review it shortly.', [
                {
                    text: 'OK', onPress: () => {
                        checkAuthStatus(); // Refresh user status
                        navigation.goBack();
                    }
                }
            ]);
        } catch (error) {
            console.error('Upload Error:', error);
            Alert.alert('Error', 'Failed to upload verification photo');
        } finally {
            setUploading(false);
        }
    };

    return (
        <View style={styles.container}>
            <LinearGradient colors={['#0F0F1A', '#1A1A2E']} style={StyleSheet.absoluteFill} />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name="close" size={28} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Photo Verification</Text>
                <View style={{ width: 28 }} />
            </View>

            {photo ? (
                // Preview Mode
                <View style={styles.previewContainer}>
                    <Image source={{ uri: photo }} style={styles.previewImage} />
                    <View style={styles.previewControls}>
                        <TouchableOpacity style={styles.retakeBtn} onPress={handleRetake} disabled={uploading}>
                            <Text style={styles.retakeText}>Retake</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} disabled={uploading}>
                            {uploading ? <ActivityIndicator color="#000" /> : <Text style={styles.submitText}>Submit</Text>}
                        </TouchableOpacity>
                    </View>
                </View>
            ) : (
                // Camera Mode
                <View style={styles.cameraContainer}>
                    <View style={styles.instructionBanner}>
                        <Ionicons name="information-circle" size={20} color="#00CEC9" />
                        <Text style={styles.instructionText}>Make sure your face is clearly visible.</Text>
                    </View>

                    <View style={styles.cameraFrame}>
                        <CameraView style={styles.camera} facing="front" ref={(ref) => setCameraRef(ref)}>
                            <View style={styles.faceGuide} />
                        </CameraView>
                    </View>

                    <View style={styles.cameraControls}>
                        <TouchableOpacity style={styles.captureBtn} onPress={takePicture}>
                            <View style={styles.captureInner} />
                        </TouchableOpacity>
                    </View>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000' },
    text: { color: '#fff', textAlign: 'center', marginTop: 50 },
    button: { marginTop: 20, padding: 15, backgroundColor: '#00CEC9', borderRadius: 10, alignSelf: 'center' },
    buttonText: { color: '#000', fontWeight: 'bold' },

    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 50, paddingHorizontal: 20, paddingBottom: 15 },
    backBtn: { padding: 5 },
    headerTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },

    previewContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 },
    previewImage: { width: '100%', height: '70%', borderRadius: 20, resizeMode: 'cover' },
    previewControls: { flexDirection: 'row', marginTop: 30, width: '100%', justifyContent: 'space-around' },
    retakeBtn: { padding: 15, borderRadius: 30, backgroundColor: 'rgba(255,255,255,0.1)', width: '40%', alignItems: 'center' },
    retakeText: { color: '#fff', fontWeight: 'bold' },
    submitBtn: { padding: 15, borderRadius: 30, backgroundColor: '#00CEC9', width: '40%', alignItems: 'center' },
    submitText: { color: '#000', fontWeight: 'bold' },

    cameraContainer: { flex: 1, alignItems: 'center' },
    instructionBanner: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0, 206, 201, 0.1)', padding: 10, borderRadius: 20, marginBottom: 20 },
    instructionText: { color: '#00CEC9', marginLeft: 10, fontWeight: '600' },
    cameraFrame: { width: 300, height: 400, borderRadius: 150, overflow: 'hidden', borderWidth: 2, borderColor: '#fff' },
    camera: { flex: 1 },
    faceGuide: { flex: 1, borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)', margin: 50, borderRadius: 100 },

    cameraControls: { position: 'absolute', bottom: 50 },
    captureBtn: { width: 80, height: 80, borderRadius: 40, borderWidth: 4, borderColor: '#fff', alignItems: 'center', justifyContent: 'center' },
    captureInner: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#fff' }
});

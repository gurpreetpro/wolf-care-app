import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

export default function VideoCallScreen({ navigation }: any) {
    return (
        <View style={styles.container}>
            {/* Placeholder for Remote Stream */}
            <View style={styles.remoteStream}>
                <Text style={{ color: '#fff', opacity: 0.5 }}>Connecting...</Text>
            </View>

            {/* Placeholder for Local Stream */}
            <View style={styles.localStream} />

            {/* Controls */}
            <LinearGradient colors={['transparent', '#000']} style={styles.controls}>
                <TouchableOpacity style={styles.controlBtn}>
                    <Ionicons name="mic-off" size={28} color="#fff" />
                </TouchableOpacity>

                <TouchableOpacity style={[styles.controlBtn, styles.endCall]} onPress={() => navigation.goBack()}>
                    <Ionicons name="call" size={32} color="#fff" />
                </TouchableOpacity>

                <TouchableOpacity style={styles.controlBtn}>
                    <Ionicons name="camera-reverse" size={28} color="#fff" />
                </TouchableOpacity>
            </LinearGradient>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000' },
    remoteStream: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    localStream: { position: 'absolute', top: 50, right: 20, width: 100, height: 150, backgroundColor: '#333', borderRadius: 10, borderWidth: 1, borderColor: '#fff' },

    controls: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 150, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-evenly', paddingBottom: 30 },
    controlBtn: { width: 60, height: 60, borderRadius: 30, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
    endCall: { backgroundColor: '#FF4757' }
});

import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { RTCView, mediaDevices, RTCPeerConnection, RTCIceCandidate, RTCSessionDescription } from 'react-native-webrtc';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { socketService } from '../services/socketService';

const configuration = { "iceServers": [{ "urls": "stun:stun.l.google.com:19302" }] };

export default function VideoCallScreen({ route, navigation }: any) {
    const { matchId, otherUserId, isCaller } = route.params;
    const [localStream, setLocalStream] = useState<any>(null);
    const [remoteStream, setRemoteStream] = useState<any>(null);
    const [cachedLocalPC, setCachedLocalPC] = useState<any>(null);
    const [isMuted, setIsMuted] = useState(false);

    const { user } = useAuth();

    useEffect(() => {
        startCall();
        return () => {
            if (cachedLocalPC) {
                cachedLocalPC.close();
            }
            if (localStream) {
                localStream.getTracks().forEach((track: any) => track.stop());
            }
            socketService.off('call-accepted');
            socketService.off('ice-candidate');
        };
    }, []);

    const startCall = async () => {
        // 1. Get Local Stream
        const stream = await mediaDevices.getUserMedia({
            audio: true,
            video: {
                width: 640,
                height: 480,
                frameRate: 30,
                facingMode: 'user',
                deviceId: ''
            }
        });
        setLocalStream(stream);

        // 2. Create Peer Connection
        const pc = new RTCPeerConnection(configuration);
        stream.getTracks().forEach((track: any) => pc.addTrack(track, stream));

        pc.addEventListener('track', (e: any) => {
            console.log('Remote stream received');
            setRemoteStream(e.streams[0]);
        });

        pc.addEventListener('icecandidate', (e: any) => {
            if (e.candidate) {
                socketService.emit('ice-candidate', {
                    to: otherUserId,
                    candidate: e.candidate
                });
            }
        });

        setCachedLocalPC(pc);

        // 3. Signaling
        // Incoming Call Handlers
        socketService.on('call-accepted', async (signal: any) => {
            console.log('Call accepted by remote');
            await pc.setRemoteDescription(new RTCSessionDescription(signal));
        });

        socketService.on('ice-candidate', async (candidate: any) => {
            try {
                await pc.addIceCandidate(new RTCIceCandidate(candidate));
            } catch (e) {
                console.error('Error adding received ice candidate', e);
            }
        });

        // Initialize Call if Caller
        if (isCaller) {
            const offer = await pc.createOffer({});
            await pc.setLocalDescription(offer);

            socketService.emit('call-user', {
                userToCall: otherUserId,
                signalData: offer,
                from: user?.id
            });
        } else {
            // If callee, wait for offer (passed via navigation or socket)
            // Ideally, we accept the call before navigating here, 
            // but for simplicity, let's assume we handle 'call-user' elsewhere or pass signal in params.
            if (route.params.signal) {
                await pc.setRemoteDescription(new RTCSessionDescription(route.params.signal));
                const answer = await pc.createAnswer();
                await pc.setLocalDescription(answer);

                socketService.emit('answer-call', {
                    signal: answer,
                    to: otherUserId
                });
            }
        }
    };

    const toggleMute = () => {
        if (localStream) {
            localStream.getAudioTracks().forEach((track: any) => {
                track.enabled = !track.enabled;
            });
            setIsMuted(!isMuted);
        }
    };

    const endCall = () => {
        if (cachedLocalPC) {
            cachedLocalPC.close();
        }
        navigation.goBack();
    };

    return (
        <View style={styles.container}>
            {remoteStream && (
                <RTCView
                    streamURL={remoteStream.toURL()}
                    style={styles.remoteVideo}
                    objectFit="cover"
                />
            )}
            {localStream && (
                <RTCView
                    streamURL={localStream.toURL()}
                    style={styles.localVideo}
                    objectFit="cover"
                />
            )}

            <View style={styles.controls}>
                <TouchableOpacity onPress={toggleMute} style={[styles.controlBtn, isMuted && styles.mutedBtn]}>
                    <Ionicons name={isMuted ? "mic-off" : "mic"} size={24} color="#fff" />
                </TouchableOpacity>
                <TouchableOpacity onPress={endCall} style={[styles.controlBtn, styles.endCallBtn]}>
                    <Ionicons name="call" size={24} color="#fff" />
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000' },
    remoteVideo: { flex: 1, width: '100%', height: '100%' },
    localVideo: {
        position: 'absolute',
        width: 100,
        height: 150,
        top: 50,
        right: 20,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#fff'
    },
    controls: {
        position: 'absolute',
        bottom: 40,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'center',
        paddingVertical: 20
    },
    controlBtn: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: 'rgba(255,255,255,0.2)',
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: 15
    },
    mutedBtn: { backgroundColor: '#FF6B6B' },
    endCallBtn: { backgroundColor: '#FF4757' }
});

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, Image, Animated, SafeAreaView } from 'react-native';
import Svg, { Circle, Line, G } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';

import { MOCK_USERS } from '../data/demoData';

const { width, height } = Dimensions.get('window');
const CENTER = { x: width / 2, y: height / 2.5 };
const MAX_RADIUS = width * 0.8;

// Calculate random positions around center for demo
const DEMO_USERS = MOCK_USERS.map((user, index) => {
    const angle = (index / MOCK_USERS.length) * 2 * Math.PI;
    const radius = 100 + Math.random() * 100; // Random distance
    return {
        ...user,
        pos: {
            x: CENTER.x + radius * Math.cos(angle),
            y: CENTER.y + radius * Math.sin(angle)
        }
    };
});

export default function StarMapScreen({ navigation }: any) {
    const [selectedUser, setSelectedUser] = useState<any>(null);
    const [pulse] = useState(new Animated.Value(1));

    useEffect(() => {
        // Breathing animation for radar rings
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulse, { toValue: 1.05, duration: 2000, useNativeDriver: true }),
                Animated.timing(pulse, { toValue: 1, duration: 2000, useNativeDriver: true })
            ])
        ).start();
    }, []);

    return (
        <View style={styles.container}>
            <LinearGradient colors={['#0F0F1A', '#1A1A2E']} style={StyleSheet.absoluteFill} />

            {/* Header */}
            <SafeAreaView style={styles.header}>
                <Text style={styles.headerTitle}>STAR MAP</Text>
                <TouchableOpacity style={styles.filterBtn}>
                    <Ionicons name="filter" size={24} color="#00CEC9" />
                </TouchableOpacity>
            </SafeAreaView>

            {/* Radar SVG Layer */}
            <View style={styles.radarContainer}>
                <Svg height={height} width={width} style={StyleSheet.absoluteFill}>
                    {/* Constellation Lines */}
                    {DEMO_USERS.map((user, index) => {
                        // Draw subtle lines to center or between nodes to look like constellation
                        return (
                            <Line
                                key={`line-${index}`}
                                x1={CENTER.x} y1={CENTER.y}
                                x2={user.pos.x} y2={user.pos.y}
                                stroke="rgba(108, 92, 231, 0.2)"
                                strokeWidth="1"
                            />
                        );
                    })}

                    {/* Radar Rings */}
                    <Circle cx={CENTER.x} cy={CENTER.y} r={100} stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
                    <Circle cx={CENTER.x} cy={CENTER.y} r={200} stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                </Svg>

                {/* User Nodes (Touchable) */}
                {DEMO_USERS.map((user) => (
                    <TouchableOpacity
                        key={user.id}
                        style={[styles.node, { left: user.pos.x - 20, top: user.pos.y - 20, borderColor: user.color }]}
                        onPress={() => setSelectedUser(user)}
                    >
                        <View style={[styles.nodeInner, { backgroundColor: user.color }]} />
                    </TouchableOpacity>
                ))}

                {/* Center Me Node */}
                <View style={[styles.node, styles.meNode, { left: CENTER.x - 15, top: CENTER.y - 15 }]}>
                    <View style={[styles.nodeInner, { backgroundColor: '#fff' }]} />
                </View>
            </View>


            {/* Profile Card (Bottom Sheet) */}
            {selectedUser && (
                <BlurView intensity={40} tint="dark" style={styles.profileCard}>
                    <TouchableOpacity style={styles.closeBtn} onPress={() => setSelectedUser(null)}>
                        <Ionicons name="close" size={20} color="#fff" />
                    </TouchableOpacity>

                    <View style={styles.cardContent}>
                        <View style={[styles.avatarPlaceholder, { borderColor: selectedUser.color }]} />
                        <View>
                            <Text style={styles.cardName}>{selectedUser.name}, {selectedUser.age}</Text>
                            <Text style={styles.cardSubtitle}>{selectedUser.gender} {selectedUser.role ? `• ${selectedUser.role}` : ''}</Text>
                        </View>
                    </View>

                    <View style={styles.actionButtons}>
                        <TouchableOpacity style={[styles.actionBtn, styles.passBtn]} onPress={() => setSelectedUser(null)}>
                            <Ionicons name="close" size={24} color="#FF6B6B" />
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.actionBtn, styles.chatBtn]} onPress={() => navigation.navigate('Chat')}>
                            <Ionicons name="chatbubble" size={24} color="#fff" />
                            <Text style={{ color: '#fff', fontWeight: 'bold', marginLeft: 8 }}>Connect</Text>
                        </TouchableOpacity>
                    </View>
                </BlurView>
            )}

            {/* Navigation Bar (Mock) */}
            <View style={styles.navBar}>
                <Ionicons name="planet" size={28} color="#00CEC9" />
                <TouchableOpacity onPress={() => navigation.navigate('Chat')}>
                    <Ionicons name="chatbubbles-outline" size={28} color="#666" />
                </TouchableOpacity>
                <Ionicons name="person-outline" size={28} color="#666" />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { alignItems: 'center', paddingTop: 10, zIndex: 10 },
    headerTitle: { color: '#00CEC9', fontSize: 20, fontWeight: 'bold', letterSpacing: 2 },
    filterBtn: { position: 'absolute', right: 20, top: 10 },

    radarContainer: { flex: 1 },
    node: { position: 'absolute', width: 40, height: 40, borderRadius: 20, borderWidth: 2, justifyContent: 'center', alignItems: 'center', shadowColor: '#fff', shadowOpacity: 0.5, shadowRadius: 10 },
    meNode: { width: 30, height: 30, borderRadius: 15, borderColor: '#fff' },
    nodeInner: { width: 10, height: 10, borderRadius: 5 },

    profileCard: { position: 'absolute', bottom: 100, left: 20, right: 20, borderRadius: 25, padding: 20, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
    closeBtn: { position: 'absolute', top: 10, right: 10, padding: 5 },
    cardContent: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
    avatarPlaceholder: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#333', borderWidth: 2, marginRight: 15 },
    cardName: { color: '#fff', fontSize: 22, fontWeight: 'bold' },
    cardSubtitle: { color: '#bbb', fontSize: 16 },

    actionButtons: { flexDirection: 'row', justifyContent: 'space-between' },
    actionBtn: { flex: 1, height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center', flexDirection: 'row' },
    passBtn: { backgroundColor: 'rgba(255, 107, 107, 0.1)', marginRight: 10 },
    chatBtn: { backgroundColor: '#6C5CE7', flex: 2 },

    navBar: { flexDirection: 'row', justifyContent: 'space-around', paddingBottom: 30, paddingTop: 20, backgroundColor: '#0F0F1A', borderTopWidth: 1, borderTopColor: '#1A1A2E' }
});

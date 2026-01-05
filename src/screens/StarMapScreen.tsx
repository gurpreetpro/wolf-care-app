import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, Animated, SafeAreaView, ActivityIndicator } from 'react-native';
import Svg, { Circle, Line } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const { width, height } = Dimensions.get('window');
const CENTER = { x: width / 2, y: height / 2.5 };

interface PotentialMatch {
    id: string;
    username: string;
    gender?: string;
    pronouns?: string;
    bio?: string;
    city?: string;
    distance?: number;
    matchScore: number;
    pos: { x: number; y: number };
    color: string;
}

const COLORS = ['#6C5CE7', '#00CEC9', '#FD79A8', '#A29BFE', '#fab1a0', '#74b9ff', '#55efc4'];

export default function StarMapScreen({ navigation }: any) {
    const { user } = useAuth();
    const [users, setUsers] = useState<PotentialMatch[]>([]);
    const [selectedUser, setSelectedUser] = useState<PotentialMatch | null>(null);
    const [loading, setLoading] = useState(true);
    const [filterMode, setFilterMode] = useState<'all' | 'city'>('all');
    const [pulse] = useState(new Animated.Value(1));

    useEffect(() => {
        fetchPotentialMatches();
        startPulseAnimation();
    }, [filterMode]);

    const startPulseAnimation = () => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulse, { toValue: 1.05, duration: 2000, useNativeDriver: true }),
                Animated.timing(pulse, { toValue: 1, duration: 2000, useNativeDriver: true })
            ])
        ).start();
    };

    const fetchPotentialMatches = async () => {
        setLoading(true);
        try {
            const params: any = { userId: user?.id };
            if (filterMode === 'city' && user?.city) {
                params.city = user.city;
            }

            const response = await api.get('/matches/potential', { params });
            const potentialUsers = response.data.results || [];

            // Position users in a constellation pattern around center
            const positionedUsers = potentialUsers.map((u: any, index: number) => {
                const angle = (index / Math.max(potentialUsers.length, 1)) * 2 * Math.PI;
                const radius = 80 + Math.random() * 80;
                return {
                    ...u,
                    pos: {
                        x: CENTER.x + radius * Math.cos(angle),
                        y: CENTER.y + radius * Math.sin(angle)
                    },
                    color: COLORS[index % COLORS.length]
                };
            });

            setUsers(positionedUsers);
        } catch (error) {
            console.error('Failed to fetch matches:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterPress = () => {
        const newMode = filterMode === 'all' ? 'city' : 'all';
        setFilterMode(newMode);
        // Alert.alert('Filter', `Showing ${newMode === 'city' ? 'only users in your city' : 'everyone nearby'}.`);
    };

    const handleSwipe = async (direction: 'left' | 'right') => {
        if (!selectedUser || !user) return;

        try {
            const response = await api.post('/matches/swipe', {
                swiperId: user.id,
                targetId: selectedUser.id,
                direction
            });

            if (response.data.isMatch) {
                // It's a match! Navigate to chat
                navigation.navigate('Chat', {
                    matchId: response.data.match.id,
                    matchedUserName: selectedUser.username
                });
            }

            // Remove user from list
            setUsers(prev => prev.filter(u => u.id !== selectedUser.id));
            setSelectedUser(null);
        } catch (error) {
            console.error('Swipe failed:', error);
        }
    };

    if (loading) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <LinearGradient colors={['#0F0F1A', '#1A1A2E']} style={StyleSheet.absoluteFill} />
                <ActivityIndicator size="large" color="#6C5CE7" />
                <Text style={{ color: '#fff', marginTop: 15 }}>Scanning cosmos...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <LinearGradient colors={['#0F0F1A', '#1A1A2E']} style={StyleSheet.absoluteFill} />

            {/* Header */}
            <SafeAreaView style={styles.header}>
                <Text style={styles.headerTitle}>STAR MAP</Text>
                <TouchableOpacity style={styles.filterBtn} onPress={handleFilterPress}>
                    <Ionicons name={filterMode === 'city' ? "location" : "planet"} size={24} color="#00CEC9" />
                </TouchableOpacity>
                <Text style={styles.filterLabel}>{filterMode === 'city' ? 'My City' : 'Galaxy'}</Text>
            </SafeAreaView>

            {/* Radar SVG Layer */}
            <View style={styles.radarContainer}>
                <Svg height={height} width={width} style={StyleSheet.absoluteFill}>
                    {/* Constellation Lines */}
                    {users.map((u, index) => (
                        <Line
                            key={`line-${index}`}
                            x1={CENTER.x} y1={CENTER.y}
                            x2={u.pos.x} y2={u.pos.y}
                            stroke="rgba(108, 92, 231, 0.2)"
                            strokeWidth="1"
                        />
                    ))}

                    {/* Radar Rings */}
                    <Circle cx={CENTER.x} cy={CENTER.y} r={100} stroke="rgba(255,255,255,0.1)" strokeWidth="1" fill="none" />
                    <Circle cx={CENTER.x} cy={CENTER.y} r={200} stroke="rgba(255,255,255,0.05)" strokeWidth="1" fill="none" />
                </Svg>

                {/* User Nodes */}
                {users.map((u) => (
                    <TouchableOpacity
                        key={u.id}
                        style={[styles.node, { left: u.pos.x - 20, top: u.pos.y - 20, borderColor: u.color }]}
                        onPress={() => setSelectedUser(u)}
                    >
                        <View style={[styles.nodeInner, { backgroundColor: u.color }]} />
                    </TouchableOpacity>
                ))}

                {/* Center Me Node */}
                <View style={[styles.node, styles.meNode, { left: CENTER.x - 15, top: CENTER.y - 15 }]}>
                    <View style={[styles.nodeInner, { backgroundColor: '#fff' }]} />
                </View>

                {/* Empty State */}
                {users.length === 0 && (
                    <View style={styles.emptyState}>
                        <Ionicons name="planet-outline" size={60} color="#444" />
                        <Text style={styles.emptyText}>No one nearby</Text>
                        <Text style={styles.emptySubtext}>Try changing your filters</Text>
                    </View>
                )}
            </View>

            {/* Profile Card */}
            {selectedUser && (
                <BlurView intensity={40} tint="dark" style={styles.profileCard}>
                    <TouchableOpacity style={styles.closeBtn} onPress={() => setSelectedUser(null)}>
                        <Ionicons name="close" size={20} color="#fff" />
                    </TouchableOpacity>

                    <View style={styles.cardContent}>
                        <View style={[styles.avatarPlaceholder, { borderColor: selectedUser.color }]}>
                            <Text style={styles.avatarText}>
                                {selectedUser.username.charAt(0).toUpperCase()}
                            </Text>
                        </View>
                        <View style={styles.cardInfo}>
                            <Text style={styles.cardName}>{selectedUser.username}</Text>
                            <Text style={styles.cardSubtitle}>
                                {selectedUser.gender || 'Not specified'}
                                {selectedUser.pronouns ? ` • ${selectedUser.pronouns}` : ''}
                            </Text>
                            <Text style={styles.locationInfo}>
                                <Ionicons name="location-sharp" size={12} color="#00CEC9" />
                                {selectedUser.city ? ` ${selectedUser.city}` : ' Unknown'}
                                {selectedUser.distance !== undefined ? ` • ${selectedUser.distance} km` : ''}
                            </Text>
                            {selectedUser.bio && (
                                <Text style={styles.cardBio} numberOfLines={2}>{selectedUser.bio}</Text>
                            )}
                        </View>
                    </View>

                    <View style={styles.matchScoreContainer}>
                        <Text style={styles.matchScoreLabel}>Match Score</Text>
                        <Text style={styles.matchScore}>{selectedUser.matchScore}%</Text>
                    </View>

                    <View style={styles.actionButtons}>
                        <TouchableOpacity
                            style={[styles.actionBtn, styles.passBtn]}
                            onPress={() => handleSwipe('left')}
                        >
                            <Ionicons name="close" size={28} color="#FF6B6B" />
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.actionBtn, styles.chatBtn]}
                            onPress={() => handleSwipe('right')}
                        >
                            <Ionicons name="heart" size={24} color="#fff" />
                            <Text style={styles.connectText}>Connect</Text>
                        </TouchableOpacity>
                    </View>
                </BlurView>
            )}

            {/* Navigation Bar */}
            <View style={styles.navBar}>
                <Ionicons name="planet" size={28} color="#00CEC9" />
                <TouchableOpacity onPress={() => navigation.navigate('Chat', { matchId: null })}>
                    <Ionicons name="chatbubbles-outline" size={28} color="#666" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
                    <Ionicons name="person-outline" size={28} color="#666" />
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { alignItems: 'center', paddingTop: 10, zIndex: 10 },
    headerTitle: { color: '#00CEC9', fontSize: 20, fontWeight: 'bold', letterSpacing: 2 },
    filterBtn: { position: 'absolute', right: 20, top: 10 },
    filterLabel: { color: '#666', fontSize: 10, marginTop: 2, position: 'absolute', right: 18, top: 38 },
    locationInfo: { color: '#00CEC9', fontSize: 12, marginTop: 4, flexDirection: 'row', alignItems: 'center' },

    radarContainer: { flex: 1 },
    node: {
        position: 'absolute',
        width: 40,
        height: 40,
        borderRadius: 20,
        borderWidth: 2,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#fff',
        shadowOpacity: 0.5,
        shadowRadius: 10
    },
    meNode: { width: 30, height: 30, borderRadius: 15, borderColor: '#fff' },
    nodeInner: { width: 10, height: 10, borderRadius: 5 },

    emptyState: {
        position: 'absolute',
        top: CENTER.y + 50,
        left: 0,
        right: 0,
        alignItems: 'center'
    },
    emptyText: { color: '#666', fontSize: 18, marginTop: 15 },
    emptySubtext: { color: '#444', fontSize: 14, marginTop: 5 },

    profileCard: {
        position: 'absolute',
        bottom: 100,
        left: 20,
        right: 20,
        borderRadius: 25,
        padding: 20,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)'
    },
    closeBtn: { position: 'absolute', top: 10, right: 10, padding: 5, zIndex: 10 },
    cardContent: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
    avatarPlaceholder: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#333',
        borderWidth: 2,
        marginRight: 15,
        justifyContent: 'center',
        alignItems: 'center'
    },
    avatarText: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
    cardInfo: { flex: 1 },
    cardName: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
    cardSubtitle: { color: '#bbb', fontSize: 14, marginTop: 2 },
    cardBio: { color: '#888', fontSize: 13, marginTop: 5 },

    matchScoreContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: 'rgba(108, 92, 231, 0.2)',
        padding: 12,
        borderRadius: 12,
        marginBottom: 15
    },
    matchScoreLabel: { color: '#A29BFE', fontSize: 14 },
    matchScore: { color: '#fff', fontSize: 20, fontWeight: 'bold' },

    actionButtons: { flexDirection: 'row', justifyContent: 'space-between' },
    actionBtn: {
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row'
    },
    passBtn: {
        backgroundColor: 'rgba(255, 107, 107, 0.1)',
        width: 60,
        borderWidth: 1,
        borderColor: 'rgba(255, 107, 107, 0.3)'
    },
    chatBtn: { backgroundColor: '#6C5CE7', flex: 1, marginLeft: 10 },
    connectText: { color: '#fff', fontWeight: 'bold', marginLeft: 8, fontSize: 16 },

    navBar: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingBottom: 30,
        paddingTop: 20,
        backgroundColor: '#0F0F1A',
        borderTopWidth: 1,
        borderTopColor: '#1A1A2E'
    }
});

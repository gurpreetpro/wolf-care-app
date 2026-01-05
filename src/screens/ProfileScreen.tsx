import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';

export default function ProfileScreen({ navigation }: any) {
    const { user } = useAuth();

    const isVerified = user?.isVerified === 1 || user?.verification_status === 'verified';
    const isPending = user?.verification_status === 'pending';

    return (
        <View style={styles.container}>
            <LinearGradient colors={['#0F0F1A', '#1A1A2E']} style={StyleSheet.absoluteFill} />

            {/* Header */}
            <SafeAreaView style={styles.header}>
                <Text style={styles.headerTitle}>Profile</Text>
                <TouchableOpacity onPress={() => navigation.navigate('Settings')}>
                    <Ionicons name="settings-outline" size={24} color="#fff" />
                </TouchableOpacity>
            </SafeAreaView>

            <ScrollView contentContainerStyle={styles.content}>
                {/* Profile Card */}
                <View style={styles.profileCard}>
                    <View style={styles.avatarContainer}>
                        <View style={styles.avatarPlaceholder}>
                            <Text style={styles.avatarText}>
                                {user?.username?.substring(0, 2).toUpperCase()}
                            </Text>
                        </View>
                        {isVerified && (
                            <LinearGradient colors={['#00C6FF', '#0072FF']} style={styles.verifiedBadge}>
                                <Ionicons name="checkmark" size={12} color="#fff" />
                            </LinearGradient>
                        )}
                    </View>

                    <Text style={styles.username}>
                        {user?.username}
                        <Text style={styles.age}>, 24</Text>
                    </Text>

                    {/* Verification CTA */}
                    {!isVerified && (
                        <TouchableOpacity
                            style={[
                                styles.verifyBtn,
                                isPending && styles.verifyBtnPending
                            ]}
                            onPress={() => !isPending && navigation.navigate('PhotoVerification')}
                            disabled={isPending}
                        >
                            <Ionicons
                                name={isPending ? "time-outline" : "shield-checkmark-outline"}
                                size={16}
                                color={isPending ? "#FFD700" : "#00CEC9"}
                            />
                            <Text style={[
                                styles.verifyText,
                                isPending && styles.verifyTextPending
                            ]}>
                                {isPending ? 'Verification Pending' : 'Get Verified'}
                            </Text>
                        </TouchableOpacity>
                    )}
                </View>

                {/* Info Cards */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>About Me</Text>
                        <TouchableOpacity onPress={() => navigation.navigate('EditProfile')}>
                            <Text style={styles.editLink}>Edit</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.infoCard}>
                        {user?.bio ? (
                            <View style={styles.bioContainer}>
                                <Text style={styles.bioText}>{user.bio}</Text>
                                <View style={styles.divider} />
                            </View>
                        ) : null}

                        <View style={styles.infoRow}>
                            <Ionicons name="location-outline" size={20} color="#6C5CE7" />
                            <View style={styles.infoContent}>
                                <Text style={styles.infoLabel}>Location</Text>
                                <Text style={styles.infoValue}>{user?.city || 'Not specified'}</Text>
                            </View>
                        </View>

                        <View style={styles.divider} />

                        <View style={styles.infoRow}>
                            <Ionicons name="person-outline" size={20} color="#6C5CE7" />
                            <View style={styles.infoContent}>
                                <Text style={styles.infoLabel}>Gender Identity</Text>
                                <Text style={styles.infoValue}>{user?.gender || 'Not specified'}</Text>
                            </View>
                        </View>

                        <View style={styles.divider} />

                        <View style={styles.infoRow}>
                            <Ionicons name="chatbubble-outline" size={20} color="#6C5CE7" />
                            <View style={styles.infoContent}>
                                <Text style={styles.infoLabel}>Pronouns</Text>
                                <Text style={styles.infoValue}>{user?.pronouns || 'Not specified'}</Text>
                            </View>
                        </View>

                        {user?.interests ? (
                            <>
                                <View style={styles.divider} />
                                <View style={styles.infoRow}>
                                    <Ionicons name="heart-outline" size={20} color="#6C5CE7" />
                                    <View style={styles.infoContent}>
                                        <Text style={styles.infoLabel}>Interests</Text>
                                        <Text style={styles.infoValue}>{user.interests}</Text>
                                    </View>
                                </View>
                            </>
                        ) : null}
                    </View>
                </View>

                {/* Security Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Security</Text>

                    <View style={styles.infoCard}>
                        <View style={styles.infoRow}>
                            <Ionicons name="key-outline" size={20} color="#00CEC9" />
                            <View style={styles.infoContent}>
                                <Text style={styles.infoLabel}>E2EE Public Key</Text>
                                <Text style={styles.infoValueSmall} numberOfLines={1}>
                                    {user?.publicKey ? `${user.publicKey.substring(0, 20)}...` : 'Not generated'}
                                </Text>
                            </View>
                            <Ionicons name="shield-checkmark" size={20} color="#00CEC9" />
                        </View>
                    </View>
                </View>

                {/* Quick Actions */}
                <View style={styles.section}>
                    <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('Settings')}>
                        <Ionicons name="cog-outline" size={24} color="#fff" />
                        <Text style={styles.actionText}>Settings</Text>
                        <Ionicons name="chevron-forward" size={20} color="#666" />
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 15,
        paddingTop: 10,
        paddingBottom: 15
    },
    backBtn: { padding: 5 },
    headerTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
    settingsBtn: { padding: 5 },

    content: { padding: 20, paddingBottom: 40 },

    avatarContainer: { alignItems: 'center', marginBottom: 15 },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center'
    },
    avatarText: { color: '#fff', fontSize: 40, fontWeight: 'bold' },
    editAvatarBtn: {
        position: 'absolute',
        bottom: 0,
        right: '35%',
        backgroundColor: '#6C5CE7',
        padding: 8,
        borderRadius: 15,
        borderWidth: 3,
        borderColor: '#0F0F1A'
    },

    username: {
        color: '#fff',
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',

        marginBottom: 30
    },

    // new styles
    profileCard: { alignItems: 'center', marginBottom: 30 },
    avatarContainer: { position: 'relative', marginBottom: 15 },
    avatarPlaceholder: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#6C5CE7', alignItems: 'center', justifyContent: 'center' },
    avatarText: { fontSize: 40, color: '#fff', fontWeight: 'bold' },
    age: { fontSize: 18, fontWeight: 'normal', color: '#aaa' },

    verifyBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0, 206, 201, 0.15)', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, marginTop: 12, borderWidth: 1, borderColor: 'rgba(0, 206, 201, 0.3)' },
    verifyBtnPending: { backgroundColor: 'rgba(255, 215, 0, 0.15)', borderColor: 'rgba(255, 215, 0, 0.3)' },
    verifyText: { color: '#00CEC9', fontSize: 14, fontWeight: '600', marginLeft: 6 },
    verifyTextPending: { color: '#FFD700' },
    verifiedBadge: { position: 'absolute', bottom: 0, right: 0, width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#1A1A2E' },



    infoCard: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 15,
        padding: 15,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)'
    },
    infoRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 5 },
    infoContent: { flex: 1, marginLeft: 15 },
    infoLabel: { color: '#888', fontSize: 12 },
    infoValue: { color: '#fff', fontSize: 16, marginTop: 2 },
    infoValueSmall: { color: '#fff', fontSize: 12, marginTop: 2, fontFamily: 'monospace' },
    divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.1)', marginVertical: 12 },

    actionBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.05)',
        padding: 15,
        borderRadius: 15,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)'
    },
    actionText: { flex: 1, color: '#fff', fontSize: 16, marginLeft: 15 }
});

import { View, Text, StyleSheet, Pressable } from 'react-native';
import { router } from 'expo-router';

// Wolf HMS Theme
const theme = {
    primary: '#10B981',
    darkNavy: '#0f172a',
    tealDark: '#0d3d56',
    lightCream: '#f0f9ff',
    white: '#ffffff',
    gray: '#94a3b8',
    error: '#ef4444',
};

export default function ProfileScreen() {
    const handleLogout = () => {
        // Clear session and go to landing
        router.replace('/');
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Profile</Text>
            </View>
            
            <View style={styles.content}>
                {/* Avatar */}
                <View style={styles.avatarContainer}>
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>👤</Text>
                    </View>
                    <Text style={styles.name}>Patient User</Text>
                    <Text style={styles.phone}>+91 98765 43210</Text>
                </View>

                {/* Menu Items */}
                <View style={styles.menuSection}>
                    <Pressable style={styles.menuItem}>
                        <Text style={styles.menuIcon}>👤</Text>
                        <Text style={styles.menuText}>Edit Profile</Text>
                        <Text style={styles.menuArrow}>→</Text>
                    </Pressable>
                    <Pressable style={styles.menuItem}>
                        <Text style={styles.menuIcon}>🔔</Text>
                        <Text style={styles.menuText}>Notifications</Text>
                        <Text style={styles.menuArrow}>→</Text>
                    </Pressable>
                    <Pressable style={styles.menuItem}>
                        <Text style={styles.menuIcon}>❓</Text>
                        <Text style={styles.menuText}>Help & Support</Text>
                        <Text style={styles.menuArrow}>→</Text>
                    </Pressable>
                </View>

                {/* Logout Button */}
                <Pressable style={styles.logoutButton} onPress={handleLogout}>
                    <Text style={styles.logoutText}>Logout</Text>
                </Pressable>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.lightCream },
    header: { backgroundColor: theme.tealDark, padding: 24, paddingTop: 60 },
    title: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
    content: { flex: 1, padding: 20 },
    avatarContainer: { alignItems: 'center', marginVertical: 24 },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: theme.white,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    avatarText: { fontSize: 48 },
    name: { fontSize: 22, fontWeight: 'bold', color: theme.darkNavy },
    phone: { fontSize: 16, color: theme.gray, marginTop: 4 },
    menuSection: { marginTop: 20 },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.white,
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
    },
    menuIcon: { fontSize: 24, marginRight: 16 },
    menuText: { flex: 1, fontSize: 16, color: theme.darkNavy },
    menuArrow: { fontSize: 18, color: theme.gray },
    logoutButton: {
        marginTop: 'auto',
        backgroundColor: theme.error,
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    logoutText: { color: theme.white, fontSize: 16, fontWeight: 'bold' },
});

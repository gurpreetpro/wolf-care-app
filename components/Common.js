/**
 * Common UI Components
 * Reusable components with consistent styling
 */
import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    ActivityIndicator,
    StyleSheet,
    RefreshControl as RNRefreshControl,
} from 'react-native';

/**
 * Loading Button
 */
export const LoadingButton = ({ 
    title, 
    onPress, 
    loading = false, 
    disabled = false,
    variant = 'primary',
    style 
}) => {
    const buttonStyles = {
        primary: { bg: '#14b8a6', text: '#ffffff' },
        secondary: { bg: '#1e293b', text: '#14b8a6' },
        danger: { bg: '#ef4444', text: '#ffffff' },
    };

    const colors = buttonStyles[variant] || buttonStyles.primary;

    return (
        <TouchableOpacity
            style={[
                styles.button,
                { backgroundColor: colors.bg },
                (disabled || loading) && styles.buttonDisabled,
                style,
            ]}
            onPress={onPress}
            disabled={disabled || loading}
            activeOpacity={0.8}
        >
            {loading ? (
                <ActivityIndicator color={colors.text} size="small" />
            ) : (
                <Text style={[styles.buttonText, { color: colors.text }]}>{title}</Text>
            )}
        </TouchableOpacity>
    );
};

/**
 * Status Badge
 */
export const StatusBadge = ({ status, size = 'medium' }) => {
    const statusColors = {
        pending: { bg: '#f59e0b20', text: '#f59e0b' },
        approved: { bg: '#10b98120', text: '#10b981' },
        completed: { bg: '#3b82f620', text: '#3b82f6' },
        cancelled: { bg: '#ef444420', text: '#ef4444' },
        active: { bg: '#14b8a620', text: '#14b8a6' },
    };

    const colors = statusColors[status?.toLowerCase()] || statusColors.pending;
    const sizeStyles = size === 'small' ? styles.badgeSmall : styles.badge;

    return (
        <View style={[sizeStyles, { backgroundColor: colors.bg }]}>
            <Text style={[styles.badgeText, { color: colors.text }]}>
                {status}
            </Text>
        </View>
    );
};

/**
 * Empty State
 */
export const EmptyState = ({ 
    icon = '📭', 
    title = 'Nothing here', 
    message = 'No data to display',
    action,
    actionText = 'Retry'
}) => (
    <View style={styles.emptyState}>
        <Text style={styles.emptyIcon}>{icon}</Text>
        <Text style={styles.emptyTitle}>{title}</Text>
        <Text style={styles.emptyMessage}>{message}</Text>
        {action && (
            <TouchableOpacity style={styles.emptyButton} onPress={action}>
                <Text style={styles.emptyButtonText}>{actionText}</Text>
            </TouchableOpacity>
        )}
    </View>
);

/**
 * Section Header
 */
export const SectionHeader = ({ title, action, actionText }) => (
    <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {action && (
            <TouchableOpacity onPress={action}>
                <Text style={styles.sectionAction}>{actionText}</Text>
            </TouchableOpacity>
        )}
    </View>
);

/**
 * Premium Refresh Control
 */
export const PremiumRefreshControl = ({ refreshing, onRefresh }) => (
    <RNRefreshControl
        refreshing={refreshing}
        onRefresh={onRefresh}
        tintColor="#14b8a6"
        colors={['#14b8a6', '#8b5cf6']}
        progressBackgroundColor="#1e293b"
    />
);

/**
 * Divider
 */
export const Divider = ({ style }) => (
    <View style={[styles.divider, style]} />
);

const styles = StyleSheet.create({
    button: {
        paddingVertical: 14,
        paddingHorizontal: 24,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 48,
    },
    buttonDisabled: {
        opacity: 0.6,
    },
    buttonText: {
        fontWeight: 'bold',
        fontSize: 16,
    },
    badge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    badgeSmall: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    badgeText: {
        fontSize: 12,
        fontWeight: '600',
        textTransform: 'capitalize',
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: 48,
        paddingHorizontal: 24,
    },
    emptyIcon: {
        fontSize: 56,
        marginBottom: 16,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#ffffff',
        marginBottom: 8,
    },
    emptyMessage: {
        fontSize: 14,
        color: '#94a3b8',
        textAlign: 'center',
        lineHeight: 22,
    },
    emptyButton: {
        marginTop: 20,
        paddingHorizontal: 24,
        paddingVertical: 12,
        backgroundColor: '#14b8a620',
        borderRadius: 12,
    },
    emptyButtonText: {
        color: '#14b8a6',
        fontWeight: '600',
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#ffffff',
    },
    sectionAction: {
        fontSize: 14,
        color: '#14b8a6',
        fontWeight: '600',
    },
    divider: {
        height: 1,
        backgroundColor: 'rgba(255,255,255,0.1)',
        marginVertical: 16,
    },
});

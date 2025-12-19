/**
 * Skeleton Loading Components
 * Premium skeleton animations for loading states
 */
import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

/**
 * Shimmer Animation Effect
 */
const ShimmerEffect = ({ children, style }) => {
    const animatedValue = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.loop(
            Animated.timing(animatedValue, {
                toValue: 1,
                duration: 1500,
                useNativeDriver: true,
            })
        ).start();
    }, []);

    const translateX = animatedValue.interpolate({
        inputRange: [0, 1],
        outputRange: [-SCREEN_WIDTH, SCREEN_WIDTH],
    });

    return (
        <View style={[styles.shimmerContainer, style]}>
            {children}
            <Animated.View
                style={[
                    styles.shimmerOverlay,
                    { transform: [{ translateX }] },
                ]}
            >
                <LinearGradient
                    colors={['transparent', 'rgba(255,255,255,0.1)', 'transparent']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={StyleSheet.absoluteFill}
                />
            </Animated.View>
        </View>
    );
};

/**
 * Skeleton Box - Basic building block
 */
export const SkeletonBox = ({ width = '100%', height = 16, borderRadius = 8, style }) => (
    <ShimmerEffect style={[styles.skeletonBox, { width, height, borderRadius }, style]} />
);

/**
 * Skeleton Circle
 */
export const SkeletonCircle = ({ size = 48, style }) => (
    <SkeletonBox width={size} height={size} borderRadius={size / 2} style={style} />
);

/**
 * Skeleton Card - For appointment/record cards
 */
export const SkeletonCard = ({ style }) => (
    <View style={[styles.card, style]}>
        <View style={styles.cardHeader}>
            <SkeletonCircle size={48} />
            <View style={styles.cardHeaderText}>
                <SkeletonBox width={120} height={18} />
                <SkeletonBox width={80} height={14} style={styles.marginTop} />
            </View>
        </View>
        <SkeletonBox width="100%" height={12} style={styles.marginTopLarge} />
        <SkeletonBox width="70%" height={12} style={styles.marginTop} />
    </View>
);

/**
 * Skeleton List - Multiple cards
 */
export const SkeletonList = ({ count = 3 }) => (
    <View>
        {Array.from({ length: count }).map((_, index) => (
            <SkeletonCard key={index} style={styles.listItem} />
        ))}
    </View>
);

/**
 * Skeleton Profile
 */
export const SkeletonProfile = () => (
    <View style={styles.profile}>
        <SkeletonCircle size={80} />
        <SkeletonBox width={150} height={24} style={styles.marginTopLarge} />
        <SkeletonBox width={100} height={16} style={styles.marginTop} />
        <View style={styles.profileStats}>
            <SkeletonBox width={60} height={40} borderRadius={12} />
            <SkeletonBox width={60} height={40} borderRadius={12} />
            <SkeletonBox width={60} height={40} borderRadius={12} />
        </View>
    </View>
);

/**
 * Skeleton Home Dashboard
 */
export const SkeletonDashboard = () => (
    <View>
        <View style={styles.welcomeSection}>
            <SkeletonBox width={200} height={28} />
            <SkeletonBox width={150} height={16} style={styles.marginTop} />
        </View>
        <View style={styles.quickActions}>
            {Array.from({ length: 4 }).map((_, i) => (
                <SkeletonBox key={i} width={70} height={70} borderRadius={16} />
            ))}
        </View>
        <SkeletonCard style={styles.marginTopLarge} />
        <SkeletonCard style={styles.marginTop} />
    </View>
);

const styles = StyleSheet.create({
    shimmerContainer: {
        overflow: 'hidden',
        backgroundColor: '#1e293b',
    },
    shimmerOverlay: {
        ...StyleSheet.absoluteFillObject,
    },
    skeletonBox: {
        backgroundColor: '#1e293b',
    },
    card: {
        backgroundColor: '#1e293b',
        borderRadius: 16,
        padding: 16,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    cardHeaderText: {
        marginLeft: 12,
        flex: 1,
    },
    marginTop: {
        marginTop: 8,
    },
    marginTopLarge: {
        marginTop: 16,
    },
    listItem: {
        marginBottom: 12,
    },
    profile: {
        alignItems: 'center',
        padding: 20,
    },
    profileStats: {
        flexDirection: 'row',
        gap: 16,
        marginTop: 20,
    },
    welcomeSection: {
        marginBottom: 20,
    },
    quickActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
});

export default {
    SkeletonBox,
    SkeletonCircle,
    SkeletonCard,
    SkeletonList,
    SkeletonProfile,
    SkeletonDashboard,
};

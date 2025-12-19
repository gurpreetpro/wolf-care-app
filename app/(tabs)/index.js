import { View, Text, StyleSheet, ScrollView, Pressable, RefreshControl, Image, Dimensions } from 'react-native';
import { useState, useCallback } from 'react';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle, Line, Path, Defs, RadialGradient, Stop } from 'react-native-svg';

const { width } = Dimensions.get('window');

// Premium Aurora Neural Theme
const theme = {
    // Gradients
    gradientStart: '#0f172a',    // Deep navy
    gradientMid: '#1e293b',      // Slate
    gradientEnd: '#0f172a',      // Deep navy
    
    // Accent colors
    primary: '#14b8a6',          // Teal
    secondary: '#8b5cf6',        // Purple
    accent: '#f472b6',           // Pink
    cyan: '#06b6d4',             // Cyan
    
    // Glass colors
    glassBackground: 'rgba(255,255,255,0.08)',
    glassBorder: 'rgba(255,255,255,0.15)',
    
    // Text
    white: '#ffffff',
    textPrimary: '#f8fafc',
    textSecondary: 'rgba(255,255,255,0.7)',
    textMuted: 'rgba(255,255,255,0.5)',
    
    // Status
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
};

// Neural Network Background Component
const NeuralBackground = () => (
    <Svg style={StyleSheet.absoluteFill} width="100%" height="100%">
        <Defs>
            <RadialGradient id="nodeGlow" cx="50%" cy="50%" r="50%">
                <Stop offset="0%" stopColor={theme.cyan} stopOpacity="0.6" />
                <Stop offset="100%" stopColor={theme.cyan} stopOpacity="0" />
            </RadialGradient>
        </Defs>
        
        {/* Neural network nodes */}
        <Circle cx="50" cy="80" r="4" fill={theme.cyan} opacity={0.6} />
        <Circle cx="120" cy="40" r="3" fill={theme.accent} opacity={0.4} />
        <Circle cx="200" cy="100" r="5" fill={theme.primary} opacity={0.5} />
        <Circle cx="280" cy="60" r="3" fill={theme.secondary} opacity={0.4} />
        <Circle cx="350" cy="90" r="4" fill={theme.cyan} opacity={0.5} />
        
        {/* Connection lines */}
        <Line x1="50" y1="80" x2="120" y2="40" stroke={theme.cyan} strokeWidth="0.5" opacity={0.3} />
        <Line x1="120" y1="40" x2="200" y2="100" stroke={theme.primary} strokeWidth="0.5" opacity={0.3} />
        <Line x1="200" y1="100" x2="280" y2="60" stroke={theme.accent} strokeWidth="0.5" opacity={0.2} />
        <Line x1="280" y1="60" x2="350" y2="90" stroke={theme.secondary} strokeWidth="0.5" opacity={0.3} />
        
        {/* Additional decorative nodes */}
        <Circle cx={width - 40} cy="150" r="2" fill={theme.accent} opacity={0.3} />
        <Circle cx="30" cy="200" r="2" fill={theme.primary} opacity={0.4} />
    </Svg>
);

// Glass Card Component
const GlassCard = ({ children, style }) => (
    <View style={[styles.glassCard, style]}>
        {children}
    </View>
);

export default function HomeScreen() {
    const [refreshing, setRefreshing] = useState(false);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        setTimeout(() => setRefreshing(false), 1500);
    }, []);

    const healthStats = [
        { id: 1, label: 'Heart Rate', value: '72', unit: 'BPM', icon: '❤️', color: theme.accent },
        { id: 2, label: 'Blood Pressure', value: '120/80', unit: 'mmHg', icon: '🩸', color: theme.cyan },
        { id: 3, label: 'Sleep Quality', value: '85%', unit: '', icon: '🌙', color: theme.secondary },
    ];

    const aiPrediction = {
        status: 'Stable Wellness',
        message: 'Based on your recent activity, your health forecast looks positive. Keep it up!',
        days: 7,
    };

    const upcomingTasks = [
        { id: 1, icon: '💊', title: 'Medication Reminder', time: '10:00 AM' },
        { id: 2, icon: '📅', title: 'Schedule Check-up', note: 'Recommended' },
    ];

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={[theme.gradientStart, theme.gradientMid, theme.gradientEnd]}
                style={StyleSheet.absoluteFill}
            />
            <NeuralBackground />
            
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.primary} />
                }
                showsVerticalScrollIndicator={false}
            >
                {/* Header with AI Branding */}
                <View style={styles.header}>
                    <View style={styles.headerContent}>
                        <Image 
                            source={require('../../assets/wolf-logo.png')} 
                            style={styles.headerLogo}
                            resizeMode="contain"
                        />
                        <View style={styles.headerText}>
                            <Text style={styles.brandName}>Wolf <Text style={styles.brandAccent}>Care</Text></Text>
                            <View style={styles.aiPill}>
                                <Text style={styles.aiPillIcon}>🧠</Text>
                                <Text style={styles.aiPillText}>Health insights powered by AI</Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Daily Health Snapshot - Main Card */}
                <GlassCard style={styles.mainCard}>
                    <View style={styles.mainCardHeader}>
                        <Text style={styles.cardTitle}>Daily Health Snapshot</Text>
                        <Pressable style={styles.notificationBtn}>
                            <Text style={styles.notificationIcon}>🔔</Text>
                        </Pressable>
                    </View>
                    
                    <View style={styles.healthRow}>
                        {/* Human Body Silhouette */}
                        <View style={styles.bodyContainer}>
                            <View style={styles.bodySilhouette}>
                                <Text style={styles.bodyEmoji}>🧍</Text>
                            </View>
                        </View>
                        
                        {/* Health Metrics */}
                        <View style={styles.metricsContainer}>
                            {healthStats.map((stat) => (
                                <View key={stat.id} style={styles.metricRow}>
                                    <Text style={styles.metricIcon}>{stat.icon}</Text>
                                    <View style={styles.metricInfo}>
                                        <Text style={styles.metricLabel}>{stat.label}</Text>
                                        <View style={styles.metricValueRow}>
                                            <Text style={styles.metricValue}>{stat.value}</Text>
                                            <Text style={styles.metricUnit}>{stat.unit}</Text>
                                        </View>
                                    </View>
                                </View>
                            ))}
                        </View>
                    </View>
                </GlassCard>

                {/* Personalized Insights Section */}
                <Text style={styles.sectionTitle}>Personalized Insights</Text>
                
                <View style={styles.insightsRow}>
                    {/* AI Prediction Card */}
                    <GlassCard style={styles.insightCard}>
                        <View style={styles.insightHeader}>
                            <Text style={styles.insightIcon}>📊</Text>
                            <Text style={styles.insightTitle}>AI Prediction</Text>
                        </View>
                        <View style={styles.trendLine}>
                            <View style={[styles.trendDot, { backgroundColor: theme.primary }]} />
                            <View style={styles.trendPath} />
                        </View>
                        <Text style={styles.predictionLabel}>Next {aiPrediction.days} Days: <Text style={styles.predictionValue}>{aiPrediction.status}</Text></Text>
                        <Text style={styles.predictionMessage}>{aiPrediction.message}</Text>
                    </GlassCard>

                    {/* Upcoming Tasks Card */}
                    <GlassCard style={styles.insightCard}>
                        <View style={styles.insightHeader}>
                            <Text style={styles.insightIcon}>📋</Text>
                            <Text style={styles.insightTitle}>Upcoming Tasks</Text>
                        </View>
                        {upcomingTasks.map((task) => (
                            <View key={task.id} style={styles.taskRow}>
                                <Text style={styles.taskIcon}>{task.icon}</Text>
                                <View style={styles.taskInfo}>
                                    <Text style={styles.taskTitle}>{task.title}</Text>
                                    <Text style={styles.taskNote}>{task.time || task.note}</Text>
                                </View>
                            </View>
                        ))}
                    </GlassCard>
                </View>

                {/* Wellness Trends Chart */}
                <GlassCard style={styles.chartCard}>
                    <View style={styles.chartHeader}>
                        <Text style={styles.cardTitle}>Wellness Trends (Last 30 Days)</Text>
                        <View style={styles.filterBtn}>
                            <Text style={styles.filterText}>Filter</Text>
                        </View>
                    </View>
                    <View style={styles.chartLegend}>
                        <View style={styles.legendItem}>
                            <View style={[styles.legendDot, { backgroundColor: theme.primary }]} />
                            <Text style={styles.legendText}>Steps</Text>
                        </View>
                        <View style={styles.legendItem}>
                            <View style={[styles.legendDot, { backgroundColor: theme.accent }]} />
                            <Text style={styles.legendText}>Calories Burned</Text>
                        </View>
                        <View style={styles.legendItem}>
                            <View style={[styles.legendDot, { backgroundColor: theme.secondary }]} />
                            <Text style={styles.legendText}>Stress</Text>
                        </View>
                    </View>
                    {/* Chart Placeholder - Wave Lines */}
                    <View style={styles.chartArea}>
                        <Svg width="100%" height="80">
                            <Path
                                d="M0 40 Q40 20 80 40 T160 40 T240 40 T320 40"
                                stroke={theme.primary}
                                strokeWidth="2"
                                fill="none"
                                opacity={0.8}
                            />
                            <Path
                                d="M0 50 Q40 70 80 50 T160 50 T240 50 T320 50"
                                stroke={theme.accent}
                                strokeWidth="2"
                                fill="none"
                                opacity={0.6}
                            />
                            <Path
                                d="M0 35 Q40 45 80 30 T160 35 T240 30 T320 35"
                                stroke={theme.secondary}
                                strokeWidth="2"
                                fill="none"
                                opacity={0.5}
                            />
                        </Svg>
                    </View>
                </GlassCard>

                {/* Bottom padding */}
                <View style={{ height: 100 }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.gradientStart,
    },
    scrollContent: {
        paddingTop: 60,
    },
    
    // Header
    header: {
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerLogo: {
        width: 60,
        height: 60,
        borderRadius: 12,
    },
    headerText: {
        marginLeft: 16,
    },
    brandName: {
        fontSize: 28,
        fontWeight: 'bold',
        color: theme.white,
    },
    brandAccent: {
        color: theme.accent,
    },
    aiPill: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(139, 92, 246, 0.3)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        marginTop: 8,
    },
    aiPillIcon: {
        fontSize: 14,
        marginRight: 6,
    },
    aiPillText: {
        fontSize: 12,
        color: theme.textSecondary,
    },
    
    // Glass Card
    glassCard: {
        backgroundColor: theme.glassBackground,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: theme.glassBorder,
        marginHorizontal: 20,
        marginBottom: 16,
        padding: 20,
        overflow: 'hidden',
    },
    
    // Main Health Card
    mainCard: {
        marginTop: 8,
    },
    mainCardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: theme.white,
    },
    notificationBtn: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(255,255,255,0.1)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    notificationIcon: {
        fontSize: 16,
    },
    healthRow: {
        flexDirection: 'row',
    },
    bodyContainer: {
        width: 100,
        alignItems: 'center',
        justifyContent: 'center',
    },
    bodySilhouette: {
        width: 80,
        height: 120,
        backgroundColor: 'rgba(20, 184, 166, 0.2)',
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(20, 184, 166, 0.4)',
    },
    bodyEmoji: {
        fontSize: 48,
    },
    metricsContainer: {
        flex: 1,
        paddingLeft: 16,
    },
    metricRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    metricIcon: {
        fontSize: 24,
        marginRight: 12,
    },
    metricInfo: {
        flex: 1,
    },
    metricLabel: {
        fontSize: 12,
        color: theme.textMuted,
        marginBottom: 2,
    },
    metricValueRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
    },
    metricValue: {
        fontSize: 22,
        fontWeight: 'bold',
        color: theme.white,
    },
    metricUnit: {
        fontSize: 12,
        color: theme.textSecondary,
        marginLeft: 4,
    },
    
    // Section Title
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: theme.white,
        paddingHorizontal: 20,
        marginTop: 8,
        marginBottom: 16,
    },
    
    // Insights Row
    insightsRow: {
        flexDirection: 'row',
        paddingHorizontal: 12,
    },
    insightCard: {
        flex: 1,
        marginHorizontal: 8,
        padding: 16,
    },
    insightHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    insightIcon: {
        fontSize: 16,
        marginRight: 8,
    },
    insightTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: theme.textPrimary,
    },
    trendLine: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    trendDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    trendPath: {
        flex: 1,
        height: 2,
        backgroundColor: 'rgba(20, 184, 166, 0.3)',
        marginLeft: 8,
    },
    predictionLabel: {
        fontSize: 12,
        color: theme.textSecondary,
        marginBottom: 4,
    },
    predictionValue: {
        color: theme.primary,
        fontWeight: '600',
    },
    predictionMessage: {
        fontSize: 11,
        color: theme.textMuted,
        lineHeight: 16,
    },
    taskRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    taskIcon: {
        fontSize: 20,
        marginRight: 10,
    },
    taskInfo: {
        flex: 1,
    },
    taskTitle: {
        fontSize: 13,
        color: theme.textPrimary,
        fontWeight: '500',
    },
    taskNote: {
        fontSize: 11,
        color: theme.textMuted,
    },
    
    // Chart Card
    chartCard: {
        marginTop: 8,
    },
    chartHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    filterBtn: {
        backgroundColor: 'rgba(255,255,255,0.1)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    filterText: {
        fontSize: 12,
        color: theme.textSecondary,
    },
    chartLegend: {
        flexDirection: 'row',
        marginBottom: 16,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 16,
    },
    legendDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 6,
    },
    legendText: {
        fontSize: 11,
        color: theme.textSecondary,
    },
    chartArea: {
        height: 80,
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderRadius: 12,
        overflow: 'hidden',
    },
});

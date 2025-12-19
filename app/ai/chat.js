import { View, Text, StyleSheet, ScrollView, Pressable, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { useState, useRef, useEffect } from 'react';
import { router } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';

// Wolf HMS Theme
const theme = {
    primary: '#10B981',
    darkNavy: '#0f172a',
    tealDark: '#0d3d56',
    lightCream: '#f0f9ff',
    white: '#ffffff',
    gray: '#94a3b8',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6',
    glassBackground: 'rgba(255,255,255,0.08)',
};

// Pre-defined symptom responses with Actions
const symptomResponses = {
    headache: {
        advice: "Based on your symptoms, here are some recommendations:\n\n• Rest in a quiet, dark room\n• Stay hydrated - drink plenty of water\n• Consider over-the-counter pain relievers (Paracetamol)\n• Apply a cold or warm compress\n\n⚠️ Seek immediate medical attention if:\n- Severe sudden headache\n- Headache with fever and stiff neck\n- Headache after head injury",
        severity: 'mild',
        action: null
    },
    fever: {
        advice: "For fever management:\n\n• Rest and stay hydrated\n• Take Paracetamol 650mg if temperature > 100°F\n• Wear light clothing\n\n⚠️ Seek medical attention if:\n- Temperature exceeds 103°F\n- Fever persists more than 3 days\n- Accompanied by severe symptoms",
        severity: 'moderate',
        action: 'book'
    },
    cold: {
        advice: "For common cold symptoms:\n\n• Get plenty of rest\n• Drink warm fluids (soup, tea, water)\n• Use steam inhalation\n• Gargle with salt water\n\n💚 Usually resolves in 7-10 days.",
        severity: 'mild',
        action: null
    },
    stomachache: {
        advice: "For stomach discomfort:\n\n• Eat bland, easily digestible foods\n• Avoid spicy, oily foods\n• Try antacids if acidity-related\n\n⚠️ Seek immediate care if:\n- Severe abdominal pain\n- Blood in stool or vomit",
        severity: 'moderate',
        action: 'book'
    },
    chestpain: {
        advice: "⚠️ CHEST PAIN ALERT\n\nIf you are experiencing:\n- Squeezing/crushing pain in center of chest\n- Pain radiating to left arm or jaw\n- Shortness of breath\n\n🚨 THIS COULD BE A HEART ATTACK. SEEK EMERGENCY HELP IMMEDIATELY.",
        severity: 'severe',
        action: 'emergency'
    },
    default: {
        advice: "I understand you're not feeling well.\n\n• Rest and stay hydrated\n• Monitor your symptoms\n\nWould you like to see a doctor for a proper diagnosis?",
        severity: 'mild',
        action: 'book'
    }
};

const quickSymptoms = ['Headache', 'Fever', 'Cold', 'Stomach ache', 'Chest Pain', 'Fatigue'];

export default function AIChatScreen() {
    const { patient } = useAuth();
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const scrollRef = useRef(null);

    useEffect(() => {
        // Personalized Greeting
        const greeting = patient?.name 
            ? `Hello ${patient.name.split(' ')[0]}! I'm the Wolf Health Guard 🐺\n\nHow can I help you today?` 
            : "Hello! I'm the Wolf Health Guard 🐺\n\nHow can I help you today?";

        setMessages([{
            id: 1,
            type: 'bot',
            text: greeting,
            severity: 'neutral'
        }]);
    }, [patient]);

    const getResponse = (message) => {
        const lowerMsg = message.toLowerCase();
        
        if (lowerMsg.includes('headache') || lowerMsg.includes('head pain')) return symptomResponses.headache;
        if (lowerMsg.includes('fever') || lowerMsg.includes('temperature') || lowerMsg.includes('hot')) return symptomResponses.fever;
        if (lowerMsg.includes('cold') || lowerMsg.includes('cough') || lowerMsg.includes('sneezing')) return symptomResponses.cold;
        if (lowerMsg.includes('stomach') || lowerMsg.includes('belly') || lowerMsg.includes('abdomen')) return symptomResponses.stomachache;
        if (lowerMsg.includes('chest') || lowerMsg.includes('heart')) return symptomResponses.chestpain;
        
        return symptomResponses.default;
    };

    const handleAction = (action) => {
        if (action === 'book') {
            router.push('/(tabs)/appointments');
        } else if (action === 'emergency') {
            // In a real app, this would trigger a call
            sendMessage("I need emergency help!");
        }
    };

    const sendMessage = (text = input) => {
        if (!text.trim()) return;

        const userMessage = {
            id: Date.now(),
            type: 'user',
            text: text.trim(),
        };

        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsTyping(true);

        // Simulate AI thinking
        setTimeout(() => {
            const response = getResponse(text);
            const botMessage = {
                id: Date.now() + 1,
                type: 'bot',
                text: response.advice,
                severity: response.severity,
                action: response.action
            };
            setMessages(prev => [...prev, botMessage]);
            setIsTyping(false);
        }, 1200);
    };

    return (
        <KeyboardAvoidingView 
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <LinearGradient
                colors={[theme.darkNavy, theme.tealDark]}
                style={styles.header}
            >
                <Pressable onPress={() => router.back()} style={styles.backBtn}>
                    <Text style={styles.backText}>← Back</Text>
                </Pressable>
                <View style={styles.headerInfo}>
                    <Text style={styles.title}>🤖 AI Health Guard</Text>
                    <Text style={styles.subtitle}>Smarter Triage</Text>
                </View>
            </LinearGradient>

            {/* Quick Symptoms */}
            <View style={styles.quickBar}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {quickSymptoms.map((symptom) => (
                        <Pressable 
                            key={symptom} 
                            style={styles.quickChip}
                            onPress={() => sendMessage(`I have ${symptom}`)}
                        >
                            <Text style={styles.quickChipText}>{symptom}</Text>
                        </Pressable>
                    ))}
                </ScrollView>
            </View>

            {/* Chat Messages */}
            <ScrollView 
                style={styles.chatContainer}
                ref={scrollRef}
                onContentSizeChange={() => scrollRef.current?.scrollToEnd()}
            >
                {messages.map((message) => (
                    <View 
                        key={message.id} 
                        style={[
                            styles.messageBubble,
                            message.type === 'user' ? styles.userBubble : styles.botBubble
                        ]}
                    >
                        {message.type === 'bot' && (
                            <View style={styles.botAvatar}>
                                <Text style={styles.botEmoji}>🐺</Text>
                            </View>
                        )}
                        <View style={[
                            styles.messageContent,
                            message.type === 'user' ? styles.userContent : styles.botContent
                        ]}>
                            <Text style={[
                                styles.messageText,
                                message.type === 'user' && styles.userText
                            ]}>{message.text}</Text>

                            {/* Severity Badge */}
                            {message.severity && message.severity !== 'neutral' && (
                                <View style={[
                                    styles.severityBadge,
                                    message.severity === 'mild' && styles.severityMild,
                                    message.severity === 'moderate' && styles.severityModerate,
                                    message.severity === 'severe' && styles.severitySevere,
                                ]}>
                                    <Text style={styles.severityText}>
                                        {message.severity === 'mild' ? '🟢 Mild' : 
                                         message.severity === 'moderate' ? '🟡 Moderate' : '🔴 SEVERE'}
                                    </Text>
                                </View>
                            )}

                            {/* Action Button */}
                            {message.action && (
                                <Pressable 
                                    style={[
                                        styles.actionBtn,
                                        message.action === 'emergency' ? styles.emergencyBtn : styles.bookBtn
                                    ]}
                                    onPress={() => handleAction(message.action)}
                                >
                                    <Text style={styles.actionBtnText}>
                                        {message.action === 'book' ? '📅 Find a Doctor' : '🚨 Call Emergency'}
                                    </Text>
                                </Pressable>
                            )}
                        </View>
                    </View>
                ))}

                {isTyping && (
                    <View style={[styles.messageBubble, styles.botBubble]}>
                        <View style={styles.botAvatar}>
                            <Text style={styles.botEmoji}>🐺</Text>
                        </View>
                        <View style={styles.typingIndicator}>
                            <Text style={styles.typingDots}>● ● ●</Text>
                        </View>
                    </View>
                )}
                <View style={{ height: 20 }} />
            </ScrollView>

            {/* Input */}
            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    placeholder="Describe symptoms..."
                    placeholderTextColor={theme.gray}
                    value={input}
                    onChangeText={setInput}
                    multiline
                />
                <Pressable 
                    style={[styles.sendBtn, !input.trim() && styles.sendBtnDisabled]}
                    onPress={() => sendMessage()}
                    disabled={!input.trim()}
                >
                    <Text style={styles.sendBtnText}>Send</Text>
                </Pressable>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc' },
    header: {
        padding: 16, paddingTop: 50,
        flexDirection: 'row', alignItems: 'center',
    },
    backBtn: { marginRight: 12 },
    backText: { color: theme.white, fontSize: 16 },
    title: { fontSize: 20, fontWeight: 'bold', color: theme.white },
    subtitle: { fontSize: 13, color: '#94a3b8' },
    quickBar: {
        backgroundColor: theme.white, paddingVertical: 12, paddingHorizontal: 16,
        borderBottomWidth: 1, borderBottomColor: '#e2e8f0',
    },
    quickChip: {
        backgroundColor: '#e0f2fe', paddingHorizontal: 14, paddingVertical: 8,
        borderRadius: 20, marginRight: 8,
    },
    quickChipText: { fontSize: 13, color: '#0284c7', fontWeight: '600' },
    chatContainer: { flex: 1, padding: 16 },
    messageBubble: { flexDirection: 'row', marginBottom: 16 },
    userBubble: { justifyContent: 'flex-end' },
    botBubble: { justifyContent: 'flex-start' },
    botAvatar: {
        width: 36, height: 36, borderRadius: 18, backgroundColor: theme.darkNavy,
        justifyContent: 'center', alignItems: 'center', marginRight: 8,
    },
    botEmoji: { fontSize: 18 },
    messageContent: { maxWidth: '80%', padding: 14, borderRadius: 16 },
    userContent: { backgroundColor: theme.primary, borderBottomRightRadius: 4 },
    botContent: { backgroundColor: theme.white, borderBottomLeftRadius: 4, elevation: 1 },
    messageText: { fontSize: 15, color: theme.darkNavy, lineHeight: 22 },
    userText: { color: theme.white },
    severityBadge: {
        alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4,
        borderRadius: 12, marginTop: 10,
    },
    severityMild: { backgroundColor: '#d1fae5' },
    severityModerate: { backgroundColor: '#fef3c7' },
    severitySevere: { backgroundColor: '#fee2e2' },
    severityText: { fontSize: 12, fontWeight: '600' },
    actionBtn: {
        marginTop: 12, paddingVertical: 10, paddingHorizontal: 16,
        borderRadius: 12, alignItems: 'center',
    },
    bookBtn: { backgroundColor: theme.primary },
    emergencyBtn: { backgroundColor: theme.error },
    actionBtnText: { color: 'white', fontWeight: 'bold', fontSize: 14 },
    typingIndicator: { backgroundColor: theme.white, padding: 14, borderRadius: 16 },
    typingDots: { color: theme.gray, letterSpacing: 4 },
    inputContainer: {
        flexDirection: 'row', backgroundColor: theme.white,
        padding: 12, borderTopWidth: 1, borderTopColor: '#e2e8f0',
        alignItems: 'flex-end', gap: 8,
    },
    input: {
        flex: 1, backgroundColor: '#f1f5f9', borderRadius: 20,
        paddingHorizontal: 16, paddingVertical: 12, fontSize: 15,
        maxHeight: 100, color: theme.darkNavy,
    },
    sendBtn: {
        backgroundColor: theme.darkNavy, paddingHorizontal: 20, paddingVertical: 12,
        borderRadius: 20,
    },
    sendBtnDisabled: { opacity: 0.5 },
    sendBtnText: { color: theme.white, fontWeight: '600' },
});

import { View, Text, StyleSheet, ScrollView, Pressable, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { useState, useRef } from 'react';
import { router } from 'expo-router';

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
};

// Pre-defined symptom responses
const symptomResponses = {
    headache: {
        advice: "Based on your symptoms, here are some recommendations:\n\n• Rest in a quiet, dark room\n• Stay hydrated - drink plenty of water\n• Consider over-the-counter pain relievers (Paracetamol)\n• Apply a cold or warm compress\n\n⚠️ Seek immediate medical attention if:\n- Severe sudden headache\n- Headache with fever and stiff neck\n- Headache after head injury",
        severity: 'mild',
    },
    fever: {
        advice: "For fever management:\n\n• Rest and stay hydrated\n• Take Paracetamol 650mg if temperature > 100°F\n• Wear light clothing\n• Use a damp cloth on forehead\n\n⚠️ Seek medical attention if:\n- Temperature exceeds 103°F\n- Fever persists more than 3 days\n- Accompanied by severe symptoms",
        severity: 'moderate',
    },
    cold: {
        advice: "For common cold symptoms:\n\n• Get plenty of rest\n• Drink warm fluids (soup, tea, water)\n• Use steam inhalation\n• Gargle with salt water\n• Use saline nasal spray\n\n💚 Usually resolves in 7-10 days. See a doctor if symptoms worsen or persist.",
        severity: 'mild',
    },
    stomachache: {
        advice: "For stomach discomfort:\n\n• Eat bland, easily digestible foods\n• Avoid spicy, oily foods\n• Stay hydrated with small sips\n• Try antacids if acidity-related\n• Rest in a comfortable position\n\n⚠️ Seek immediate care if:\n- Severe abdominal pain\n- Blood in stool or vomit\n- High fever with stomach pain",
        severity: 'moderate',
    },
    default: {
        advice: "I understand you're not feeling well. Here's what I recommend:\n\n• Rest and stay hydrated\n• Monitor your symptoms\n• Note any changes to report to your doctor\n\n📞 Would you like me to help you book an appointment with a doctor?",
        severity: 'mild',
    }
};

const quickSymptoms = ['Headache', 'Fever', 'Cold', 'Stomach ache', 'Cough', 'Fatigue'];

export default function AIChatScreen() {
    const [messages, setMessages] = useState([
        {
            id: 1,
            type: 'bot',
            text: "Hello! I'm the Wolf Health Guard 🐺\n\nI can help you understand your symptoms and provide initial guidance. Please describe how you're feeling, or select from common symptoms below.",
        }
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const scrollRef = useRef(null);

    const getResponse = (message) => {
        const lowerMsg = message.toLowerCase();
        
        if (lowerMsg.includes('headache') || lowerMsg.includes('head pain')) {
            return symptomResponses.headache;
        } else if (lowerMsg.includes('fever') || lowerMsg.includes('temperature')) {
            return symptomResponses.fever;
        } else if (lowerMsg.includes('cold') || lowerMsg.includes('cough') || lowerMsg.includes('sneezing')) {
            return symptomResponses.cold;
        } else if (lowerMsg.includes('stomach') || lowerMsg.includes('belly') || lowerMsg.includes('abdomen')) {
            return symptomResponses.stomachache;
        }
        return symptomResponses.default;
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
            };
            setMessages(prev => [...prev, botMessage]);
            setIsTyping(false);
        }, 1500);
    };

    const handleQuickSymptom = (symptom) => {
        sendMessage(`I'm experiencing ${symptom.toLowerCase()}`);
    };

    return (
        <KeyboardAvoidingView 
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            {/* Header */}
            <View style={styles.header}>
                <Pressable onPress={() => router.back()} style={styles.backBtn}>
                    <Text style={styles.backText}>← Back</Text>
                </Pressable>
                <View style={styles.headerInfo}>
                    <Text style={styles.title}>🤖 AI Health Guard</Text>
                    <Text style={styles.subtitle}>Symptom Checker</Text>
                </View>
            </View>

            {/* Quick Symptoms */}
            <View style={styles.quickBar}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {quickSymptoms.map((symptom) => (
                        <Pressable 
                            key={symptom} 
                            style={styles.quickChip}
                            onPress={() => handleQuickSymptom(symptom)}
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
                            ]}>
                                {message.text}
                            </Text>
                            {message.severity && (
                                <View style={[
                                    styles.severityBadge,
                                    message.severity === 'mild' && styles.severityMild,
                                    message.severity === 'moderate' && styles.severityModerate,
                                ]}>
                                    <Text style={styles.severityText}>
                                        {message.severity === 'mild' ? '🟢 Mild' : '🟡 Moderate'}
                                    </Text>
                                </View>
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
                    placeholder="Describe your symptoms..."
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

            {/* Disclaimer */}
            <Text style={styles.disclaimer}>
                ⚠️ This is for informational purposes only. Always consult a qualified doctor.
            </Text>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.lightCream },
    header: {
        backgroundColor: theme.tealDark, padding: 16, paddingTop: 50,
        flexDirection: 'row', alignItems: 'center',
    },
    backBtn: { marginRight: 12 },
    backText: { color: theme.white, fontSize: 16 },
    headerInfo: {},
    title: { fontSize: 20, fontWeight: 'bold', color: theme.white },
    subtitle: { fontSize: 13, color: theme.gray },
    quickBar: {
        backgroundColor: theme.white, paddingVertical: 12, paddingHorizontal: 16,
        borderBottomWidth: 1, borderBottomColor: '#e2e8f0',
    },
    quickChip: {
        backgroundColor: '#d1fae5', paddingHorizontal: 14, paddingVertical: 8,
        borderRadius: 20, marginRight: 8,
    },
    quickChipText: { fontSize: 13, color: theme.primary, fontWeight: '500' },
    chatContainer: { flex: 1, padding: 16 },
    messageBubble: { flexDirection: 'row', marginBottom: 16 },
    userBubble: { justifyContent: 'flex-end' },
    botBubble: { justifyContent: 'flex-start' },
    botAvatar: {
        width: 36, height: 36, borderRadius: 18, backgroundColor: theme.tealDark,
        justifyContent: 'center', alignItems: 'center', marginRight: 8,
    },
    botEmoji: { fontSize: 18 },
    messageContent: { maxWidth: '75%', padding: 14, borderRadius: 16 },
    userContent: { backgroundColor: theme.primary, borderBottomRightRadius: 4 },
    botContent: { backgroundColor: theme.white, borderBottomLeftRadius: 4 },
    messageText: { fontSize: 15, color: theme.darkNavy, lineHeight: 22 },
    userText: { color: theme.white },
    severityBadge: {
        alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4,
        borderRadius: 12, marginTop: 10,
    },
    severityMild: { backgroundColor: '#d1fae5' },
    severityModerate: { backgroundColor: '#fef3c7' },
    severityText: { fontSize: 12, fontWeight: '500' },
    typingIndicator: { backgroundColor: theme.white, padding: 14, borderRadius: 16 },
    typingDots: { color: theme.gray, letterSpacing: 4 },
    inputContainer: {
        flexDirection: 'row', backgroundColor: theme.white,
        padding: 12, borderTopWidth: 1, borderTopColor: '#e2e8f0',
        alignItems: 'flex-end', gap: 8,
    },
    input: {
        flex: 1, backgroundColor: theme.lightCream, borderRadius: 20,
        paddingHorizontal: 16, paddingVertical: 12, fontSize: 15,
        maxHeight: 100, color: theme.darkNavy,
    },
    sendBtn: {
        backgroundColor: theme.primary, paddingHorizontal: 20, paddingVertical: 12,
        borderRadius: 20,
    },
    sendBtnDisabled: { opacity: 0.5 },
    sendBtnText: { color: theme.white, fontWeight: '600' },
    disclaimer: {
        textAlign: 'center', fontSize: 11, color: theme.gray,
        padding: 8, backgroundColor: '#fef3c7',
    },
});

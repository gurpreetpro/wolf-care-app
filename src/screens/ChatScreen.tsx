import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, SafeAreaView, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons'; // Assuming Expo vector icons

import { MOCK_CHATS } from '../data/demoData';

export default function ChatScreen({ navigation }: any) {
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState(MOCK_CHATS);

    const handlePanic = () => {
        // Immediate Safety Action
        // 1. Clear navigation stack
        // 2. Go to "Safe Mode" (e.g. fake News screen)
        navigation.reset({
            index: 0,
            routes: [{ name: 'SafeMode' }],
        });
    };

    const renderItem = ({ item }: any) => {
        const isMe = item.sender === 'me';
        return (
            <View style={[styles.bubbleWrapper, isMe ? styles.wrapperMe : styles.wrapperThem]}>
                {isMe ? (
                    <LinearGradient colors={['#6C5CE7', '#A29BFE']} style={styles.bubbleMe}>
                        <Text style={styles.textMe}>{item.text}</Text>
                    </LinearGradient>
                ) : (
                    <View style={styles.bubbleThem}>
                        <Text style={styles.textThem}>{item.text}</Text>
                    </View>
                )}
            </View>
        );
    };

    return (
        <View style={styles.container}>
            {/* Dynamic Background */}
            <LinearGradient colors={['#0F0F1A', '#1A1A2E']} style={StyleSheet.absoluteFill} />

            {/* Header with Panic Button */}
            <View style={styles.headerContainer}>
                <BlurView intensity={20} tint="dark" style={styles.blurHeader}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                        <Ionicons name="chevron-back" size={24} color="#fff" />
                    </TouchableOpacity>

                    <View style={styles.userInfo}>
                        <View style={styles.avatar} />
                        <Text style={styles.userName}>Alex Chen</Text>
                    </View>

                    <TouchableOpacity onPress={handlePanic} style={styles.panicBtn}>
                        <Ionicons name="shield-checkmark" size={24} color="#00CEC9" />
                    </TouchableOpacity>
                </BlurView>
            </View>

            <FlatList
                data={messages}
                renderItem={renderItem}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.listContent}
            />

            {/* Input Area */}
            <View style={styles.inputArea}>
                <TextInput
                    style={styles.input}
                    placeholder="Type a message..."
                    placeholderTextColor="#aaa"
                    value={message}
                    onChangeText={setMessage}
                />
                <TouchableOpacity style={styles.sendBtn}>
                    <Ionicons name="send" size={20} color="#fff" />
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    headerContainer: { paddingTop: 50, zIndex: 10 },
    blurHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, paddingVertical: 15 },
    backBtn: { marginRight: 15 },
    userInfo: { flex: 1, flexDirection: 'row', alignItems: 'center' },
    avatar: { width: 35, height: 35, borderRadius: 18, backgroundColor: '#eee', marginRight: 10 },
    userName: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
    panicBtn: { padding: 8, backgroundColor: 'rgba(0, 206, 201, 0.1)', borderRadius: 20 },

    listContent: { padding: 15, paddingBottom: 80 },
    bubbleWrapper: { marginVertical: 4, width: '100%' },
    wrapperMe: { alignItems: 'flex-end' },
    wrapperThem: { alignItems: 'flex-start' },

    bubbleMe: { padding: 12, borderRadius: 20, borderTopRightRadius: 4, maxWidth: '80%' },
    bubbleThem: { padding: 12, borderRadius: 20, borderTopLeftRadius: 4, backgroundColor: '#2D2D44', maxWidth: '80%' },
    textMe: { color: '#fff' },
    textThem: { color: '#fff' },

    inputArea: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 15, paddingBottom: 30, backgroundColor: '#0F0F1A', flexDirection: 'row', alignItems: 'center' },
    input: { flex: 1, backgroundColor: '#1A1A2E', padding: 12, borderRadius: 25, color: '#fff', marginRight: 10 },
    sendBtn: { backgroundColor: '#6C5CE7', padding: 12, borderRadius: 25 }
});

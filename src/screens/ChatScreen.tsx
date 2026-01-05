import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, SafeAreaView, KeyboardAvoidingView, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { socketService } from '../services/socketService';
import api from '../services/api';
import { usePreventScreenCapture } from 'expo-screen-capture';

interface Message {
    id: string;
    senderId: string;
    content: string;
    createdAt: string;
}

export default function ChatScreen({ navigation, route }: any) {
    usePreventScreenCapture(); // Block screenshots on Android
    const { user } = useAuth();
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState<Message[]>([]);
    const [isConnected, setIsConnected] = useState(false);
    const flatListRef = useRef<FlatList>(null);

    // Get matchId from route params or use a demo ID
    const matchId = route.params.matchId || 'demo-match-1';
    const matchedUserName = route.params.matchedUserName || 'Alex Chen';
    const userB = route.params.userB;

    useEffect(() => {
        initSocket();

        return () => {
            // Cleanup on unmount
        };
    }, []);

    const initSocket = async () => {
        try {
            await socketService.connect();
            setIsConnected(true);

            // Join the chat room
            socketService.joinRoom(matchId);

            // Listen for new messages
            const unsubMessage = socketService.onMessage((newMessage) => {
                setMessages(prev => [...prev, newMessage]);
                setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
            });

            // Listen for message history
            const unsubHistory = socketService.onMessageHistory((history) => {
                setMessages(history);
                setTimeout(() => flatListRef.current?.scrollToEnd({ animated: false }), 100);
            });

            return () => {
                unsubMessage();
                unsubHistory();
            };
        } catch (error) {
            console.error('Failed to connect to chat:', error);
        }
    };

    const handleSend = () => {
        if (!message.trim() || !user) return;

        socketService.sendMessage({
            matchId,
            senderId: user.id,
            content: message.trim(),
            isSecret: false,
            type: 'text'
        });

        setMessage('');
    };

    const handlePanic = () => {
        navigation.reset({
            index: 0,
            routes: [{ name: 'SafeMode' }],
        });
    };

    const renderItem = ({ item }: { item: Message }) => {
        const isMe = item.senderId === user?.id;
        return (
            <View style={[styles.bubbleWrapper, isMe ? styles.wrapperMe : styles.wrapperThem]}>
                {isMe ? (
                    <LinearGradient colors={['#6C5CE7', '#A29BFE']} style={styles.bubbleMe}>
                        <Text style={styles.textMe}>{item.content}</Text>
                    </LinearGradient>
                ) : (
                    <View style={styles.bubbleThem}>
                        <Text style={styles.textThem}>{item.content}</Text>
                    </View>
                )}
                <Text style={[styles.timestamp, isMe ? styles.timestampMe : styles.timestampThem]}>
                    {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <LinearGradient colors={['#0F0F1A', '#1A1A2E']} style={StyleSheet.absoluteFill} />

            {/* Header with Panic Button */}
            <SafeAreaView style={styles.headerContainer}>
                <BlurView intensity={20} tint="dark" style={styles.blurHeader}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                        <Ionicons name="chevron-back" size={24} color="#fff" />
                    </TouchableOpacity>

                    <View style={styles.userInfo}>
                        <View style={styles.avatar} />
                        <View>
                            <Text style={styles.userName}>{matchedUserName}</Text>
                            <Text style={styles.connectionStatus}>
                                {isConnected ? '● Connected' : '○ Connecting...'}
                            </Text>
                        </View>
                    </View>

                    <TouchableOpacity
                        onPress={() => navigation.navigate('VideoCall', {
                            matchId,
                            otherUserId: userB?.id || 'demo-user-id', // Fallback for demo
                            isCaller: true
                        })}
                        style={styles.callBtn}
                    >
                        <Ionicons name="videocam" size={22} color="#fff" />
                    </TouchableOpacity>

                    <TouchableOpacity onPress={handlePanic} style={styles.panicBtn}>
                        <Ionicons name="shield-checkmark" size={24} color="#00CEC9" />
                    </TouchableOpacity>
                </BlurView>
            </SafeAreaView>

            <KeyboardAvoidingView
                style={styles.chatContainer}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                keyboardVerticalOffset={0}
            >
                <FlatList
                    ref={flatListRef}
                    data={messages}
                    renderItem={renderItem}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Ionicons name="chatbubbles-outline" size={48} color="#444" />
                            <Text style={styles.emptyText}>No messages yet</Text>
                            <Text style={styles.emptySubtext}>Say hello to start the conversation!</Text>
                        </View>
                    }
                />

                {/* Input Area */}
                <View style={styles.inputArea}>
                    <TextInput
                        style={styles.input}
                        placeholder="Type a message..."
                        placeholderTextColor="#aaa"
                        value={message}
                        onChangeText={setMessage}
                        multiline
                        maxLength={1000}
                    />
                    <TouchableOpacity
                        style={[styles.sendBtn, !message.trim() && styles.sendBtnDisabled]}
                        onPress={handleSend}
                        disabled={!message.trim()}
                    >
                        <Ionicons name="send" size={20} color="#fff" />
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    headerContainer: { zIndex: 10 },
    blurHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 15,
        paddingVertical: 12,
        paddingTop: Platform.OS === 'android' ? 40 : 12
    },
    backBtn: { marginRight: 10 },
    userInfo: { flex: 1, flexDirection: 'row', alignItems: 'center' },
    avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#6C5CE7', marginRight: 12 },
    userName: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
    connectionStatus: { color: '#00CEC9', fontSize: 12, marginTop: 2 },
    callBtn: { padding: 8, marginRight: 5 },
    panicBtn: { padding: 8, backgroundColor: 'rgba(0, 206, 201, 0.1)', borderRadius: 20 },

    chatContainer: { flex: 1 },
    listContent: { padding: 15, paddingBottom: 10, flexGrow: 1 },

    emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 100 },
    emptyText: { color: '#666', fontSize: 18, marginTop: 15 },
    emptySubtext: { color: '#444', fontSize: 14, marginTop: 5 },

    bubbleWrapper: { marginVertical: 4, width: '100%' },
    wrapperMe: { alignItems: 'flex-end' },
    wrapperThem: { alignItems: 'flex-start' },

    bubbleMe: { padding: 12, borderRadius: 20, borderTopRightRadius: 4, maxWidth: '80%' },
    bubbleThem: { padding: 12, borderRadius: 20, borderTopLeftRadius: 4, backgroundColor: '#2D2D44', maxWidth: '80%' },
    textMe: { color: '#fff', fontSize: 15 },
    textThem: { color: '#fff', fontSize: 15 },

    timestamp: { fontSize: 10, marginTop: 4 },
    timestampMe: { color: '#888', textAlign: 'right', marginRight: 5 },
    timestampThem: { color: '#888', textAlign: 'left', marginLeft: 5 },

    inputArea: {
        padding: 15,
        paddingBottom: Platform.OS === 'ios' ? 30 : 15,
        backgroundColor: '#0F0F1A',
        flexDirection: 'row',
        alignItems: 'flex-end',
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.1)'
    },
    input: {
        flex: 1,
        backgroundColor: '#1A1A2E',
        padding: 12,
        paddingTop: 12,
        borderRadius: 25,
        color: '#fff',
        marginRight: 10,
        maxHeight: 100,
        fontSize: 15
    },
    sendBtn: { backgroundColor: '#6C5CE7', padding: 12, borderRadius: 25 },
    sendBtnDisabled: { opacity: 0.5 }
});

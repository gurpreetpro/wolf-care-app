import { io, Socket } from 'socket.io-client';
import * as SecureStore from 'expo-secure-store';
import { API_BASE_URL } from './api';

// Use the same URL as API
const SERVER_URL = API_BASE_URL;

class SocketService {
    private socket: Socket | null = null;
    private messageHandlers: ((message: any) => void)[] = [];
    private historyHandlers: ((messages: any[]) => void)[] = [];
    private typingHandlers: ((userId: string) => void)[] = [];

    async connect(): Promise<void> {
        if (this.socket?.connected) return;

        const token = await SecureStore.getItemAsync('auth_token');

        this.socket = io(SERVER_URL, {
            auth: { token },
            transports: ['websocket', 'polling'], // Allow fallback to polling for cloud
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000
        });

        this.socket.on('connect', () => {
            console.log('[socket]: Connected to server');
        });

        this.socket.on('disconnect', () => {
            console.log('[socket]: Disconnected from server');
        });

        this.socket.on('receive_message', (message: any) => {
            this.messageHandlers.forEach(handler => handler(message));
        });

        this.socket.on('message_history', (messages: any[]) => {
            this.historyHandlers.forEach(handler => handler(messages));
        });

        this.socket.on('user_typing', (data: { userId: string }) => {
            this.typingHandlers.forEach(handler => handler(data.userId));
        });

        this.socket.on('connect_error', (error) => {
            console.error('[socket]: Connection error:', error.message);
        });
    }

    disconnect(): void {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }

    joinRoom(matchId: string): void {
        if (this.socket?.connected) {
            this.socket.emit('join_room', matchId);
        }
    }

    sendMessage(data: {
        matchId: string;
        senderId: string;
        content: string;
        isSecret?: boolean;
        type?: 'text' | 'image';
    }): void {
        if (this.socket?.connected) {
            this.socket.emit('send_message', {
                matchId: data.matchId,
                senderId: data.senderId,
                content: data.content,
                isSecret: data.isSecret || false,
                type: data.type || 'text'
            });
        }
    }

    sendTyping(matchId: string, userId: string): void {
        if (this.socket?.connected) {
            this.socket.emit('typing', { matchId, userId });
        }
    }

    stopTyping(matchId: string, userId: string): void {
        if (this.socket?.connected) {
            this.socket.emit('stop_typing', { matchId, userId });
        }
    }

    onMessage(handler: (message: any) => void): () => void {
        this.messageHandlers.push(handler);
        return () => {
            this.messageHandlers = this.messageHandlers.filter(h => h !== handler);
        };
    }

    onMessageHistory(handler: (messages: any[]) => void): () => void {
        this.historyHandlers.push(handler);
        return () => {
            this.historyHandlers = this.historyHandlers.filter(h => h !== handler);
        };
    }

    onTyping(handler: (userId: string) => void): () => void {
        this.typingHandlers.push(handler);
        return () => {
            this.typingHandlers = this.typingHandlers.filter(h => h !== handler);
        };
    }

    isConnected(): boolean {
        return this.socket?.connected || false;
    }

    emit(event: string, data: any): void {
        if (this.socket?.connected) {
            this.socket.emit(event, data);
        }
    }

    on(event: string, handler: (data: any) => void): void {
        if (this.socket) {
            this.socket.on(event, handler);
        }
    }

    off(event: string): void {
        if (this.socket) {
            this.socket.off(event);
        }
    }
}

export const socketService = new SocketService();

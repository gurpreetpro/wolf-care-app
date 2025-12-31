import api from './api';
import * as SecureStore from 'expo-secure-store';
import nacl from 'tweetnacl';
import util from 'tweetnacl-util';

// Keys for SecureStore
const TOKEN_KEY = 'auth_token';
const PUBLIC_KEY_KEY = 'user_public_key';
const SECRET_KEY_KEY = 'user_secret_key'; // CRITICAL: Never leave device

export const AuthService = {
    // 1. Register: Generate Keys locally, then send Public Key to Server
    register: async (data: { username: string; phone: string; password: string; gender: string; pronouns: string }) => {
        try {
            // Generate E2EE KeyPair (Curve25519)
            const keyPair = nacl.box.keyPair();
            const publicKeyBase64 = util.encodeBase64(keyPair.publicKey);
            const secretKeyBase64 = util.encodeBase64(keyPair.secretKey);

            // Send to API
            const response = await api.post('/auth/register', {
                ...data,
                publicKey: publicKeyBase64, // Server stores this for others to use
            });

            // Valid Registration? Save Secret Key securely
            if (response.status === 201) {
                await SecureStore.setItemAsync(SECRET_KEY_KEY, secretKeyBase64);
                await SecureStore.setItemAsync(PUBLIC_KEY_KEY, publicKeyBase64);
            }

            return response.data;
        } catch (error: any) {
            throw error.response?.data || error.message;
        }
    },

    // 2. Login: Authenticate and Save Token
    login: async (data: { username: string; password: string }) => {
        try {
            const response = await api.post('/auth/login', data);

            const { token, user } = response.data;

            // Save Token
            await SecureStore.setItemAsync(TOKEN_KEY, token);

            // Note: In a real app, if this is a NEW device, we'd need to restore the Secret Key 
            // via a recovery phrase or similar. For MVP/V1, we assume same device or non-persist secret chat.

            return user;
        } catch (error: any) {
            throw error.response?.data || error.message;
        }
    },

    logout: async () => {
        await SecureStore.deleteItemAsync(TOKEN_KEY);
        // Optional: Keep keys if you want "remember me" style E2EE persistence
    },

    getToken: async () => {
        return await SecureStore.getItemAsync(TOKEN_KEY);
    }
};

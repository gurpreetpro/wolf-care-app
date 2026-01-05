import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import api from './api';

// Config
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
    }),
});

export const registerForPushNotificationsAsync = async () => {
    let token;

    if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
            name: 'default',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#FF231F7C',
        });
    }

    if (Device.isDevice) {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;
        if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }
        if (finalStatus !== 'granted') {
            console.log('Failed to get push token for push notification!');
            return;
        }

        // Project ID is handled automatically by EAS config, but we can try basic token first
        try {
            // We use simple Expo push token for simplicity in MVP
            // In EAS Build, we might need projectId
            token = (await Notifications.getExpoPushTokenAsync({
                // projectId: Constants.expoConfig?.extra?.eas?.projectId, 
            })).data;
            console.log("Push Token:", token);
        } catch (e) {
            console.log("Error getting push token:", e);
        }
    } else {
        console.log('Must use physical device for Push Notifications');
    }

    return token;
};

export const updateServerPushToken = async () => {
    const token = await registerForPushNotificationsAsync();
    if (token) {
        try {
            await api.put('/auth/pushtoken', { pushToken: token });
            console.log('Push token sent to server');
        } catch (error) {
            console.error('Failed to send push token to server:', error);
        }
    }
};

/**
 * App Configuration
 * Dynamic config with environment variables
 */

export default ({ config }) => ({
    ...config,
    name: "Wolf Care",
    slug: "wolf-patient-app",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "dark",
    scheme: "wolfcare",
    splash: {
        image: "./assets/splash-icon.png",
        resizeMode: "contain",
        backgroundColor: "#0f172a"
    },
    ios: {
        supportsTablet: true,
        bundleIdentifier: "com.gurpreetpro.wolfpatientapp"
    },
    android: {
        adaptiveIcon: {
            foregroundImage: "./assets/adaptive-icon.png",
            backgroundColor: "#0f172a"
        },
        package: "com.gurpreetpro.wolfpatientapp"
    },
    web: {
        favicon: "./assets/favicon.png",
        bundler: "metro"
    },
    plugins: [
        "expo-router",
        "expo-secure-store"
    ],
    extra: {
        router: {},
        eas: {
            projectId: "2067eb42-40e7-4ea7-9a64-df51731b5d54"
        },
        // Firebase config - use EAS secrets in production
        firebaseApiKey: process.env.FIREBASE_API_KEY || "AIzaSyCpSEtPNyKAaDftNf0ze2R5mz8ZAxl5ekg",
        firebaseAuthDomain: process.env.FIREBASE_AUTH_DOMAIN || "wolf-hms.firebaseapp.com",
        firebaseProjectId: process.env.FIREBASE_PROJECT_ID || "wolf-hms",
        // API URL
        apiUrl: process.env.API_URL || "https://wolf-hms-server-1026194439642.asia-south1.run.app"
    }
});

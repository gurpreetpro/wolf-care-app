// Firebase Configuration for Wolf Patient App
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
    apiKey: "AIzaSyCpSEtPNyKAaDftNf0ze2R5mz8ZAxl5ekg",
    authDomain: "wolf-hms.firebaseapp.com",
    projectId: "wolf-hms",
    storageBucket: "wolf-hms.firebasestorage.app",
    messagingSenderId: "1026194439642",
    appId: "1:1026194439642:web:b80a83a65db1c33d5dd4e3",
    measurementId: "G-00T2S7JRCR"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { app, auth };
export default app;

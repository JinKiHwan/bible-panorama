import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';

// Firebase configuration
const isConfigured = !!import.meta.env.VITE_FIREBASE_PROJECT_ID;

if (!isConfigured) {
  console.warn(
    '[Firebase] Firebase configuration is missing. "projectId" is not set.\n' +
    'Please create a `.env` file in the root directory and add your Firebase credentials:\n' +
    'VITE_FIREBASE_API_KEY=...\n' +
    'VITE_FIREBASE_AUTH_DOMAIN=...\n' +
    'VITE_FIREBASE_PROJECT_ID=...\n' +
    'VITE_FIREBASE_STORAGE_BUCKET=...\n' +
    'VITE_FIREBASE_MESSAGING_SENDER_ID=...\n' +
    'VITE_FIREBASE_APP_ID=...\n\n' +
    'Falling back to placeholder configuration to prevent application boot crash.'
  );
}

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'mock-api-key',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'mock-auth-domain',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'mock-project-id',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'mock-storage-bucket',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || 'mock-messaging-sender',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || 'mock-app-id',
};

// 파이어베이스 앱 초기화
const app = initializeApp(firebaseConfig);

let analytics;
if (typeof window !== 'undefined' && isConfigured) {
  try {
    analytics = getAnalytics(app);
  } catch (err) {
    console.error('[Firebase] Failed to initialize Analytics:', err);
  }
}

// 인증(Auth) 서비스 내보내기
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// 데이터베이스(Firestore) 서비스 내보내기 (추후 묵상 노트용)
export const db = getFirestore(app);

export { analytics };

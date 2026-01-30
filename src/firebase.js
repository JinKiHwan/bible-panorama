import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';

// ⚠️ 중요: Firebase 콘솔 > 프로젝트 설정 > 내 앱 > 'firebaseConfig' 내용을 아래에 덮어씌우세요.
// 보안을 위해 실제 배포 시에는 .env 환경변수를 사용하는 것을 권장합니다.
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// 파이어베이스 앱 초기화
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
// 인증(Auth) 서비스 내보내기
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// 데이터베이스(Firestore) 서비스 내보내기 (추후 묵상 노트용)
export const db = getFirestore(app);

import { ref } from 'vue';
import { auth } from '@/firebase';
import { onAuthStateChanged } from 'firebase/auth';

// 컴포넌트 밖에서 변수를 선언하여 '싱글톤(전역 변수)'처럼 동작하게 합니다.
const currentUser = ref(null);
const isAuthInit = ref(false); // 최초 인증 확인 여부

// 리스너가 중복 등록되지 않도록 플래그 사용
let isListenerAttached = false;

export function useAuthState() {
  // 앱 실행 시 딱 한 번만 리스너를 붙입니다.
  if (!isListenerAttached) {
    onAuthStateChanged(auth, (user) => {
      currentUser.value = user;
      isAuthInit.value = true;
    });
    isListenerAttached = true;
  }

  return {
    currentUser,
    isAuthInit,
  };
}

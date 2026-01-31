import { createRouter, createWebHistory } from 'vue-router';
// 컴포넌트 경로는 프로젝트 구조에 맞게 유지
import HomeView from '@/views/HomeView.vue';
import MyPage from '@/views/MyPage.vue';

// [수정] routes 배열을 export const로 내보냅니다.
export const routes = [
  { path: '/', name: 'home', component: HomeView },
  { path: '/mypage', name: 'MyPage', component: MyPage },
];

// 기존 router 생성 코드는 개발 모드(npm run dev) 호환성을 위해 유지하거나,
// vite-ssg 사용 시 main.js에서 처리하므로 여기선 routes만 내보내도 됩니다.
// 하지만 일반적인 사용을 위해 기본 export도 남겨둡니다.
const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    } else {
      return { top: 0 };
    }
  },
});

export default router;

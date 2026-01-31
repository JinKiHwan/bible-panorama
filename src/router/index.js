import { createRouter, createWebHistory } from 'vue-router';
// 뷰 컴포넌트 import 경로는 실제 프로젝트 구조에 맞게 확인해주세요
import HomeView from '@/views/HomeView.vue';
import MyPage from '@/views/MyPage.vue';

const routes = [
  { path: '/', name: 'home', component: HomeView },
  { path: '/mypage', name: 'MyPage', component: MyPage },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  // [중요] 페이지 이동 시 스크롤을 맨 위로 강제 이동시키는 옵션
  scrollBehavior(to, from, savedPosition) {
    return { top: 0 };
  },
});

export default router;

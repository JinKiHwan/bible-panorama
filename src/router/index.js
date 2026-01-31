import HomeView from '@/views/HomeView.vue';
import MyPage from '@/views/MyPage.vue';

// [중요] vite-ssg를 사용할 때는 여기서 router 인스턴스(createRouter)를 생성하지 않습니다.
// 단순히 경로 배열(routes)만 export 하면 main.js에서 알아서 라우터를 생성해줍니다.
export const routes = [
  { path: '/', name: 'home', component: HomeView },
  { path: '/mypage', name: 'MyPage', component: MyPage },
];

import { ViteSSG } from 'vite-ssg';
import App from './App.vue';
import { routes } from './router'; // router/index.js에서 export한 routes 배열을 가져옵니다.
//import '@/assets/scss/base/_index.scss';

// [변경] ViteSSG를 사용하여 앱 생성 및 내보내기
// 기존의 createApp(App).use(router).mount('#app') 방식을 대체합니다.
export const createApp = ViteSSG(
  // 1. 루트 컴포넌트
  App,

  // 2. 라우터 옵션 (Vue Router 설정)
  {
    routes,
    base: import.meta.env.BASE_URL,
    scrollBehavior(to, from, savedPosition) {
      if (savedPosition) return savedPosition;
      return { top: 0 };
    },
  },

  // 3. 앱 컨텍스트 (플러그인 등록 등)
  ({ app, router, routes, isClient, initialState }) => {
    // @vueuse/head(SEO)는 vite-ssg에 내장되어 있어 별도로 app.use() 하지 않아도 됩니다.
    // 만약 Pinia나 다른 플러그인을 쓴다면 여기서 app.use(Pinia) 등을 호출합니다.
    // Firebase 등 브라우저 API를 쓰는 라이브러리는 isClient 조건문 안에서 처리할 수도 있습니다.
    // if (isClient) { ... }
  },
);

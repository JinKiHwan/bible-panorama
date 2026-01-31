// src/main.js
import { createApp } from 'vue';
import { createHead } from '@vueuse/head'; // [추가]
import App from './App.vue';
import router from './router'; // 작성하신 라우터 파일

const app = createApp(App);
const head = createHead(); // [추가] head 생성
app.use(router); // 👈 이 부분이 반드시 있어야 합니다!
app.use(head); // [추가] app에 등록
app.mount('#app');

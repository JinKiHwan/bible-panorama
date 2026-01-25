// src/main.js
import { createApp } from 'vue';
import App from './App.vue';
import router from './router'; // 작성하신 라우터 파일

const app = createApp(App);

app.use(router); // 👈 이 부분이 반드시 있어야 합니다!
app.mount('#app');

import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        // 주의: 여기에는 변수($), 믹스인(@mixin), 함수(@function)만 포함된 파일만 넣어야 합니다.
        // _reset.scss 같은 실제 스타일 파일은 main.js에서 불러와야 합니다.
        additionalData: `
          @use "@/assets/scss/base/_index.scss" as *;
          @use "@/assets/scss/helpers/_index.scss" as *;
        `,
      },
    },
  },
});

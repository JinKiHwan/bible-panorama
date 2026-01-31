import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';
import Sitemap from 'vite-plugin-sitemap'; // [1] import 추가

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    Sitemap({
      hostname: 'https://bible-panorama.netlify.app',
      exclude: ['/mypage'],
    }),
    VitePWA({
      registerType: 'autoUpdate', // 업데이트 시 자동 새로고침
      includeAssets: ['favicon.ico', 'img/og-image.jpg'], // 캐싱할 정적 파일
      manifest: {
        name: 'Bible Panorama',
        short_name: 'BiblePanorama',
        description: '성경의 흐름을 한눈에 보는 인터랙티브 웹사이트',
        theme_color: '#020617', // 다크 모드 배경색
        background_color: '#020617',
        display: 'standalone', // 브라우저 UI 없이 앱처럼 실행
        start_url: '/',
        icons: [
          {
            src: 'img/icons/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'img/icons/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: 'img/icons/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },
    }),
  ],
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

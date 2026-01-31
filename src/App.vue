<script setup>
import { computed } from 'vue';
import { RouterView, useRoute } from 'vue-router';
import AppHeader from '@/components/AppHeader.vue';
import AppFooter from '@/components/AppFooter.vue';

const route = useRoute();

// home 라우트일 때만 파노라마 모드 활성화 (헤더 스타일 등 분기)
const isPanorama = computed(() => route.name === 'home');
</script>

<template>
  <div class="app-layout">
    <!-- 헤더 전역 배치 -->
    <AppHeader :is-panorama="isPanorama" />

    <!-- 페이지 컨텐츠 -->
    <RouterView v-slot="{ Component }">
      <transition name="page-fade" mode="out-in">
        <component :is="Component" />
      </transition>
    </RouterView>

    <!-- 푸터 전역 배치 -->
    <AppFooter />
  </div>
</template>

<style lang="scss">
/* 전역 레이아웃 스타일 */
.app-layout {
  width: 100%;
  min-height: 100vh;
  position: relative;
  background-color: #020617; /* 기본 배경 */
  color: #f1f5f9;
}

/* 페이지 전환 트랜지션 */
.page-fade-enter-active,
.page-fade-leave-active {
  transition: opacity 0.3s ease;
}

.page-fade-enter-from,
.page-fade-leave-to {
  opacity: 0;
}
</style>

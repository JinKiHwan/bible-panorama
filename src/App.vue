<script setup>
import { ref, computed, onMounted } from 'vue';
import { RouterView, useRoute } from 'vue-router';
import { useHead } from '@vueuse/head'; // [추가] SEO 관리를 위한 훅
import AppHeader from '@/components/AppHeader.vue';
import AppFooter from '@/components/AppFooter.vue';
import IntroOverlay from '@/components/IntroOverlay.vue'; // [추가] 인트로 컴포넌트

const route = useRoute();
const showIntro = ref(true); // 기본적으로 인트로 표시

// [수정] 깜빡임 방지: setup 시점에 동기적으로 localStorage 확인
// 클라이언트 환경(브라우저)인 경우에만 실행하여 빌드 에러 방지
if (typeof window !== 'undefined') {
  const hasVisited = localStorage.getItem('hasVisited');
  if (hasVisited) {
    showIntro.value = false;
  }
}

// [SEO 전역 설정]
// 모든 페이지에 기본적으로 적용될 메타 태그들을 설정합니다.
useHead({
  // 기본 타이틀 설정 (하위 페이지에서 title을 설정하지 않으면 이 값이 나옵니다)
  title: 'Bible Panorama',
  // 타이틀 템플릿: 하위 페이지 타이틀이 있으면 "페이지명 | Bible Panorama" 형태로 표시
  titleTemplate: (title) => (title ? `${title} | Bible Panorama` : 'Bible Panorama - 성경의 흐름을 한눈에'),
  meta: [
    {
      name: 'description',
      content: '창조부터 요한계시록까지, 하나님의 구속사를 인터랙티브 타임라인으로 경험하세요.',
    },
    {
      name: 'keywords',
      content: '창조부터 요한계시록까지, 하나님의 구속사를 인터랙티브 타임라인으로 경험하세요.',
    },
    { name: 'author', content: 'MakeWebWell' },
    // [Open Graph] 카카오톡, 페이스북 공유 시 보여질 정보
    { property: 'og:type', content: 'website' },
    { property: 'og:site_name', content: 'Bible Panorama' },
    { property: 'og:title', content: 'Bible Panorama - 성경의 흐름을 한눈에' },
    { property: 'og:description', content: '창조부터 요한계시록까지, 하나님의 구속사를 인터랙티브 타임라인으로 경험하세요.' },
    // 실제 배포 주소로 변경해주세요. (예: https://bible-panorama.netlify.app/img/og-image.jpg)
    { property: 'og:image', content: 'https://bible-panorama.netlify.app/img/og-image.jpg' },
    { property: 'og:url', content: 'https://bible-panorama.netlify.app' },
    { property: 'og:locale', content: 'ko_KR' },
    // [Twitter]
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: 'Bible Panorama' },
    { name: 'twitter:description', content: '성경 역사를 한눈에 보는 인터랙티브 웹사이트' },
    { name: 'twitter:image', content: 'https://bible-panorama.netlify.app/img/og-image.jpg' },
  ],
  link: [{ rel: 'canonical', href: 'https://bible-panorama.netlify.app' }],
});

// home 라우트일 때만 파노라마 모드 활성화 (헤더 스타일 등 분기)
const isPanorama = computed(() => route.name === 'home');

// [추가] 인트로 닫기 핸들러
const handleEnter = () => {
  showIntro.value = false;
  // 로컬 스토리지에 방문 기록 저장 (재방문 시 인트로 건너뛰기 위함)
  localStorage.setItem('hasVisited', 'true');
};

// onMounted에서의 체크 로직은 setup 단계로 이동했으므로 제거
</script>

<template>
  <div class="app-layout">
    <!-- [추가] 인트로 오버레이 (조건부 렌더링 + 트랜지션) -->
    <transition name="fade">
      <IntroOverlay v-if="showIntro" @enter="handleEnter" />
    </transition>

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
  overflow: hidden;
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

/* 인트로 사라질 때 페이드 효과 */
.fade-leave-active {
  transition: opacity 0.5s ease;
}
.fade-leave-to {
  opacity: 0;
}
</style>

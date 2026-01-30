<script setup>
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';

// Firebase Imports
import { auth } from '@/firebase';
import { onAuthStateChanged } from 'firebase/auth';

// Data & Components Imports
import { erasData } from '@/data/bibleData';
import AppHeader from '@/components/AppHeader.vue';
import MainCard from '@/components/MainCard.vue';
import BookListPanel from '@/components/BookListPanel.vue';

// GSAP 플러그인 등록
gsap.registerPlugin(ScrollTrigger);

// --- State Management ---
const wrapper = ref(null);
const container = ref(null);
const currentEraIndex = ref(0);
const isBooksVisible = ref(false);
const progress = ref(0);
const isNavOpen = ref(false);

const currentUser = ref(null);
const selectedBook = ref(null);
const displayBgUrl = ref('/img/genesis_01.webp');

// 배경 이미지 제어를 위한 ref (GSAP용)
const bgImage = ref(null);

// Data Source
const eras = ref(erasData);
const currentEra = computed(() => eras.value[currentEraIndex.value]);

// --- Actions ---
const toggleNav = () => (isNavOpen.value = !isNavOpen.value);
const toggleBooks = () => (isBooksVisible.value = !isBooksVisible.value);

const selectBook = (book) => {
  selectedBook.value = book;
  isBooksVisible.value = false;
};

const closeBookDetail = () => {
  selectedBook.value = null;
};

// 스크롤 이동 로직
const scrollToEra = (index) => {
  isNavOpen.value = false;
  const isMobile = window.innerWidth < 768;

  if (isMobile) {
    const sections = document.querySelectorAll('.era-section');
    if (sections[index]) {
      sections[index].scrollIntoView({ behavior: 'smooth' });
    }
  } else {
    // 데스크탑: 가로 스크롤 길이 계산 후 이동
    const totalDistance = eras.value.length * 1000;
    const progressRatio = index / (eras.value.length - 1);
    const scrollPos = wrapper.value.offsetTop + progressRatio * totalDistance;
    window.scrollTo({ top: scrollPos, behavior: 'smooth' });
  }
};

// --- Watchers ---
watch(currentEraIndex, () => {
  isBooksVisible.value = false;
  selectedBook.value = null;
});

const activeBgUrl = computed(() => {
  if (selectedBook.value && selectedBook.value.bgURL) {
    return selectedBook.value.bgURL;
  }
  return eras.value[currentEraIndex.value].bgURL || '/img/genesis_01.webp';
});

// 배경 이미지 교체 로직 (GSAP 애니메이션)
watch(activeBgUrl, (newUrl) => {
  if (displayBgUrl.value === newUrl) return;

  const imgLoader = new Image();
  imgLoader.src = newUrl;

  // 배경 요소가 있으면 GSAP로 페이드 아웃 -> 교체 -> 페이드 인
  if (bgImage.value) {
    gsap.killTweensOf(bgImage.value);

    const tl = gsap.timeline();
    tl.to(bgImage.value, { opacity: 0, duration: 0.3, ease: 'power1.out' }).call(() => {
      if (imgLoader.complete) {
        swapAndFadeIn();
      } else {
        imgLoader.onload = swapAndFadeIn;
      }
    });
  } else {
    imgLoader.onload = swapAndFadeIn;
  }

  function swapAndFadeIn() {
    displayBgUrl.value = newUrl;
    // DOM 업데이트 타이밍 확보 후 페이드 인
    setTimeout(() => {
      if (bgImage.value) {
        gsap.to(bgImage.value, { opacity: 0.25, duration: 0.5, ease: 'power1.in' });
      }
    }, 50);
  }
});

// --- Lifecycle ---
const preloadImages = () => {
  eras.value.forEach((era) => {
    if (era.bgURL) {
      const img = new Image();
      img.src = era.bgURL;
    }
  });
};

let mm = gsap.matchMedia();

onMounted(async () => {
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  window.scrollTo(0, 0);

  // 현재 컴포넌트에서도 유저 상태는 추적 (추후 기능 확장 대비)
  onAuthStateChanged(auth, (user) => {
    currentUser.value = user;
  });

  preloadImages();
  displayBgUrl.value = eras.value[0].bgURL || '/img/genesis_01.webp';

  await nextTick();
  const sections = gsap.utils.toArray('.era-section');

  setTimeout(() => {
    window.scrollTo(0, 0);
    currentEraIndex.value = 0;
    ScrollTrigger.refresh();
  }, 100);

  // Desktop Scroll Logic
  mm.add('(min-width: 768px)', () => {
    gsap.to(sections, {
      xPercent: -100 * (sections.length - 1),
      ease: 'none',
      scrollTrigger: {
        trigger: wrapper.value,
        pin: true,
        scrub: 0.1,
        end: `+=${sections.length * 1000}`,
        onUpdate: (self) => {
          progress.value = Math.round(self.progress * 100);
          const index = Math.round(self.progress * (sections.length - 1));
          if (index !== currentEraIndex.value) currentEraIndex.value = index;
        },
      },
    });
  });

  // Mobile Scroll Logic
  mm.add('(max-width: 767px)', () => {
    ScrollTrigger.create({
      trigger: wrapper.value,
      start: 'top top',
      end: 'bottom bottom',
      onUpdate: (self) => {
        progress.value = Math.round(self.progress * 100);
        const totalEras = eras.value.length - 1;
        const newIndex = Math.round(self.progress * totalEras);
        if (newIndex >= 0 && newIndex <= totalEras && newIndex !== currentEraIndex.value) {
          currentEraIndex.value = newIndex;
        }
      },
    });
  });
});

onUnmounted(() => {
  mm.revert();
});
</script>

<template>
  <div class="home-container">
    <AppHeader :is-panorama="true" :is-nav-open="isNavOpen" :progress="progress" :current-era-index="currentEraIndex" :eras="eras" @toggle-nav="toggleNav" @scroll-to-era="scrollToEra" />

    <div class="wrapper" ref="wrapper">
      <div class="horizontal-scroll-container" ref="container">
        <div v-for="(era, index) in eras" :key="'bg-' + era.id" class="era-section" :id="era.bgKeyword" :class="{ active: currentEraIndex === index }">
          <div class="timeline-graphic"><span></span></div>
          <div class="bg-keyword-text">{{ era.bgKeyword }}</div>
          <div class="timeline-dot" :class="era.type"></div>
        </div>
      </div>
    </div>

    <MainCard :current-era="currentEra" :selected-book="selectedBook" :is-books-visible="isBooksVisible" @toggle-books="toggleBooks" @close-book-detail="closeBookDetail" />

    <!-- 배경 이미지 레이어 (GSAP 제어) -->
    <div class="bible_bg">
      <figure ref="bgImage">
        <img :src="displayBgUrl" alt="Background" />
      </figure>
    </div>

    <BookListPanel :is-visible="isBooksVisible" :current-era="currentEra" :selected-book="selectedBook" @close="isBooksVisible = false" @select-book="selectBook" />

    <div v-if="isBooksVisible" @click="isBooksVisible = false" class="overlay"></div>
  </div>
</template>

<style lang="scss" scoped>
@use 'sass:color';

.home-container {
  font-family: 'Noto Sans KR', sans-serif;
  background-color: $bg-color;
  color: $text-primary;
  min-height: 100vh;
  position: relative;
  z-index: 0;
}

.horizontal-scroll-container {
  width: 100%;
  display: flex;
  flex-direction: column;
  height: auto;
  @include desktop {
    width: 500%;
    height: 100vh;
    flex-direction: row;
    flex-wrap: nowrap;
  }
}

.era-section {
  width: 100%;
  height: 100vh;
  position: relative;
  flex-shrink: 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  display: flex;
  align-items: center;
  justify-content: center;

  @include desktop {
    width: 100vw;
    height: 100vh;
    border-bottom: none;
    border-right: 1px solid rgba(255, 255, 255, 0.05);
  }

  .timeline-graphic {
    position: absolute;
    top: 0;
    left: 50%;
    width: 2px;
    height: 100%;
    transform: translateX(-50%);
    background: rgba(255, 255, 255, 0.2);
    @include desktop {
      top: 50%;
      left: 0;
      width: 100%;
      height: 2px;
      transform: translateY(-50%);
    }

    span {
      display: block;
      width: 100%;
      height: 100%;
      position: relative;
      @include mobile {
        display: none;
      }
      &::before {
        content: '';
        display: block;
        width: 70px;
        aspect-ratio: 150/20;
        transform: translateY(-50%);
        border-radius: 50%;
        background-color: $text-primary;
        filter: blur(10px);
        position: absolute;
        animation: move infinite 5s linear;
        visibility: hidden;
        opacity: 0;
        @keyframes move {
          0% {
            left: 0;
          }
          100% {
            left: 100%;
          }
        }
      }
    }
  }

  &.active .timeline-graphic span::before {
    visibility: visible;
    opacity: 1;
  }

  .bg-keyword-text {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-size: 15vw;
    font-weight: 900;
    opacity: 0.1;
    font-family: 'Noto Serif KR', serif;
    white-space: nowrap;
    pointer-events: none;
    letter-spacing: 0.5rem;
    text-transform: uppercase;
    @include desktop {
      font-size: 12vw;
    }
  }

  .timeline-dot {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 1rem;
    height: 1rem;
    border-radius: 50%;
    transform: translate(-50%, -50%);

    z-index: 1;
    &.OT {
      background-color: $ot-color;
      box-shadow: 0 0 20px rgba($ot-color, 0.8);
    }
    &.NT {
      background-color: $nt-color;
      box-shadow: 0 0 20px rgba($nt-color, 0.8);
    }
  }
}

.bible_bg {
  position: fixed;
  width: 100%;
  height: 100%;
  left: 50%;
  top: 50%;
  z-index: -1;
  background-color: $bg-color;
  transform: translate(-50%, -50%);
  figure {
    width: 100%;
    height: 100%;
    position: absolute;
    top: 0;
    left: 0;
    opacity: 0.25; /* 초기 투명도 설정 (GSAP가 제어) */
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      filter: blur(5px);
    }
  }
}

.overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.6);
  z-index: 40;
  backdrop-filter: blur(4px);
  transition: opacity 0.3s;
}
</style>

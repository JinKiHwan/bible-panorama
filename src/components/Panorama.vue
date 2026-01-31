<script setup>
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import { usePanoramaState } from '@/composables/usePanoramaState';

// Firebase Imports
import { auth, db, googleProvider } from '@/firebase';
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { collection, query, where, onSnapshot, setDoc, doc, serverTimestamp } from 'firebase/firestore';

// Data & Components Imports
import MainCard from '@/components/MainCard.vue';
import BookListPanel from '@/components/BookListPanel.vue';
import QuizModal from '@/components/QuizModal.vue';

// GSAP 플러그인 등록
gsap.registerPlugin(ScrollTrigger);

// --- State Management ---
// [변경] 전역 상태 가져오기 (local ref 대체)
const { eras, progress, currentEraIndex, isIntroDone, isNavOpen, registerScrollTrigger } = usePanoramaState();

const wrapper = ref(null);
const container = ref(null);
// const currentEraIndex = ref(0); // [제거] 전역 상태 사용
const isBooksVisible = ref(false);
// const progress = ref(0); // [제거] 전역 상태 사용
// const isNavOpen = ref(false); // [제거] 전역 상태 사용

const currentUser = ref(null);
const selectedBook = ref(null);
const displayBgUrl = ref('/img/genesis_01.webp');
const bgImage = ref(null);

const isQuizOpen = ref(false);
const clearedEras = ref(new Set());

// Data Source
// const eras = ref(erasData); // [제거] 전역 상태 사용
const currentEra = computed(() => eras.value[currentEraIndex.value]);

const isCurrentEraCleared = computed(() => {
  return clearedEras.value.has(currentEra.value.id);
});

// --- Actions ---
const toggleBooks = () => (isBooksVisible.value = !isBooksVisible.value);

const selectBook = (book) => {
  selectedBook.value = book;
  isBooksVisible.value = false;
  subscribeToNotes(book.name);
};

const closeBookDetail = () => {
  selectedBook.value = null;
  if (unsubscribeNotes) unsubscribeNotes();
};

const openQuiz = () => {
  isQuizOpen.value = true;
};
const closeQuiz = () => {
  isQuizOpen.value = false;
};

// [참고] 로그인/로그아웃은 이제 AppHeader에서 수행하므로 여기서 로직 제거
// 단, 클리어 기록 저장/조회를 위해 currentUser 감시는 유지해야 함.

const handleQuizCompleted = async (isSuccess) => {
  if (isSuccess && currentUser.value) {
    const eraId = currentEra.value.id;
    try {
      clearedEras.value.add(eraId);
      const docRef = doc(db, 'cleared_status', `${currentUser.value.uid}_${eraId}`);
      await setDoc(docRef, {
        userId: currentUser.value.uid,
        eraId: eraId,
        eraTitle: currentEra.value.title,
        clearedAt: serverTimestamp(),
      });
      closeQuiz();
    } catch (error) {
      console.error('Quiz Save Error:', error);
      alert('결과 저장 중 오류가 발생했습니다.');
    }
  }
};

// --- Firebase Notes & Clear Status ---
let unsubscribeNotes = null;
let unsubscribeClearStatus = null;

const subscribeToNotes = (bookName) => {
  /* ... 기존 로직 ... */
}; // (기존 코드 유지)

watch(currentUser, (user) => {
  if (unsubscribeClearStatus) unsubscribeClearStatus();
  clearedEras.value.clear();

  if (user) {
    const q = query(collection(db, 'cleared_status'), where('userId', '==', user.uid));
    unsubscribeClearStatus = onSnapshot(q, (snapshot) => {
      const clears = new Set();
      snapshot.forEach((doc) => {
        clears.add(doc.data().eraId);
      });
      clearedEras.value = clears;
    });
  }
});

// --- Scroll Logic ---
const scrollToEra = (index) => {
  isNavOpen.value = false;
  const isMobile = window.innerWidth < 768;
  if (isMobile) {
    const sections = document.querySelectorAll('.era-section');
    if (sections[index]) sections[index].scrollIntoView({ behavior: 'smooth' });
  } else {
    const totalDistance = eras.value.length * 1000;
    const progressRatio = index / (eras.value.length - 1);
    const scrollPos = wrapper.value.offsetTop + progressRatio * totalDistance;
    window.scrollTo({ top: scrollPos, behavior: 'smooth' });
  }
};

// [중요] 스크롤 트리거 함수를 전역 상태에 등록 (헤더에서 호출 가능하게)
registerScrollTrigger(scrollToEra);

// --- Watchers ---
watch(currentEraIndex, () => {
  isBooksVisible.value = false;
  selectedBook.value = null;
  if (unsubscribeNotes) unsubscribeNotes();
});

const activeBgUrl = computed(() => {
  if (selectedBook.value && selectedBook.value.bgURL) {
    return selectedBook.value.bgURL;
  }
  return eras.value[currentEraIndex.value].bgURL || '/img/genesis_01.webp';
});

watch(activeBgUrl, (newUrl) => {
  if (displayBgUrl.value === newUrl) return;
  const imgLoader = new Image();
  imgLoader.src = newUrl;

  // GSAP Fade Animation
  if (bgImage.value) {
    gsap.killTweensOf(bgImage.value);
    const tl = gsap.timeline();
    tl.to(bgImage.value, { opacity: 0, duration: 0.3, ease: 'power1.out' }).call(() => {
      if (imgLoader.complete) swapAndFadeIn();
      else imgLoader.onload = swapAndFadeIn;
    });
  } else {
    imgLoader.onload = swapAndFadeIn;
  }

  function swapAndFadeIn() {
    displayBgUrl.value = newUrl;
    setTimeout(() => {
      if (bgImage.value) gsap.to(bgImage.value, { opacity: 0.25, duration: 0.5, ease: 'power1.in' });
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

  // Desktop
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
          // [중요] 전역 상태 업데이트
          progress.value = Math.round(self.progress * 100);
          const index = Math.round(self.progress * (sections.length - 1));
          if (index !== currentEraIndex.value) currentEraIndex.value = index;
        },
      },
    });
  });

  // Mobile
  mm.add('(max-width: 767px)', () => {
    ScrollTrigger.create({
      trigger: wrapper.value,
      start: 'top top',
      end: 'bottom bottom',
      onUpdate: (self) => {
        // [중요] 전역 상태 업데이트
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
  if (unsubscribeClearStatus) unsubscribeClearStatus();
  if (unsubscribeNotes) unsubscribeNotes();
});
</script>

<template>
  <div class="home-container">
    <!-- 헤더 제거됨 (App.vue에 존재) -->

    <div class="wrapper" ref="wrapper">
      <div class="horizontal-scroll-container" ref="container">
        <div v-for="(era, index) in eras" :key="'bg-' + era.id" class="era-section" :id="era.bgKeyword" :class="{ active: currentEraIndex === index }">
          <div class="timeline-graphic">
            <span :class="{ 'active-anim': isIntroDone }">
              <i></i>
            </span>
          </div>
          <div class="bg-keyword-text">{{ era.bgKeyword }}</div>
          <div class="timeline-dot" :class="era.type"></div>
        </div>
      </div>
    </div>

    <!-- MainCard -->
    <MainCard :current-era="currentEra" :selected-book="selectedBook" :is-books-visible="isBooksVisible" :current-user="currentUser" :is-cleared="isCurrentEraCleared" @toggle-books="toggleBooks" @close-book-detail="closeBookDetail" @start-quiz="openQuiz" />

    <div class="bible_bg">
      <figure ref="bgImage">
        <img :src="displayBgUrl" alt="Background" />
      </figure>
    </div>

    <BookListPanel :is-visible="isBooksVisible" :current-era="currentEra" :selected-book="selectedBook" @close="isBooksVisible = false" @select-book="selectBook" />

    <transition name="fade">
      <QuizModal v-if="isQuizOpen" :questions="currentEra.quiz || []" :era-title="currentEra.title" @close="closeQuiz" @quiz-completed="handleQuizCompleted" />
    </transition>

    <div v-if="isBooksVisible" @click="isBooksVisible = false" class="overlay"></div>
  </div>
</template>

<style lang="scss" scoped>
/* 제공해주신 스타일 그대로 유지 */
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

      &.active-anim {
        i {
          animation: move infinite 5s linear;
        }
      }
      i {
        display: block;
        width: 70px;
        aspect-ratio: 150/20;
        transform: translateY(-50%);
        border-radius: 50%;
        background-color: $text-primary;
        filter: blur(10px);
        position: absolute;
        //animation: move infinite 5s linear;
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

  &.active .timeline-graphic span i {
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
    opacity: 0.05;
    font-family: 'Noto Serif KR', serif;
    white-space: nowrap;
    pointer-events: none;
    letter-spacing: 0.5rem;
    text-transform: uppercase;
    color: $text-primary;
    transition: all 0.8s ease-out;
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
    box-shadow: 0 0 20px rgba(255, 255, 255, 0.5);
    z-index: 1;
    transition: all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    &.OT {
      background-color: $ot-color;
      box-shadow: 0 0 15px $ot-color;
    }
    &.NT {
      background-color: $nt-color;
      box-shadow: 0 0 15px $nt-color;
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
    opacity: 0.25;
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      filter: blur(5px);
      position: absolute;
      top: 0;
      left: 0;
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

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>

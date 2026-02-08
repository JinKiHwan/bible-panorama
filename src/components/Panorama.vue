<script setup>
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';

// [중요] 전역 상태 사용
import { usePanoramaState } from '@/composables/usePanoramaState';

// Firebase Imports
import { auth, db } from '@/firebase';
import { onAuthStateChanged } from 'firebase/auth';
// [수정] DB 저장에 필요한 increment, arrayUnion 추가 import
import { collection, query, where, onSnapshot, setDoc, doc, serverTimestamp, increment, arrayUnion } from 'firebase/firestore';

// Components Imports
import MainCard from '@/components/MainCard.vue';
import BookListPanel from '@/components/BookListPanel.vue';
import QuizModal from '@/components/QuizModal.vue';
import VideoModal from '@/components/VideoModal.vue';
import TutorialOverlay from '@/components/TutorialOverlay.vue';

// GSAP 플러그인 등록
gsap.registerPlugin(ScrollTrigger);

// --- State Management ---
// 전역 상태 가져오기
const { eras, progress, currentEraIndex, isNavOpen, registerScrollTrigger, isIntroDone } = usePanoramaState();

const wrapper = ref(null);
const isBooksVisible = ref(false);

const currentUser = ref(null);
const selectedBook = ref(null);
const displayBgUrl = ref('/img/genesis_01.webp');
const bgImage = ref(null);

// 퀴즈 관련 상태
const isQuizOpen = ref(false);
const activeQuizList = ref([]); // [추가] 실제 풀게 될 5문제 리스트
const clearedEras = ref(new Set()); // 클리어한 시대 ID 목록
const eraProgressMap = ref(new Map()); // [추가] 시대별 진행 상황 (푼 문제 관리용)

// 영상 모달 관련 상태
const isVideoOpen = ref(false);
const currentVideoId = ref('');

// 튜토리얼 모달 상태
const showTutorial = ref(false);

const currentEra = computed(() => eras.value[currentEraIndex.value]);

// 현재 시대 클리어 횟수 (MainCard 전달용)
const currentEraClearCount = computed(() => {
  const progress = eraProgressMap.value.get(currentEra.value.id);
  return progress ? progress.clearCount : 0;
});

// 최소 1회 이상 클리어 여부
const isCurrentEraCleared = computed(() => currentEraClearCount.value > 0);

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

// [수정] 퀴즈 열기 (랜덤 출제 로직 적용)
const openQuiz = () => {
  if (!currentEra.value.quiz || currentEra.value.quiz.length === 0) {
    alert('준비된 문제가 없습니다.');
    return;
  }

  // 1. 현재 시대의 모든 문제
  const allQuizzes = currentEra.value.quiz;

  // 2. 내가 이미 푼 문제 ID 목록 가져오기
  const myProgress = eraProgressMap.value.get(currentEra.value.id);
  const solvedIds = myProgress ? myProgress.solvedIds : [];

  // 3. 안 푼 문제 필터링
  const unsolvedQuizzes = allQuizzes.filter((q) => !solvedIds.includes(q.id));

  let targetPool = [];
  // 4. 문제가 부족하면(다 풀었거나 5개 미만 남음) 전체에서, 충분하면 안 푼 문제에서 출제
  if (unsolvedQuizzes.length < 5) {
    targetPool = [...allQuizzes]; // 전체 문제 풀 사용 (복습)
  } else {
    targetPool = [...unsolvedQuizzes]; // 안 푼 문제 풀 사용
  }

  // 5. 랜덤 5문제 추출
  const shuffled = targetPool.sort(() => 0.5 - Math.random());
  activeQuizList.value = shuffled.slice(0, 5);

  isQuizOpen.value = true;
};

const closeQuiz = () => {
  isQuizOpen.value = false;
};

// [수정] 퀴즈 만점(성공) 시 DB 저장 로직 (user_progress 컬렉션 사용)
const handleQuizCompleted = async (isSuccess) => {
  if (isSuccess && currentUser.value) {
    const eraId = currentEra.value.id;
    // 이번에 푼 문제들의 ID 추출
    const solvedIdsInThisSession = activeQuizList.value.map((q) => q.id);

    // [수정] DB 업데이트 전 현재 횟수를 미리 저장 (리스너에 의한 중복 카운트 방지)
    const previousCount = eraProgressMap.value.get(eraId)?.clearCount || 0;

    try {
      // 문서 ID: 유저ID_시대ID
      const docRef = doc(db, 'user_progress', `${currentUser.value.uid}_${eraId}`);

      // merge: true 옵션으로 문서가 없으면 생성, 있으면 업데이트
      await setDoc(
        docRef,
        {
          userId: currentUser.value.uid,
          eraId: eraId,
          eraTitle: currentEra.value.title,
          clearCount: increment(1), // 클리어 횟수 1 증가
          solvedQuizIds: arrayUnion(...solvedIdsInThisSession), // 푼 문제 ID 추가 (중복 자동 제거)
          lastClearedAt: serverTimestamp(),
        },
        { merge: true },
      );

      closeQuiz();

      // [수정] 미리 저장해둔 횟수에 1을 더해 표시
      alert(`축하합니다! 퀴즈를 모두 맞추셨습니다. 🏅 (누적 ${previousCount + 1}회)`);
    } catch (error) {
      console.error('Quiz Save Error:', error);
      alert(`결과 저장 중 오류가 발생했습니다.\n(${error.message})`);
    }
  }
};

// [수정] 영상 모달 열기
const openVideo = (type) => {
  const videoId = currentEra.value.videos?.[type];
  if (videoId) {
    currentVideoId.value = videoId;
    isVideoOpen.value = true;
  } else {
    alert('준비 중인 영상입니다. 😅');
  }
};

const closeVideo = () => {
  isVideoOpen.value = false;
  currentVideoId.value = '';
};

// 튜토리얼 닫기 핸들러
const closeTutorial = () => {
  showTutorial.value = false;
};

// --- Firebase Listeners ---
let unsubscribeNotes = null;
let unsubscribeProgress = null; // 이름 변경: ClearStatus -> Progress
const noteText = ref('');
const bookNotes = ref([]);
const isNoteLoading = ref(false);

const subscribeToNotes = (bookName) => {
  if (unsubscribeNotes) unsubscribeNotes();
  bookNotes.value = [];
  if (!currentUser.value || !bookName) return;

  isNoteLoading.value = true;
  const q = query(collection(db, 'meditations'), where('userId', '==', currentUser.value.uid), where('bookName', '==', bookName), orderBy('createdAt', 'desc'));

  unsubscribeNotes = onSnapshot(
    q,
    (snapshot) => {
      bookNotes.value = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      isNoteLoading.value = false;
    },
    (error) => {
      console.error('Data Fetch Error:', error);
      isNoteLoading.value = false;
    },
  );
};

const saveNote = async () => {
  if (!noteText.value.trim() || !currentUser.value || !selectedBook.value) return;
  try {
    await addDoc(collection(db, 'meditations'), {
      userId: currentUser.value.uid,
      userName: currentUser.value.displayName,
      bookName: selectedBook.value.name,
      content: noteText.value,
      createdAt: serverTimestamp(),
    });
    noteText.value = '';
  } catch (error) {
    console.error('Save Error:', error);
    alert('저장 중 오류가 발생했습니다.');
  }
};

const deleteNote = async (noteId) => {
  if (!confirm('정말 삭제하시겠습니까?')) return;
  try {
    await deleteDoc(doc(db, 'meditations', noteId));
  } catch (error) {
    console.error('Delete Error:', error);
  }
};

// [수정] 유저 진행 상황(Progress) 구독 - user_progress 컬렉션
watch(currentUser, (user) => {
  if (unsubscribeProgress) unsubscribeProgress();
  eraProgressMap.value.clear();
  clearedEras.value.clear();

  if (user) {
    const q = query(collection(db, 'user_progress'), where('userId', '==', user.uid));

    unsubscribeProgress = onSnapshot(q, (snapshot) => {
      const newMap = new Map();
      const clears = new Set();

      snapshot.forEach((doc) => {
        const data = doc.data();
        newMap.set(data.eraId, {
          clearCount: data.clearCount || 0,
          solvedIds: data.solvedQuizIds || [],
        });

        // 1회 이상 클리어 시 클리어 목록에 추가
        if ((data.clearCount || 0) > 0) {
          clears.add(data.eraId);
        }
      });

      eraProgressMap.value = newMap;
      clearedEras.value = clears; // MainCard isCurrentEraCleared 계산용
    });
  }
});

// --- Scroll Logic ---
const scrollToEra = (index) => {
  isNavOpen.value = false;
  const isMobile = window.innerWidth < 768;

  if (isMobile) {
    const sections = document.querySelectorAll('.era-section');
    if (sections[index]) {
      sections[index].scrollIntoView({ behavior: 'smooth' });
    }
  } else {
    const totalDistance = eras.value.length * 1000;
    const progressRatio = index / (eras.value.length - 1);
    const scrollPos = wrapper.value.offsetTop + progressRatio * totalDistance;
    window.scrollTo({ top: scrollPos, behavior: 'smooth' });
  }
};

// 헤더에서 호출할 수 있도록 함수 등록
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

// 배경 이미지 교체 로직 (GSAP 애니메이션)
watch(activeBgUrl, (newUrl) => {
  if (displayBgUrl.value === newUrl) return;
  const imgLoader = new Image();
  imgLoader.src = newUrl;

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

  if (typeof window !== 'undefined') {
    const hasSeenTutorial = localStorage.getItem('hasSeenTutorial');
    if (!hasSeenTutorial) {
      showTutorial.value = true;
    }
  }

  // Panorama 컴포넌트에서도 유저 정보를 알아야 함 (DB 저장용)
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
  // [수정] 컴포넌트 해제 시 스크롤 위치 초기화 및 리스너 해제 수정
  mm.revert();
  ScrollTrigger.getAll().forEach((t) => t.kill());
  window.scrollTo(0, 0);

  // [수정] 없는 변수 제거, 올바른 구독 변수 해제
  if (unsubscribeNotes) unsubscribeNotes();
  if (unsubscribeProgress) unsubscribeProgress();
});
</script>

<template>
  <div class="home-container">
    <!-- 헤더는 App.vue에서 관리됨 -->

    <div class="wrapper" ref="wrapper">
      <div class="horizontal-scroll-container" ref="container">
        <div v-for="(era, index) in eras" :key="'bg-' + era.id" class="era-section" :id="era.bgKeyword" :class="{ active: currentEraIndex === index }">
          <div class="timeline-graphic"><span :class="{ 'active-anim': isIntroDone }"></span></div>
          <div class="bg-keyword-text">{{ era.bgKeyword }}</div>
          <div class="timeline-dot" :class="era.type"></div>
        </div>
      </div>
    </div>

    <!-- MainCard: Props 업데이트 (clearCount 전달) -->
    <MainCard
      :current-era="currentEra"
      :selected-book="selectedBook"
      :is-books-visible="isBooksVisible"
      :current-user="currentUser"
      :is-cleared="isCurrentEraCleared"
      :clear-count="currentEraClearCount"
      :book-notes="bookNotes"
      :is-note-loading="isNoteLoading"
      @toggle-books="toggleBooks"
      @close-book-detail="closeBookDetail"
      @start-quiz="openQuiz"
      @open-video="openVideo"
      @save-note="saveNote"
      @delete-note="deleteNote"
      @update-note-text="(text) => (noteText = text)"
    />

    <div class="bible_bg">
      <figure ref="bgImage">
        <img :src="displayBgUrl" alt="Background" />
      </figure>
    </div>

    <BookListPanel :is-visible="isBooksVisible" :current-era="currentEra" :selected-book="selectedBook" @close="isBooksVisible = false" @select-book="selectBook" />

    <!-- 퀴즈 모달 -->
    <transition name="fade">
      <QuizModal v-if="isQuizOpen" :questions="activeQuizList" :era-title="currentEra.title" @close="closeQuiz" @quiz-completed="handleQuizCompleted" />
    </transition>

    <!-- 영상 모달 -->
    <transition name="fade">
      <VideoModal v-if="isVideoOpen" :video-id="currentVideoId" @close="closeVideo" />
    </transition>
    <div v-if="isBooksVisible" @click="isBooksVisible = false" class="overlay"></div>

    <transition name="fade">
      <TutorialOverlay v-if="showTutorial" @close="closeTutorial" />
    </transition>
  </div>
</template>

<style lang="scss" scoped>
@use 'sass:color';

/* 색상 변수 정의 */
.home-container {
  font-family: 'Noto Sans KR', sans-serif;
  background-color: $bg-color;
  color: $text-primary;
  min-height: 100vh;
  position: relative;
  z-index: 0;
  transition:
    background-color 0.3s,
    color 0.3s;

  .light & {
    background-color: $bg-light-color;
    color: $text-light-primary;
  }
}

.serif {
  font-family: 'Noto Serif KR', serif;
}

/* Header */
.header-bar {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 40;
  padding: 1rem 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  mix-blend-mode: difference;
  color: white;

  @include mobile {
    mix-blend-mode: normal;
  }

  .logo {
    font-size: 1.25rem;
    font-weight: 700;
    font-family: 'Noto Serif KR', serif;
    @include mobile {
      font-size: 16px;
    }

    a {
      background-image: url('/img/common/gradient.webp');
      background-repeat: no-repeat;
      background-position: center center;
      background-size: cover;
      background-clip: text;
      -webkit-background-clip: text;
      color: transparent;
    }
  }

  .header-controls {
    display: flex;
    align-items: center;
    gap: 1rem;
    position: fixed;
    left: calc(50% + 50px);
    transform: translateX(-50%);
    @include mobile {
      left: calc(50%);
      bottom: 2rem;
    }

    .progress-track {
      height: 0.25rem;
      width: 8rem;
      background-color: #374151; /* gray-700 */
      border-radius: 9999px;
      overflow: hidden;

      @include mobile {
        width: 70vw;
      }

      .progress-fill {
        height: 100%;
        // background-color: white;
        background: url('/img/common/gradient.webp') no-repeat center center/cover;
        transition: width 0.3s;
      }
    }

    .step-indicator {
      font-size: 0.75rem;

      @include mobile {
        font-size: 12px;
      }
    }
  }

  .nav-toggle-btn {
    font-size: 1rem;

    @include mobile {
      font-size: 12px;
    }
  }

  /* 네비게이션 메뉴 스타일 */
  .main-nav {
    position: fixed;
    top: 60px; /* 헤더 높이만큼 띄움 */
    right: 1.5rem;
    width: 240px;
    background: #1e293b;
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 1rem;
    padding: 1rem;
    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.5);
    z-index: 55;
    max-height: calc(100vh - 80px);
    overflow-y: auto;

    @include mobile {
      top: 45px;
      background: rgba($color: #1e293b, $alpha: 0.9);
    }

    ul {
      list-style: none;
      padding: 0;
      margin: 0;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;

      li {
        a {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem;
          color: $text-secondary;
          text-decoration: none;
          border-radius: 0.5rem;
          transition: all 0.2s;

          &:hover {
            background: rgba(255, 255, 255, 0.05);
            color: white;
          }

          .nav-idx {
            font-family: monospace;
            font-size: 0.75rem;
            color: $text-muted;

            @include mobile {
              font-size: 12px;
            }
          }

          .nav-title {
            font-weight: 500;
            font-size: 0.875rem;

            @include mobile {
              font-size: 14px;
            }
          }
        }

        &.active.OT a {
          background-color: rgba($ot-color, 0.2);
          color: color.adjust($ot-color, $lightness: 20%);

          .nav-idx {
            color: rgba($ot-color, 0.7);
          }
        }
        &.active.NT a {
          background-color: rgba($nt-color, 0.2);
          color: color.adjust($nt-color, $lightness: 20%);
          .nav-idx {
            color: rgba($nt-color, 0.7);
          }
        }
      }
    }
  }
}

/* Nav Transition */
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.3s ease-out;
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateY(-10px);
  opacity: 0;
}

/* Scroll Section */
.wrapper {
  /* ScrollTrigger 핀 고정을 위한 래퍼 */
}

/* 반응형 스크롤 컨테이너 설정 */
.horizontal-scroll-container {
  /* 모바일 (기본): 세로 스크롤 */
  width: 100%;
  display: flex;
  flex-direction: column;
  height: auto;

  /* 데스크탑: 가로 스크롤 */
  @media (min-width: 768px) {
    width: 500%; /* JS에서 length에 따라 계산되지만 기본값 설정 */
    height: 100vh;
    flex-direction: row;
    flex-wrap: nowrap;
  }
}

.era-section {
  /* 모바일: 화면 전체 높이로 세로 배치 */
  width: 100%;
  height: 100vh;
  position: relative;
  flex-shrink: 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05); /* 모바일은 아래쪽 경계 */
  //overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;

  /* 데스크탑 */
  @media (min-width: 768px) {
    width: 100vw; /* 가로 스크롤 시 한 화면 너비 */
    height: 100vh;
    border-bottom: none;
    border-right: 1px solid rgba(255, 255, 255, 0.05);
  }

  .timeline-graphic {
    position: absolute;
    /* 모바일: 세로 선 */
    top: 0;
    left: 50%;
    width: 2px;
    height: 100%;
    transform: translateX(-50%);
    background: rgba(255, 255, 255, 0.2);

    .light & {
      background: rgba(106, 106, 106, 0.2);
    }

    /* 데스크탑: 가로 선 */
    @media (min-width: 768px) {
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
        visibility: hidden;
        opacity: 0;

        .light & {
          background-color: rgba(#1e293b, 0.2);
        }

        @keyframes move {
          0% {
            left: 0;
          }
          100% {
            left: 100%;
          }
        }
      }

      &.active-anim {
        &::before {
          visibility: visible;
          opacity: 1;
          animation: move infinite 5s linear;
        }
      }
    }
  }

  &.active {
    .timeline-graphic {
      span {
        &::before {
          visibility: visible;
          opacity: 1;
        }
      }
    }
  }

  .bg-keyword-text {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-size: 10vw; /* 모바일에서 더 크게 */
    font-weight: 900;
    opacity: 0.1;
    font-family: 'Noto Serif KR', serif;
    white-space: nowrap;
    pointer-events: none;
    letter-spacing: 0.5rem;
    text-transform: uppercase;

    /* 모바일에서는 텍스트가 세로로 겹치지 않게 회전시킬 수도 있음 */
    @include mobile {
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
    box-shadow: 0 0 20px rgba(255, 255, 255, 0.8);
    z-index: 1;

    &.OT {
      background-color: $ot-color;
    }
    &.NT {
      background-color: $nt-color;
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

/* Transitions */
.fade-enter-active,
.fade-leave-active {
  transition:
    opacity 0.5s ease,
    transform 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(20px);
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
  transition: background-color 0.3s;

  .light & {
    background-color: $bg-light-color;
  }

  figure {
    width: 100%;
    height: 100%;
    position: absolute; /* 절대 위치로 겹쳐지게 */
    top: 0;
    left: 0;
    opacity: 0.25;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      filter: blur(5px);
    }
  }
}
</style>

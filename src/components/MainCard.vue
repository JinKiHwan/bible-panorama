<script setup>
import { computed, ref, watch } from 'vue';

const props = defineProps({
  currentEra: Object,
  selectedBook: Object,
  isBooksVisible: Boolean,
  currentUser: Object,
  isCleared: Boolean,
});

const emit = defineEmits(['toggleBooks', 'closeBookDetail', 'startQuiz', 'openVideo']);

const isBookDetail = computed(() => !!props.selectedBook);
const currentItem = computed(() => props.selectedBook || props.currentEra);

// 퀴즈 데이터 유무 확인
const hasQuiz = computed(() => {
  return !isBookDetail.value && props.currentEra.quiz && props.currentEra.quiz.length > 0;
});

// 이미지 로딩 상태 관리
const isLoading = ref(true);

const handleImageLoad = () => {
  isLoading.value = false;
};

// 아이템(시대 또는 책)이 바뀌면 로딩 상태 리셋
watch(currentItem, () => {
  isLoading.value = true;
});

// 히든(심화) 영상 클릭 핸들러
const handleHiddenVideo = () => {
  if (props.isCleared) {
    emit('openVideo', 'deep');
  } else {
    alert("이 영상을 보려면 퀴즈를 통과해야 합니다! 🔒");
  }
};

// [수정] 퀴즈 버튼 클릭 핸들러
const handleQuizClick = () => {
  // 로그인하지 않은 경우 알림
  if (!props.currentUser) {
    alert("로그인이 필요한 서비스입니다.");
    return;
  }
  // 로그인되어 있으면 퀴즈 시작
  emit('startQuiz');
};
</script>

<template>
  <div class="fixed-content-layer">
    <transition name="fade" mode="out-in">
      <div :key="isBookDetail ? 'book-' + currentItem.name : 'era-' + currentItem.id" class="main-card" :class="[currentEra.type, { 'book-detail-card': isBookDetail }, { success: !isBookDetail && isCleared }]">
        <!-- 닫기 버튼 -->
        <button v-if="isBookDetail" class="detail-close-btn" @click="$emit('closeBookDetail')">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        <div class="main-card_visual">
          <figure class="mobile-only-img">
            <!-- 스켈레톤 로더 -->
            <div v-if="isLoading" class="skeleton-loader"></div>
            
            <!-- 이미지 -->
            <img 
              :src="currentItem.bgURL || '/img/genesis_01.png'" 
              alt="" 
              @load="handleImageLoad"
              :class="{ 'hidden': isLoading }"
            />
          </figure>

          <!-- 시대 정보일 때만 영상 버튼 표시 -->
          <div v-if="!isBookDetail" class="video-controls">
            <button class="vid-btn intro" @click="$emit('openVideo', 'intro')" title="시대 개요 영상">
              <span class="icon">▶</span>
              <span class="label">Intro</span>
            </button>
            
            <button class="vid-btn deep" :class="{ locked: !isCleared }" @click="handleHiddenVideo" title="심화 강의 영상">
              <span class="icon">{{ isCleared ? '▶' : '🔒' }}</span>
              <span class="label">Deep</span>
            </button>
          </div>
        </div>

        <div class="card-header">
          <div class="main-bible-badge" :class="currentEra.type">
            <span class="icon">📖</span>
            <span v-if="isBookDetail">{{ currentItem.category }}</span>
            <span v-else>중심 역사서: {{ currentItem.mainStream }}</span>
          </div>
          <span class="era-type" :class="currentEra.type">
            {{ isBookDetail ? 'Related Book' : currentEra.type === 'OT' ? 'Old Testament' : 'New Testament' }}
          </span>
        </div>

        <div class="title-area">
          <h2>
            {{ isBookDetail ? currentItem.name : currentItem.title }}
            <span v-if="!isBookDetail && isCleared" class="clear-badge">🏅 CLEAR</span>
          </h2>
          <p>{{ isBookDetail ? currentEra.title + ' 시대 배경' : currentItem.subtitle }}</p>
        </div>

        <div class="description" :class="{ 'book-desc': isBookDetail }">
          {{ isBookDetail ? currentItem.desc : currentItem.detail }}
        </div>

        <!-- 시대 정보일 때만 표시되는 인물 태그 -->
        <div v-if="!isBookDetail" class="key-figures">
          <h4>Key Figures</h4>
          <div class="tags">
            <span v-for="char in currentItem.characters" :key="char" class="tag">
              {{ char }}
            </span>
          </div>
        </div>

        <!-- 하단 액션 버튼 -->
        <div v-if="!isBookDetail" class="action-area">
          <!-- [수정] 퀴즈 버튼 -->
          <!-- 1. !isCleared: 클리어하지 않았을 때만 보임 (클리어하면 사라짐) -->
          <!-- 2. hasQuiz: 퀴즈 데이터가 있을 때만 보임 -->
          <!-- 3. @click: handleQuizClick 함수 호출 (비로그인 체크) -->
          <button v-if="hasQuiz" class="quiz-btn" @click="handleQuizClick">🎯 퀴즈 도전</button>

          <button @click="$emit('toggleBooks')" class="books-btn" :class="currentEra.type">
            <span>
              <span v-if="currentEra.relatedBooks.length > 0">함께 읽는 성경 ({{ currentEra.relatedBooks.length }}권)</span>
              <span v-else>관련 성경 없음</span>
            </span>
            <svg :class="{ 'rotate-180': isBooksVisible }" class="arrow-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
            </svg>
          </button>
        </div>

        <div v-else class="mt-4"></div>
      </div>
    </transition>
  </div>
</template>

<style lang="scss" scoped>
@use 'sass:color';

.fixed-content-layer {
  position: fixed;
  top: 0;
  left: 0;
  max-width: 100vw;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
}

.main-card {
  pointer-events: auto;
  width: 90%;
  max-width: 650px;
  backdrop-filter: blur(16px);
  border: 1px solid $border-color;
  border-radius: 1.5rem;
  padding: 2.5rem;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  position: relative;
  overflow: hidden;
  z-index: 0;
  @include mobile {
    width: 95%;
    padding: 2rem;
    gap: 1rem;
    max-height: 80vh;
    margin-bottom: 5vh;
  }

  /* 성공(Clear) 상태 스타일 */
  &.success {
    border-color: #fbbf24;
    box-shadow:
      0 0 30px rgba(251, 191, 36, 0.2),
      0 25px 50px -12px rgba(0, 0, 0, 0.5);
  }

  &.book-detail-card {
    max-height: 80vh;
    @include mobile {
      max-height: 75vh;
    }
  }

  /* 네온 및 배경 스타일 */
  &::after {
    content: '';
    position: absolute;
    z-index: -2;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: conic-gradient(transparent, rgba($ot-color, 0.5), transparent 30%);
    animation: rotate 4s linear infinite;
    pointer-events: none;
    transition: all 0.25s;
  }
  &::before {
    content: '';
    position: absolute;
    inset: 1px;
    background: linear-gradient(180deg, rgba(0, 0, 0, 1) 0%, #212121 100%);
    border-radius: inherit;
    z-index: -1;
  }

  &.NT::after {
    background: conic-gradient(transparent, rgba($nt-color, 0.5), transparent 30%);
  }

  /* 성공 시 네온 색상 */
  &.success::after {
    background: conic-gradient(transparent, rgba(251, 191, 36, 0.8), transparent 30%);
  }

  @keyframes rotate {
    100% {
      transform: rotate(1turn);
    }
  }

  .detail-close-btn {
    position: absolute;
    top: 0.5rem;
    right: 0.5rem;
    background: transparent;
    border: none;
    color: rgba(255, 255, 255, 0.5);
    cursor: pointer;
    transition: color 0.3s;
    width: 2rem;
    aspect-ratio: 1/1;
    z-index: 20;
    @include mobile {
      width: 4rem;
      background: rgba($color: #000, $alpha: 1);
      padding: 0.25rem;
      border-radius: 0.75rem;
    }
    &:hover {
      color: white;
    }
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    @include mobile {
      align-items: center;
    }
    .main-bible-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.25rem 0.75rem;
      border-radius: 9999px;
      font-size: 0.875rem;
      font-weight: 600;
      background: rgba(255, 255, 255, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.2);
      color: white;
      @include mobile {
        font-size: 14px;
        padding: 0.5rem 1rem;
      }
      &.OT {
        background-color: rgba($ot-color, 0.2);
        color: color.adjust($ot-color, $lightness: 20%);
        border-color: rgba($ot-color, 0.3);
      }
      &.NT {
        background-color: rgba($nt-color, 0.2);
        color: color.adjust($nt-color, $lightness: 20%);
        border-color: rgba($nt-color, 0.3);
      }
    }
    .era-type {
      font-size: 0.75rem;
      font-weight: 700;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      margin-top: 0.25rem;
      @include mobile {
        font-size: 10px;
      }
      &.OT {
        color: color.adjust($ot-color, $lightness: 10%);
      }
      &.NT {
        color: color.adjust($nt-color, $lightness: 10%);
      }
    }
  }

  .title-area {
    @include mobile {
      margin-bottom: 0.875rem;
    }
    h2 {
      font-size: 2.5rem;
      font-weight: 700;
      font-family: 'Noto Serif KR', serif;
      color: white;
      margin: 0 0 0.5rem 0;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      flex-wrap: wrap;
      @include mobile {
        font-size: 22px;
        margin-bottom: 10px;
      }
      .clear-badge {
        font-size: 1rem;
        background: #fbbf24;
        color: #000;
        padding: 0.2rem 0.5rem;
        border-radius: 0.3rem;
        vertical-align: middle;
        font-family: 'Noto Sans KR', sans-serif;
        @include mobile {
          font-size: 12px;
        }
      }
    }
    p {
      font-size: 1.125rem;
      color: color.adjust($accent-color, $lightness: 25%);
      font-weight: 500;
      margin: 0;
      @include mobile {
        font-size: 14px;
      }
    }
  }

  .description {
    color: #cbd5e1;
    line-height: 1.625;
    font-size: 1rem;
    border-left: 2px solid rgba(255, 255, 255, 0.1);
    padding-left: 1rem;
    padding-top: 0.25rem;
    padding-bottom: 0.25rem;
    @include mobile {
      font-size: 14px;
      line-height: 1.5;
      max-height: 100px;
      overflow-y: auto;
      margin-bottom: 0.5rem;
    }
    &.book-desc {
      max-height: 200px;
      @include mobile {
        max-height: 150px;
      }
    }
  }

  .key-figures {
    h4 {
      font-size: 0.75rem;
      color: $text-muted;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      margin: 0 0 0.5rem 0;
      @include mobile {
        font-size: 14px;
        margin-bottom: 0.5rem;
      }
    }
    .tags {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      .tag {
        padding: 0.25rem 0.75rem;
        background-color: #1e293b;
        border-radius: 0.5rem;
        font-size: 0.75rem;
        color: #cbd5e1;
        border: 1px solid #334155;
        @include mobile {
          font-size: 14px;
        }
      }
    }
  }

  .action-area {
    padding-top: 1rem;
    margin-top: 0.5rem;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    display: flex;
    justify-content: center;
    gap: 0.75rem;
    flex-wrap: wrap;

    @include mobile {
      flex-direction: row-reverse;
    }

    .quiz-btn {
      padding: 0.75rem 1.5rem;
      border-radius: 0.75rem;
      background: #eab308;
      color: #000;
      font-weight: 700;
      border: none;
      cursor: pointer;
      transition: all 0.2s;
      display: flex;
      align-items: center;
      justify-content: center;
      &:hover {
        background: #facc15;
        transform: translateY(-2px);
      }
      @include mobile {
        font-size: 14px;
      }
    }

    .books-btn {
      flex: 1;
      width: auto;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.75rem;
      padding: 0.75rem 2rem;
      border-radius: 0.75rem;
      background: linear-gradient(to right, $ot-color, #047a8f);
      color: $text-primary;
      font-weight: 600;
      transition: all 0.3s;
      box-shadow: 0 10px 15px -3px rgba($ot-color, 0.25);
      border: none;
      cursor: pointer;
      &:hover {
        background: linear-gradient(to right, color.adjust($ot-color, $lightness: -5%), color.adjust(#047a8f, $lightness: -5%));
      }
      &.NT {
        background: linear-gradient(to right, $nt-color, #9f2a3d);
        box-shadow: 0 10px 15px -3px rgba($nt-color, 0.25);
        &:hover {
          background: linear-gradient(to right, color.adjust($nt-color, $lightness: -5%), color.adjust(#9f2a3d, $lightness: -5%));
        }
      }
      @include mobile {
        width: 100%;
        font-size: 14px;
        padding: 1.5rem 0;
      }
      .arrow-icon {
        width: 1rem;
        height: auto;
        aspect-ratio: 1/1;
        transition: transform 0.3s;
        @include mobile {
          width: 2rem;
        }
        &.rotate-180 {
          transform: rotate(180deg);
        }
      }
    }
  }
}

/* [추가] 새로 추가된 비주얼 및 영상 버튼 스타일 */
.main-card_visual {
  position: relative;
  width: 100%;
  margin-bottom: 1rem;
  border-radius: 0.5rem;
  overflow: hidden;

  /* 비주얼 이미지 (모바일용 이미지가 데스크탑에서도 카드의 비주얼로 사용됨) */
    .mobile-only-img {
      width: 100%;
      //min-height: 100px;
      height: auto;
      //max-height: 200px;
      object-fit: cover;
      margin: 0;
      position: relative; /* 스켈레톤 포지셔닝을 위해 */
      background-color: #1e293b; /* 로딩 전 배경색 */

      // @include mobile{
      //   //min-height: 150px;
      // }
      
      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: opacity 0.3s ease;
        opacity: 1;

        &.hidden {
          opacity: 0;
        }
      }

      /* [추가] 스켈레톤 로더 스타일 */
      .skeleton-loader {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        min-height: 300px;
        z-index: 1;
        background: #334155;
        background-image: linear-gradient(
          to right,
          #334155 0%,
          #475569 20%,
          #334155 40%,
          #334155 100%
        );
        background-repeat: no-repeat;
        background-size: 800px 100%;
        animation: shimmer 1.5s infinite linear forwards;
      }
    }

  /* 영상 컨트롤 버튼 컨테이너 (오버레이) */
  .video-controls {
    position: absolute;
    bottom: 0.5rem;
    right: 0.5rem;
    display: flex;
    gap: 0.5rem;
    z-index: 5;
  }

  .vid-btn {
    display: flex;
    align-items: center;
    gap: 0.3rem;
    padding: 0.4rem 0.8rem;
    border-radius: 2rem;
    border: 1px solid rgba(255, 255, 255, 0.2);
    font-size: 0.75rem;
    font-weight: 600;
    cursor: pointer;
    backdrop-filter: blur(4px);
    transition: all 0.2s;

    @include mobile {
      font-size: 14px;
      padding: 8px 16px;
    }

    .icon {
      font-size: 0.9rem;

      @include mobile {
        font-size: 14px;
      }
    }

    /* Intro 버튼 */
    &.intro {
      background: rgba(0, 0, 0, 0.6);
      color: white;
      &:hover {
        background: rgba(255, 255, 255, 0.2);
      }
    }

    /* Deep 버튼 (잠김/해제) */
    &.deep {
      background: rgba(99, 102, 241, 0.8); /* Indigo */
      color: white;
      border-color: #6366f1;

      &:hover {
        background: #4f46e5;
      }

      &.locked {
        background: rgba(0, 0, 0, 0.8);
        color: #94a3b8;
        border-color: #475569;
        cursor: not-allowed;
      }
    }
  }
}

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
</style>

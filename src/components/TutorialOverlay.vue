<script setup>
import { ref, computed } from 'vue';

const emit = defineEmits(['close']);

const currentStep = ref(0);

// 튜토리얼 단계 데이터
const steps = [
  {
    title: '성경의 흐름을 한눈에!',
    desc: '좌우로 스크롤(또는 드래그)하여 창조부터 요한계시록까지의 역사적 흐름을 탐험해보세요.',
    icon: '/img/tutorial/tutorial_01.gif', // 나중에 실제 이미지 경로(예: /img/tutorial/step1.png)로 교체하세요.
  },
  {
    title: '시대별 상세 정보',
    desc: '각 시대를 클릭하면 해당 시대의 주요 인물과 배경, 그리고 관련된 성경 목록을 볼 수 있습니다.',
    icon: '📜',
  },
  {
    title: '퀴즈 풀고 티어 올리기',
    desc: '로그인 후 퀴즈에 도전하세요! 5문제를 모두 맞추면 "CLEAR" 뱃지와 칭호를 획득할 수 있습니다.',
    icon: '🏅',
  },
  {
    title: '영상으로 더 깊이',
    desc: 'Intro 영상으로 개요를 잡고, 퀴즈를 클리어하여 잠겨있는 심화(Deep) 강의 영상을 해금해보세요.',
    icon: '🎬',
  },
];

const isLastStep = computed(() => currentStep.value === steps.length - 1);

const nextStep = () => {
  if (currentStep.value < steps.length - 1) {
    currentStep.value++;
  } else {
    finishTutorial();
  }
};

const prevStep = () => {
  if (currentStep.value > 0) {
    currentStep.value--;
  }
};

const finishTutorial = () => {
  // 로컬 스토리지에 튜토리얼 완료 기록 저장
  //localStorage.setItem('hasSeenTutorial', 'true');
  emit('close');
};
</script>

<template>
  <div class="tutorial-overlay">
    <div class="tutorial-card">
      <!-- 닫기 버튼 (우측 상단) -->
      <button class="close-icon-btn" @click="finishTutorial">✕</button>

      <!-- 슬라이드 영역 -->
      <div class="slide-content">
        <!-- 캡처 이미지 영역 (현재는 아이콘으로 대체) -->
        <div class="image-area">
          <div class="placeholder-img">
            <!-- <span class="icon">{{ steps[currentStep].icon }}</span> -->
            <figure>
              <img :src="steps[currentStep].icon" alt="" />
            </figure>
          </div>
        </div>

        <div class="text-area">
          <h3>{{ steps[currentStep].title }}</h3>
          <p>{{ steps[currentStep].desc }}</p>
        </div>
      </div>

      <!-- 네비게이션 컨트롤 -->
      <div class="controls">
        <!-- 인디케이터 (점) -->
        <div class="indicators">
          <span v-for="(step, index) in steps" :key="index" class="dot" :class="{ active: index === currentStep }"></span>
        </div>

        <div class="btn-group">
          <button v-if="currentStep > 0" class="btn prev" @click="prevStep">이전</button>
          <button class="btn next" @click="nextStep">
            {{ isLastStep ? '시작하기' : '다음' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use 'sass:color';

/* 다크 모드 테마 변수 활용 */
$card-bg: #1e293b;
$text-primary: #f1f5f9;
$text-secondary: #94a3b8;
$accent-color: #6366f1;

.tutorial-overlay {
  position: fixed;
  inset: 0;
  z-index: 888; /* 인트로보다 높거나 같게 */
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(5px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
}

.tutorial-card {
  background: $card-bg;
  width: 100%;
  max-width: 800px;
  border-radius: 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
  padding: 2rem;
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  animation: slideUp 0.4s ease-out;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.close-icon-btn {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: transparent;
  border: none;
  color: $text-secondary;
  font-size: 1.2rem;
  cursor: pointer;
  &:hover {
    color: white;
  }
}

.slide-content {
  text-align: center;

  .image-area {
    margin-bottom: 1.5rem;
    height: 360px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0, 0, 0, 0.3);
    border-radius: 1rem;

    /* 실제 이미지 사용 시 이 부분을 img 태그 스타일로 대체 */
    .placeholder-img {
      font-size: 5rem;
      //animation: bounce 2s infinite;
      width: 100%;
      height: 100%;

      figure {
        width: 100%;
        height: 100%;

        img {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }
      }
    }
  }

  h3 {
    font-size: 1.5rem;
    font-weight: 700;
    color: white;
    margin-bottom: 0.5rem;
  }

  p {
    font-size: 0.95rem;
    color: $text-secondary;
    line-height: 1.6;
    word-break: keep-all;
  }
}

.controls {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;

  .indicators {
    display: flex;
    justify-content: center;
    gap: 0.5rem;

    .dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.2);
      transition: all 0.3s;

      &.active {
        background: $accent-color;
        transform: scale(1.2);
      }
    }
  }

  .btn-group {
    display: flex;
    gap: 0.75rem;

    .btn {
      flex: 1;
      padding: 0.8rem;
      border-radius: 0.75rem;
      border: none;
      font-weight: 600;
      cursor: pointer;
      font-size: 1rem;
      transition: all 0.2s;

      &.prev {
        background: transparent;
        border: 1px solid rgba(255, 255, 255, 0.2);
        color: $text-secondary;
        &:hover {
          border-color: white;
          color: white;
        }
      }

      &.next {
        background: $accent-color;
        color: white;
        &:hover {
          background: color.adjust($accent-color, $lightness: -5%);
        }
      }
    }
  }
}

@keyframes bounce {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}
</style>

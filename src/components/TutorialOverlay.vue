<script setup>
import { ref, computed } from 'vue';

const emit = defineEmits(['close']);

const currentStep = ref(0);

// 튜토리얼 단계 데이터 (유튜브 Video ID 적용)
const steps = [
  {
    title: '성경의 흐름을 한눈에!',
    desc: '좌우로 스크롤(또는 드래그)하여 창조부터 요한계시록까지의 역사적 흐름을 탐험해보세요.',
    videoId: 'CpSwy3qodT0', // https://youtu.be/CpSwy3qodT0
  },
  {
    title: '시대별 상세 정보',
    desc: '각 시대를 클릭하면 해당 시대의 주요 인물과 배경, 그리고 관련된 성경 목록을 볼 수 있습니다.',
    videoId: 'CrtRIsU-G9M', // https://youtu.be/CrtRIsU-G9M
  },
  {
    title: '퀴즈 풀고 칭호 받기',
    desc: '로그인 후 퀴즈에 도전하세요! 5문제를 모두 맞추면 칭호를 획득할 수 있습니다.',
    videoId: 'n_7N2o2OG4Q', // https://youtu.be/n_7N2o2OG4Q
  },
  {
    title: '마이페이지에서 나의 여정 확인하기',
    desc: '마이페이지에서 내가 획득한 칭호와 푼 퀴즈 기록을 확인할 수 있습니다.',
    videoId: 'ZsgSDyQMZvg', // https://youtu.be/ZsgSDyQMZvg
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
  localStorage.setItem('hasSeenTutorial', 'true');
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
        <!-- 영상 영역 -->
        <div class="image-area">
          <div class="video-wrapper">
            <!-- 
              유튜브 옵션 설명:
              autoplay=1: 자동 재생
              mute=1: 음소거 (브라우저 정책상 자동재생 시 필수)
              loop=1: 반복 재생
              playlist={videoId}: 단일 영상 반복 재생을 위해 필수
              controls=0: 컨트롤 바 숨김
              rel=0: 관련 영상 표시 안 함 (같은 채널 영상만 표시)
              modestbranding=1: 로고 최소화
              playsinline=1: iOS 인라인 재생
            -->
            <iframe
              :key="currentStep"
              :src="`https://www.youtube.com/embed/${steps[currentStep].videoId}?autoplay=1&mute=1&loop=1&playlist=${steps[currentStep].videoId}&controls=0&showinfo=0&rel=0&modestbranding=1&playsinline=1&iv_load_policy=3`"
              title="Tutorial Video"
              frameborder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowfullscreen
            ></iframe>
            <!-- 터치/클릭 방지용 투명 커버 (영상을 조작하지 못하게 함) -->
            <div class="click-guard"></div>
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

  @media (max-width: 768px) {
    padding: 1.5rem;
    gap: 1rem;
  }
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
  z-index: 10;

  @include mobile {
    font-size: 3rem;
    top: -4.5rem;
  }
  &:hover {
    color: white;
  }
}

.slide-content {
  text-align: center;

  .image-area {
    margin-bottom: 1.5rem;
    width: 100%;
    /* 16:9 비율 유지를 위한 설정 */
    position: relative;
    background: rgba(0, 0, 0, 0.3);
    border-radius: 1rem;
    overflow: hidden;

    .video-wrapper {
      position: relative;
      width: 100%;
      padding-bottom: 56.25%; /* 16:9 Aspect Ratio */
      height: 0;

      iframe {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none; /* iframe 내부 클릭 방지 (옵션) */
      }

      .click-guard {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 2; /* iframe 위에 투명 막 */
      }
    }
  }

  h3 {
    font-size: 1.5rem;
    font-weight: 700;
    color: white;
    margin-bottom: 0.5rem;
    @include mobile {
      font-size: 16px;
      margin-bottom: 12px;
    }
  }

  p {
    font-size: 0.95rem;
    color: $text-secondary;
    line-height: 1.6;
    word-break: keep-all;
    @include mobile {
      font-size: 14px;
      margin-bottom: 12px;
    }
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

      @include mobile {
        width: 6px;
        height: 6px;
      }

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

      @include mobile {
        font-size: 16px;
      }

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
</style>

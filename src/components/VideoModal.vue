<script setup>
defineProps({
  videoId: {
    type: String,
    required: true,
  },
});

const emit = defineEmits(['close']);
</script>

<template>
  <div class="video-overlay" @click.self="$emit('close')">
    <div class="video-modal">
      <button class="close-btn" @click="$emit('close')">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <div class="video-container">
        <!-- 
          [수정] 유튜브 플레이어 파라미터 최적화
          - controls=0: 플레이어 컨트롤 바 숨김
          - rel=0: 관련 영상 표시 제한 (종료 시 같은 채널 영상만 표시)
          - modestbranding=1: 유튜브 로고 최소화
          - playsinline=1: iOS에서 전체화면 대신 인라인 재생
          - iv_load_policy=3: 동영상 주석 숨김
          - disablekb=1: 키보드 컨트롤 비활성화
          - loop=1 & playlist={videoId}: 영상 무한 반복 (종료 후 추천 목록 뜨는 것 방지)
        -->
        <iframe
          :src="`https://www.youtube.com/embed/${videoId}?autoplay=1&controls=0&rel=0&modestbranding=1&playsinline=1&iv_load_policy=3&disablekb=1&loop=1&playlist=${videoId}`"
          title="YouTube video player"
          frameborder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowfullscreen
        ></iframe>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.video-overlay {
  position: fixed;
  inset: 0;
  z-index: 200; /* 퀴즈 모달(100)보다 높게 */
  background: rgba(0, 0, 0, 0.9);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.video-modal {
  width: 100%;
  max-width: 960px; /* PC에서 적당히 크게 */
  position: relative;
  animation: popIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.close-btn {
  position: absolute;
  top: -3rem;
  right: 0;
  background: transparent;
  border: none;
  color: white;
  cursor: pointer;
  padding: 0.5rem;
  transition: transform 0.2s;

  svg {
    width: 2rem;
    height: 2rem;
  }

  &:hover {
    color: #fbbf24; /* Gold color */
    transform: scale(1.1);
  }
}

.video-container {
  position: relative;
  width: 100%;
  padding-bottom: 56.25%; /* 16:9 비율 유지 */
  background: black;
  border-radius: 1rem;
  overflow: hidden;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.1);

  iframe {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }
}

@keyframes popIn {
  from {
    transform: scale(0.95);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}
</style>

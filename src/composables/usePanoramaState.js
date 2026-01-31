import { ref } from 'vue';
import { erasData } from '@/data/bibleData';

// 전역 상태 (Singleton)
const progress = ref(0);
const currentEraIndex = ref(0);
const isNavOpen = ref(false);
const eras = ref(erasData);

// 스크롤 이동 함수 저장소
const scrollToEraTrigger = ref(null);

export function usePanoramaState() {
  // Panorama.vue에서 스크롤 함수를 등록
  const registerScrollTrigger = (fn) => {
    scrollToEraTrigger.value = fn;
  };

  // AppHeader.vue에서 호출
  const triggerScrollToEra = (index) => {
    if (scrollToEraTrigger.value) {
      scrollToEraTrigger.value(index);
    }
  };

  return {
    eras,
    progress,
    currentEraIndex,
    isNavOpen,
    registerScrollTrigger,
    triggerScrollToEra,
  };
}

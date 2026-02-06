<script setup>
import { ref, onMounted, computed } from 'vue';

const props = defineProps({
  questions: {
    type: Array,
    required: true
  },
  eraTitle: String
});

const emit = defineEmits(['close', 'quiz-completed']);

const quizList = ref([]);
const currentIndex = ref(0);
const showResult = ref(false);
const userAnswers = ref([]); // [추가] 사용자가 선택한 답 인덱스 저장

// 퀴즈 초기화: 전체 문제 중 5개 랜덤 추출
onMounted(() => {
  if (props.questions && props.questions.length > 0) {
    const shuffled = [...props.questions].sort(() => 0.5 - Math.random());
    quizList.value = shuffled.slice(0, 5);
    // 답변 배열 초기화 (null로 채움)
    userAnswers.value = new Array(quizList.value.length).fill(null);
  }
});

// 답안 선택 시 처리
const handleAnswer = (optionIndex) => {
  // 현재 문제에 대한 답 저장 (점수는 마지막에 계산)
  userAnswers.value[currentIndex.value] = optionIndex;

  // 다음 문제로 넘어가거나 결과 표시
  if (currentIndex.value < quizList.value.length - 1) {
    currentIndex.value++;
  } else {
    showResult.value = true;
  }
};

// [추가] 이전 문제로 돌아가기
const prevQuestion = () => {
  if (currentIndex.value > 0) {
    currentIndex.value--;
  }
};

// [수정] 최종 점수 계산 (Computed)
// 사용자가 선택한 답과 실제 정답을 비교하여 실시간으로 계산
const finalScore = computed(() => {
  return quizList.value.reduce((acc, question, idx) => {
    return acc + (question.answerIndex === userAnswers.value[idx] ? 1 : 0);
  }, 0);
});

// 결과 확인 버튼
const handleConfirm = () => {
  if (finalScore.value === quizList.value.length) {
    // 만점이면 성공 이벤트 전달
    emit('quiz-completed', true);
  } else {
    // 만점이 아니면 닫기
    emit('close');
  }
};

const close = () => {
  emit('close');
};
</script>

<template>
  <div class="quiz-overlay">
    <div class="quiz-modal">
      <div class="quiz-header">
        <!-- [추가] 뒤로가기 버튼 (첫 문제가 아니고 결과 화면이 아닐 때만 표시) -->
        <button 
          v-if="currentIndex > 0 && !showResult" 
          class="back-btn" 
          @click="prevQuestion"
          title="이전 문제"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </button>
        <div v-else class="spacer"></div> <!-- 레이아웃 유지를 위한 빈 공간 -->

        <h3>{{ eraTitle }} 퀴즈</h3>
        
        <button class="close-btn" @click="close">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div v-if="!showResult" class="quiz-body">
        <div v-if="quizList.length > 0">
          <div class="progress-text">
            문제 {{ currentIndex + 1 }} / {{ quizList.length }}
          </div>
          <div class="question-text">
            Q. {{ quizList[currentIndex].question }}
          </div>
          <div class="options-list">
            <button 
              v-for="(option, idx) in quizList[currentIndex].options" 
              :key="idx"
              class="option-btn"
              :class="{ selected: userAnswers[currentIndex] === idx }"
              @click="handleAnswer(idx)"
            >
              <span class="num">{{ idx + 1 }}.</span> {{ option }}
            </button>
          </div>
        </div>
        <div v-else class="no-quiz">
          <p>등록된 문제가 없습니다.</p>
        </div>
      </div>

      <div v-else class="result-body">
        <div class="score-circle">
          <span class="score-num">{{ finalScore }}</span>
          <span class="score-total">/ {{ quizList.length }}</span>
        </div>
        
        <div class="result-message">
          <h4 v-if="finalScore === quizList.length">🎉 축하합니다!</h4>
          <h4 v-else>아쉽네요!</h4>
          
          <p v-if="finalScore === quizList.length">모든 문제를 맞추셨습니다.<br>시대 클리어 배지가 부여됩니다!</p>
          <p v-else>다시 도전하여 모든 문제를 맞춰보세요.</p>
        </div>

        <button class="confirm-btn" @click="handleConfirm">확인</button>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use 'sass:color';

.quiz-overlay {
  position: fixed;
  inset: 0;
  z-index: 100;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  box-sizing: border-box;
  max-width: 100vw;
}

.quiz-modal {
  background: #1e293b;
  width: 100%;
  max-width: 480px;
  border-radius: 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
  overflow: hidden;
  animation: popIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);

  @include mobile {
    max-width: 95vw;
  }
}

@keyframes popIn {
  from {
    transform: scale(0.9);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

.quiz-header {
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  display: grid;
  grid-template-columns: 2rem 1fr 2rem;
  align-items: center;
  text-align: center;

  @include mobile{
    grid-template-columns: 3rem 1fr 3rem;
  }
  
  h3 {
    margin: 0;
    font-size: 1.125rem;
    font-weight: 700;
    color: white;
    white-space: nowrap;

    @include mobile {
      font-size: 16px;
    }
  }
  
  .close-btn, .back-btn {
    background: transparent;
    border: none;
    color: #94a3b8;
    cursor: pointer;
    padding: 0.25rem;
    display: flex;
    align-items: center;
    justify-content: center;
    
    svg {
      width: 1.5rem;
      height: 1.5rem;
      @include mobile {
        width: 3rem;
        height: 3rem;
      }
    }
    
    &:hover {
      color: white;
    }
  }
}

.quiz-body {
  padding: 1.5rem;
  .progress-text {
    font-size: 0.875rem;
    color: #6366f1;
    font-weight: 600;
    margin-bottom: 0.75rem;
    @include mobile {
      font-size: 14px;
    }
  }
  .question-text {
    font-size: 1.25rem;
    color: white;
    font-weight: 600;
    line-height: 1.5;
    margin-bottom: 2rem;
    min-height: 3.75rem;
    @include mobile {
      font-size: 14px;
    }
  }
  .options-list {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    .option-btn {
      text-align: left;
      padding: 1rem;
      border-radius: 0.75rem;
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(255, 255, 255, 0.1);
      color: #e2e8f0;
      font-size: 1rem;
      cursor: pointer;
      transition: all 0.2s;
      display: flex;
      gap: 0.5rem;
      @include mobile {
        font-size: 14px;
        padding: 2rem 1rem;
      }
      .num {
        color: #94a3b8;
        font-weight: 700;
      }
      &:hover {
        background: rgba(99, 102, 241, 0.1);
        border-color: #6366f1;
        color: white;
        @include mobile {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: #e2e8f0;
        }
        .num {
          color: #818cf8;
          @include mobile {
            color: #94a3b8;
          }
        }
      }
      &:active {
        transform: scale(0.98);
      }
      
      &.selected {
        background: rgba(99, 102, 241, 0.2);
        border-color: #6366f1;
        color: white;
        .num {
          color: #818cf8;
        }
      }
    }
  }
  .no-quiz {
    text-align: center;
    color: #94a3b8;
    padding: 2rem;
  }
}

.result-body {
  padding: 3rem 1.5rem;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  .score-circle {
    width: 120px;
    height: 120px;
    border-radius: 50%;
    border: 4px solid #6366f1;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 1.5rem;
    font-size: 1.5rem;
    color: #94a3b8;
    .score-num {
      font-size: 3rem;
      font-weight: 800;
      color: #6366f1;
      margin-right: 0.25rem;
      @include mobile {
        font-size: 32px;
      }
    }
    .score-total {
      font-size: 1.5rem;
      @include mobile {
        font-size: 16px;
      }
    }
  }
  .result-message {
    margin-bottom: 2rem;
    h4 {
      font-size: 1.5rem;
      color: white;
      margin: 0 0 0.5rem 0;
      @include mobile {
        font-size: 16px;
      }
    }
    p {
      color: #94a3b8;
      margin: 0;
      line-height: 1.5;
      @include mobile {
        font-size: 14px;
      }
    }
  }
  .confirm-btn {
    padding: 0.875rem 3rem;
    background: #6366f1;
    color: white;
    font-weight: 700;
    border-radius: 0.75rem;
    border: none;
    cursor: pointer;
    font-size: 1rem;
    transition: background 0.2s;
    @include mobile {
      font-size: 16px;
    }
    &:hover {
      background: #4f46e5;
    }
  }
}
</style>
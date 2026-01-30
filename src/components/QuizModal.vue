<script setup>
import { ref, onMounted } from 'vue';

const props = defineProps({
  questions: { type: Array, required: true },
  eraTitle: String,
});

const emit = defineEmits(['close', 'quiz-completed']);

const quizList = ref([]);
const currentIndex = ref(0);
const score = ref(0);
const showResult = ref(false);

onMounted(() => {
  // 문제 랜덤 섞기 (최대 5문제)
  if (props.questions && props.questions.length > 0) {
    const shuffled = [...props.questions].sort(() => 0.5 - Math.random());
    quizList.value = shuffled.slice(0, 5);
  }
});

const handleAnswer = (optionIndex) => {
  const currentQuestion = quizList.value[currentIndex.value];
  if (optionIndex === currentQuestion.answerIndex) score.value++;

  if (currentIndex.value < quizList.value.length - 1) {
    currentIndex.value++;
  } else {
    showResult.value = true;
    // 만점(5점)일 때만 성공 처리
    if (score.value === quizList.value.length) {
      emit('quiz-completed', true);
    }
  }
};
</script>

<template>
  <div class="quiz-overlay">
    <div class="quiz-modal">
      <div class="quiz-header">
        <h3>{{ eraTitle }} 퀴즈</h3>
        <button class="close-btn" @click="$emit('close')">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>

      <div v-if="!showResult" class="quiz-body">
        <div v-if="quizList.length > 0">
          <div class="progress-text">문제 {{ currentIndex + 1 }} / {{ quizList.length }}</div>
          <div class="question-text">Q. {{ quizList[currentIndex].question }}</div>
          <div class="options-list">
            <button v-for="(option, idx) in quizList[currentIndex].options" :key="idx" class="option-btn" @click="handleAnswer(idx)">
              <span class="num">{{ idx + 1 }}.</span> {{ option }}
            </button>
          </div>
        </div>
        <div v-else class="no-quiz"><p>등록된 문제가 없습니다.</p></div>
      </div>

      <div v-else class="result-body">
        <div class="score-circle">
          <span class="score-num">{{ score }}</span
          ><span class="score-total">/ {{ quizList.length }}</span>
        </div>
        <div class="result-message">
          <h4 v-if="score === quizList.length">🎉 축하합니다!</h4>
          <h4 v-else>아쉽네요!</h4>
          <p v-if="score === quizList.length">모든 문제를 맞추셨습니다.<br />시대 클리어 배지가 부여됩니다!</p>
          <p v-else>다시 도전하여 모든 문제를 맞춰보세요.</p>
        </div>
        <button class="confirm-btn" @click="$emit('close')">확인</button>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
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
  display: flex;
  justify-content: space-between;
  align-items: center;
  h3 {
    margin: 0;
    font-size: 1.125rem;
    font-weight: 700;
    color: white;

    @include mobile {
      font-size: 16px;
    }
  }
  .close-btn {
    background: transparent;
    border: none;
    color: #94a3b8;
    cursor: pointer;
    padding: 0.25rem;
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
        .num {
          color: #818cf8;
        }
      }
      &:active {
        transform: scale(0.98);
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
    }
  }
  .result-message {
    margin-bottom: 2rem;
    h4 {
      font-size: 1.5rem;
      color: white;
      margin: 0 0 0.5rem 0;
    }
    p {
      color: #94a3b8;
      margin: 0;
      line-height: 1.5;
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
    &:hover {
      background: #4f46e5;
    }
  }
}
</style>

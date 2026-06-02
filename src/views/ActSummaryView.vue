<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import { actSummaryData } from '@/data/actSummaryData';

const router = useRouter();

// 메인 화면으로 돌아가는 핸들러
const goBack = () => {
  router.push('/');
};

// 팝업 표시 상태
const showOverview = ref(false);
const showClassification = ref(false);

// 카카오톡 채팅 데이터
const chatMessages = [
  { sender: 'me', text: '몽땅 선교의 복음 주제는?' },
  { sender: 'other', text: '하나님 나라' },
  { sender: 'me', text: '그럼 복음의 내용은?' },
  { sender: 'other', text: '예수 그리스도' },
  { sender: 'me', text: '복음의 전달은 어떻게 하지?' },
  { sender: 'other', text: '성령의 능력으로' },
  { sender: 'me', text: '복음의 골자는 뭐야?' },
  { sender: 'other', text: '예수 그리스도 - 성육신 - 십자가 - 부활 - 승천' },
  { sender: 'me', text: '사도행전 주제는?' },
  { sender: 'other', text: '하나님의 사람들이 펼쳐가는 성령행전' },
  { sender: 'me', text: '핵심 구절은?' },
  { sender: 'other', text: '“오직 성령이 너희에게 임하시면 너희가 권능을 받고, 예루살렘과 온 유대와 사마리아와 땅끝까지 이르러 내 증인이 되리라 하시니라”\n\n사도행전 1장 8절' }
];

const visibleChatCount = ref(1); // 처음에 질문 하나만 보여줌
const chatAreaRef = ref(null);

const openOverview = () => {
  showOverview.value = true;
  resetChat();
};

const nextChatMessage = () => {
  if (visibleChatCount.value < chatMessages.length) {
    visibleChatCount.value++;
    scrollToBottom();
  }
};

const resetChat = () => {
  visibleChatCount.value = 1;
  scrollToBottom();
};

const scrollToBottom = () => {
  nextTick(() => {
    if (chatAreaRef.value) {
      chatAreaRef.value.scrollTo({
        top: chatAreaRef.value.scrollHeight,
        behavior: 'smooth'
      });
    }
  });
};

const closeOverview = () => {
  showOverview.value = false;
};

// [구분] 활성화된 단락 ID
const activeSegmentId = ref(1);

const openClassification = () => {
  activeSegmentId.value = 0; // 진입 시 아코디언 축소 상태로 대기
  showClassification.value = true;
  
  // 모달이 페이드인되어 나타나는 시점에 맞추어 아코디언 팽창 및 하단 페이드업 애니메이션 실행
  setTimeout(() => {
    activeSegmentId.value = 1;
  }, 200);
};

const closeClassification = () => {
  showClassification.value = false;
};

// 현재 활성화된 단락 데이터
const currentSegment = computed(() => {
  return actSummaryData.find(item => item.id === activeSegmentId.value) || actSummaryData[0];
});

// 주요인물 캐릭터 선택 상태 관리
const selectedCharacterId = ref('');

// 단락이 바뀌거나 구분 모달이 열릴 때 첫 번째 캐릭터 자동 선택
watch([activeSegmentId, showClassification], () => {
  const seg = currentSegment.value;
  if (seg && seg.characters && seg.characters.length > 0) {
    selectedCharacterId.value = seg.characters[0].id;
  } else {
    selectedCharacterId.value = '';
  }
}, { immediate: true });

const currentCharacter = computed(() => {
  const seg = currentSegment.value;
  if (!seg || !seg.characters) return null;
  return seg.characters.find(c => c.id === selectedCharacterId.value) || seg.characters[0];
});

// 이미지 로드 실패 시 플레이스홀더로 대체하기 위한 에러 핸들러
const handleImgError = (character) => {
  if (character) {
    character.img = '';
  }
};

// 로고 교차 페이드 스위칭 로직
const showKoLogo = ref(true);
let logoInterval = null;

// 최초 로드 애니메이션을 위한 상태 값
const isMounted = ref(false);

onMounted(() => {
  // 브라우저가 진입 전 초기 opacity: 0 상태를 렌더링할 시간을 제공하여 애니메이션이 항상 작동되도록 보장합니다.
  requestAnimationFrame(() => {
    setTimeout(() => {
      isMounted.value = true;
    }, 50);
  });
  
  logoInterval = setInterval(() => {
    showKoLogo.value = !showKoLogo.value;
  }, 4000); // 4초마다 한글/영문 로고 스위칭
});


onUnmounted(() => {
  if (logoInterval) {
    clearInterval(logoInterval);
  }
});
</script>

<template>
  <div class="act-summary-page" :class="{ 'page-loaded': isMounted }">
    <!-- 은은한 미니멀 백버튼 -->
    <button class="back-btn" @click="goBack" aria-label="메인 화면으로 돌아가기">
      <span class="arrow">←</span>
      <span class="text">Back</span>
    </button>

    <!-- 타이틀 영역 -->
    <div class="header-section">
      <div class="logo-container">
        <transition name="logo-fade">
          <img v-if="showKoLogo" key="ko" src="/img/act/logo_ko.webp" alt="사도행전 구조도 한글 로고" class="logo-img" />
          <img v-else key="en" src="/img/act/logo_en.webp" alt="사도행전 구조도 영문 로고" class="logo-img" />
        </transition>
      </div>
      <h1 class="page-title">사도행전 구조도 시연</h1>
      <p class="page-subtitle">성령행전의 거대한 서사와 구속사적 흐름을 탐색합니다.</p>
    </div>

    <!-- 중앙 2개 메인 카드 컨테이너 -->
    <div class="main-cards-container">
      <!-- Left Card: 개요 -->
      <div class="main-card overview-card" @click="openOverview">
        <div class="card-glow-overlay"></div>
        <div class="card-content">
          <div class="card-icon-wrapper">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
            </svg>
          </div>
          <h2 class="card-title">개 요</h2>
          <p class="card-desc">사도행전의 주제와 핵심 성경 구절을 입체적인 블라인드 효과와 함께 선포합니다.</p>
          <div class="btn-explore">시작하기 <span class="arrow-icon">→</span></div>
        </div>
      </div>

      <!-- Right Card: 구분 -->
      <div class="main-card classification-card" @click="openClassification">
        <div class="card-glow-overlay"></div>
        <div class="card-content">
          <div class="card-icon-wrapper">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-1.8 2.25h-2.25a2.25 2.25 0 0 1-2.25-2.25v-2.25Z" />
            </svg>
          </div>
          <h2 class="card-title">구 분</h2>
          <p class="card-desc">사도행전의 3단 구성을 가로 아코디언 및 탭 인터페이스로 입체 탐색합니다.</p>
          <div class="btn-explore">시작하기 <span class="arrow-icon">→</span></div>
        </div>
      </div>
    </div>

    <!-- [개요] 팝업 모달 (카카오톡 대화방 UI) -->
    <transition name="modal-fade">
      <div v-if="showOverview" class="modal-overlay" @click.self="closeOverview">
        <div class="modal-container overview-modal chat-modal-container">
          <button class="modal-close chat-modal-close" @click="closeOverview" aria-label="닫기">&times;</button>
          
          <div class="kakao-chat-room" @click="nextChatMessage">
            <!-- 채팅방 상단 헤더 -->
            <div class="chat-header">
              <div class="chat-title">몽땅 선교회 대화방</div>
              <div class="chat-subtitle">복음과 사도행전 개요</div>
            </div>

            <!-- 채팅 내용 영역 -->
            <div class="chat-bubble-area" ref="chatAreaRef">
              <!-- 아래쪽에서부터 채워져서 올라가는 느낌을 주기 위한 flex 컨테이너 -->
              <div class="chat-messages-container">
                <transition-group name="chat-bubble-fade">
                  <div
                    v-for="(msg, index) in chatMessages.slice(0, visibleChatCount)"
                    :key="index"
                    class="chat-bubble-row"
                    :class="msg.sender === 'me' ? 'row-me' : 'row-other'"
                  >
                    <!-- 상대방 대화방 레이아웃 (원형 프로필 이미지 + 이름 및 말풍선 우측 정렬) -->
                    <template v-if="msg.sender === 'other'">
                      <div class="profile-img-box">
                        <img src="/img/act/logo_ko.webp" alt="몽땅" class="profile-img" />
                      </div>
                      <div class="message-content-box">
                        <span class="profile-name">몽땅</span>
                        <div class="bubble-container">
                          <div class="chat-bubble">
                            <span class="bubble-text">{{ msg.text }}</span>
                          </div>
                        </div>
                      </div>
                    </template>

                    <!-- 내 대화방 레이아웃 (우측 정렬 말풍선) -->
                    <template v-else>
                      <div class="bubble-container">
                        <div class="chat-bubble">
                          <span class="bubble-text">{{ msg.text }}</span>
                        </div>
                      </div>
                    </template>
                  </div>
                </transition-group>

                <!-- 마지막 대화 완료 후 리셋 버튼 -->
                <div v-if="visibleChatCount === chatMessages.length" class="chat-reset-row" @click.stop="resetChat">
                  <button class="chat-reset-btn">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="reset-icon">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                    </svg>
                    <span>대화 처음부터 다시보기</span>
                  </button>
                </div>
              </div>
            </div>

            <!-- 채팅방 하단 클릭 가이드 -->
            <div v-if="visibleChatCount < chatMessages.length" class="chat-bottom-guide">
              <span class="guide-animate">👇 화면을 클릭하면 다음 대화가 이어집니다</span>
            </div>
          </div>
        </div>
      </div>
    </transition>

    <!-- [구분] 팝업 모달 -->
    <transition name="modal-fade">
      <div v-if="showClassification" class="modal-overlay" @click.self="closeClassification">
        <div class="modal-container classification-modal">
          <button class="modal-close" @click="closeClassification" aria-label="닫기">&times;</button>
          
          <div class="classification-modal-content">
            <h3 class="modal-header-title">사도행전 구분 및 구조</h3>
            
            <!-- 1. 데스크톱 가로 아코디언 (768px 이상) -->
            <div class="accordion-container desktop-only">
              <div 
                v-for="item in actSummaryData" 
                :key="item.id" 
                class="accordion-item"
                :class="{ 'expanded': activeSegmentId === item.id }"
                @click="activeSegmentId = item.id"
              >
                <!-- 축소 및 기본 타이틀을 보여줄 영역 -->
                <div class="accordion-tab-bar">
                  <span class="tab-index">0{{ item.id }}</span>
                  <span class="chapter-badge">{{ item.title }}</span>
                </div>
                
                <!-- 확장 시 우측에 나타날 정보 -->
                <div class="accordion-body">
                  <div class="accordion-inner-content">
                    <span class="segment-number">단락 0{{ item.id }}</span>
                    <h4 class="accordion-theme">{{ item.mainTheme }}</h4>
                    <div class="accordion-divider"></div>
                    <p class="accordion-target">
                      <span class="label">대상 및 특징</span>
                      <span class="value">{{ item.target }}</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <!-- 2. 모바일 탭 인터페이스 (768px 미만) -->
            <div class="tab-container mobile-only">
              <div class="tabs-header">
                <button 
                  v-for="item in actSummaryData" 
                  :key="item.id"
                  class="tab-btn"
                  :class="{ 'active': activeSegmentId === item.id }"
                  @click="activeSegmentId = item.id"
                >
                  {{ item.title }}
                </button>
              </div>
              <div class="tab-body">
                <div class="tab-inner-content">
                  <span class="segment-number">단락 0{{ currentSegment.id }}</span>
                  <h4 class="tab-theme">{{ currentSegment.mainTheme }}</h4>
                  <div class="tab-divider"></div>
                  <p class="tab-target">
                    <span class="label">대상 및 특징</span>
                    <span class="value">{{ currentSegment.target }}</span>
                  </p>
                </div>
              </div>
            </div>

            <!-- 스크롤 가능 컨텐츠 영역 (단락 전환 시 페이드업 애니메이션 적용) -->
            <transition name="segment-fade-up" mode="out-in">
              <div :key="activeSegmentId" class="modal-scrollable-content">
                <!-- 3. 주요 등장인물 캐릭터 선택창 영역 (미니멀 초상화+이름) -->
                <div class="characters-section" v-if="currentSegment.characters && currentSegment.characters.length > 0">
                  <h4 class="section-title">
                    <span class="title-text">주요 등장인물 (클릭 시 하단 사역 요약이 전환됩니다)</span>
                    <span class="accent-line"></span>
                  </h4>
                  
                  <div class="character-simple-list">
                    <button 
                      v-for="char in currentSegment.characters" 
                      :key="char.id"
                      class="char-simple-item"
                      :class="{ 'active': selectedCharacterId === char.id }"
                      @click="selectedCharacterId = char.id"
                    >
                      <div class="char-avatar-box">
                        <span v-if="!char.img">{{ char.name ? char.name[0] : '' }}</span>
                        <img v-else :src="char.img" :alt="char.name" @error="handleImgError(char)" />
                      </div>
                      <span class="char-name-label">{{ char.name }}</span>
                    </button>
                  </div>
                </div>

                <!-- 하단 영역: 장별 상세 카드 목록 -->
                <div class="details-container">
                  <h4 class="details-title">
                    <span class="title-text">{{ currentSegment.title }} 상세 구조</span>
                    <span class="accent-line"></span>
                  </h4>
                  
                  <!-- 카드 전환 애니메이션을 위한 transition-group -->
                  <transition-group name="card-list" tag="div" class="cards-grid">
                    <div 
                      v-for="chap in currentSegment.chapters" 
                      :key="chap.range" 
                      class="detail-card"
                    >
                      <div class="card-header-row">
                        <span class="card-chapter-range">{{ chap.range }}</span>
                      </div>
                      <h5 class="card-sub-title">{{ chap.subtitle }}</h5>
                      <p class="card-desc-text">
                        {{ chap.actions && chap.actions[selectedCharacterId] ? chap.actions[selectedCharacterId] : chap.description }}
                      </p>
                    </div>
                  </transition-group>
                </div>
              </div>
            </transition>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<style lang="scss" scoped>
/* 사도행전 구조도 페이지 스타일 시스템 */
.act-summary-page {
  position: relative;
  width: 100%;
  min-height: 100vh;
  /* 다크필터를 투명하게 걷어내어 배경 이미지 본래의 맑고 화사한 느낌을 100% 노출 */
  background: linear-gradient(
      to bottom, 
      rgba(255, 255, 255, 0.15) 0%, 
      rgba(255, 255, 255, 0.05) 100%
    ), 
    url('/img/act/act_bg.webp');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  background-attachment: fixed;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  overflow-x: hidden;
  box-sizing: border-box;

  /* 미니멀 백버튼 (라이트 글래스모피즘 테마에 맞추어 짙은 글꼴 및 맑은 배경 적용) */
  .back-btn {
    position: absolute;
    top: 2.5rem;
    left: 2.5rem;
    background: rgba(255, 255, 255, 0.65);
    border: 1px solid rgba(0, 0, 0, 0.08);
    border-radius: 50px;
    padding: 0.6rem 1.2rem;
    color: #1e293b;
    font-size: 0.95rem;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    backdrop-filter: blur(8px);
    z-index: 10;

    /* 최초 상태 (애니메이션 진입 전) */
    opacity: 0;
    transform: translateX(-15px);
    transition: opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1),
                transform 0.8s cubic-bezier(0.16, 1, 0.3, 1);
    transition-delay: 0.1s;

    .arrow {
      transition: transform 0.3s ease;
    }

    &:hover {
      opacity: 1;
      background: rgba(255, 255, 255, 0.9);
      border-color: rgba(99, 102, 241, 0.35);
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
      color: #4f46e5;
      transform: translateY(-1px);
      transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      transition-delay: 0s !important; /* 호버 시에는 딜레이 없이 즉시 전환 */

      .arrow {
        transform: translateX(-3px);
      }
    }
  }



  /* 헤더 섹션 */
  .header-section {
    text-align: center;
    margin-bottom: 4.5rem;
    z-index: 1;

    .logo-container {
      position: relative;
      width: 280px;
      height: 80px;
      margin: 0 auto 1.5rem auto;

      /* 최초 상태 */
      opacity: 0;
      transform: translateY(20px);
      transition: opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1),
                  transform 0.8s cubic-bezier(0.16, 1, 0.3, 1);
      transition-delay: 0.3s;

      .logo-img {
        position: absolute;
        top: 0;
        left: 50%;
        transform: translateX(-50%);
        max-width: 100%;
        max-height: 100%;
        object-fit: contain;
      }
    }

    .page-title {
      font-size: 2.8rem;
      font-weight: 800;
      letter-spacing: -0.03em;
      background: linear-gradient(135deg, #0f172a 30%, #1e293b 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      margin-bottom: 0.8rem;
      /* 밝은 하늘 배경에서 또렷하게 보이기 위한 부드러운 화이트 아웃라인 글로우 */
      filter: drop-shadow(0 2px 8px rgba(255, 255, 255, 0.8));

      /* 최초 상태 */
      opacity: 0;
      transform: translateY(20px);
      transition: opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1),
                  transform 0.8s cubic-bezier(0.16, 1, 0.3, 1);
      transition-delay: 0.45s;
    }

    .page-subtitle {
      font-size: 1.15rem;
      color: #1e293b;
      font-weight: 600; /* 좀 더 굵고 선명하게 처리 */
      letter-spacing: -0.01em;
      text-shadow: 0 1px 8px rgba(255, 255, 255, 0.8);

      /* 최초 상태 */
      opacity: 0;
      transform: translateY(20px);
      transition: opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1),
                  transform 0.8s cubic-bezier(0.16, 1, 0.3, 1);
      transition-delay: 0.6s;
    }
  }

  /* 메인 카드 레이아웃 */
  .main-cards-container {
    display: flex;
    gap: 2rem; /* 간격 축소 */
    width: 100%;
    max-width: 780px; /* 전체 가로 폭 축소 */
    z-index: 1;

    .main-card {
      flex: 1;
      position: relative;
      background: rgba(255, 255, 255, 0.72); /* 밝고 깨끗한 화이트 반투명 글래스 */
      border: 1px solid rgba(255, 255, 255, 0.6); /* 밝은 테두리선 */
      border-radius: 20px;
      padding: 2.5rem 2rem; /* 패딩 축소 */
      cursor: pointer;
      overflow: hidden;
      backdrop-filter: blur(20px); /* 뒤쪽 초원이 이쁘게 퍼지도록 블러 강화 */
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05); /* 은은한 섀도우 */

      /* 최초 상태 */
      opacity: 0;
      transform: translateY(30px);
      transition: opacity 1s cubic-bezier(0.16, 1, 0.3, 1),
                  transform 1s cubic-bezier(0.16, 1, 0.3, 1);

      /* 카드별 딜레이 개별 설정 */
      &.overview-card {
        transition-delay: 0.75s;
      }
      &.classification-card {
        transition-delay: 0.9s;
      }

      .card-glow-overlay {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: radial-gradient(circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(99, 102, 241, 0.12) 0%, transparent 60%);
        opacity: 0;
        transition: opacity 0.4s ease;
        pointer-events: none;
      }

      .card-content {
        display: flex;
        flex-direction: column;
        height: 100%;
      }

      .card-icon-wrapper {
        width: 56px;
        height: 56px;
        background: rgba(99, 102, 241, 0.06);
        border: 1px solid rgba(99, 102, 241, 0.15);
        border-radius: 14px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #4f46e5; /* 라이트 테마에 어울리는 짙은 퍼플/인디고 */
        margin-bottom: 2rem;
        transition: all 0.3s ease;

        svg {
          width: 28px;
          height: 28px;
        }
      }

      .card-title {
        font-size: 1.8rem;
        font-weight: 700;
        color: #0f172a; /* 짙은 차콜 */
        margin-bottom: 0.8rem;
        letter-spacing: 0.05em;
      }

      .card-desc {
        font-size: 1rem;
        color: #334155; /* 짙은 슬레이트 그레이 */
        line-height: 1.6;
        margin-bottom: 2.5rem;
        font-weight: 400; /* 좀 더 또렷하게 굵기 변경 */
      }

      .btn-explore {
        margin-top: auto;
        font-size: 1rem;
        font-weight: 600;
        color: #4f46e5;
        display: flex;
        align-items: center;
        gap: 0.4rem;
        transition: all 0.3s ease;

        .arrow-icon {
          transition: transform 0.3s ease;
        }
      }

      /* Hover Effects */
      &:hover {
        transform: translateY(-6px);
        background: rgba(255, 255, 255, 0.88);
        border-color: rgba(99, 102, 241, 0.35);
        box-shadow: 0 15px 40px rgba(99, 102, 241, 0.12);
        transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        transition-delay: 0s !important; /* 호버 시에는 딜레이 없이 즉시 작동 */

        .card-glow-overlay {
          opacity: 1;
        }

        .card-icon-wrapper {
          background: rgba(99, 102, 241, 0.12);
          border-color: rgba(99, 102, 241, 0.25);
          color: #4f46e5;
        }

        .btn-explore {
          color: #0f172a;
          .arrow-icon {
            transform: translateX(4px);
          }
        }
      }
    }
  }

  /* 최초 로드 애니메이션 활성화 클래스 */
  &.page-loaded {
    .back-btn {
      opacity: 0.75;
      transform: translateX(0);
    }

    .header-section {
      .logo-container,
      .page-title,
      .page-subtitle {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .main-cards-container {
      .main-card {
        opacity: 1;
        transform: translateY(0);
      }
    }
  }

  /* 모달 오버레이 */
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(15, 23, 42, 0.45); /* 가볍게 뒤의 화사함이 비치도록 투명도 조절 */
    backdrop-filter: blur(12px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 100;
    padding: 1.5rem;
    box-sizing: border-box;
  }

  /* 모달 컨테이너 공통 */
  .modal-container {
    position: relative;
    background: rgba(255, 255, 255, 0.96); /* 라이트 모드 글래스모피즘 */
    border: 1px solid rgba(255, 255, 255, 0.8);
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.15), 0 0 30px rgba(99, 102, 241, 0.05);
    border-radius: 24px;
    padding: 3rem;
    color: #0f172a; /* 어두운 차콜 */
    box-sizing: border-box;
    max-height: 90vh;
    overflow-y: auto;
    scrollbar-width: thin;
    scrollbar-color: rgba(0, 0, 0, 0.1) transparent;

    &::-webkit-scrollbar {
      width: 6px;
    }
    &::-webkit-scrollbar-thumb {
      background: rgba(0, 0, 0, 0.15);
      border-radius: 3px;
    }

    .modal-close {
      position: absolute;
      top: 1.5rem;
      right: 1.5rem;
      background: rgba(0, 0, 0, 0.03);
      border: 1px solid rgba(0, 0, 0, 0.06);
      color: #64748b;
      width: 36px;
      height: 36px;
      border-radius: 50%;
      font-size: 1.5rem;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      line-height: 1;
      transition: all 0.3s ease;

      &:hover {
        background: rgba(239, 68, 68, 0.08);
        color: #ef4444;
        border-color: rgba(239, 68, 68, 0.2);
      }
    }

    .modal-header-title {
      font-size: 2rem;
      font-weight: 700;
      margin-bottom: 2rem;
      text-align: center;
      background: linear-gradient(135deg, #0f172a 40%, #4f46e5 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
  }

  /* 개요 모달 스타일 (카카오톡 채팅방 UI) */
  .chat-modal-container {
    width: 100%;
    max-width: 520px !important; /* 채팅방에 알맞은 컴팩트 가로폭 */
    height: 80vh;
    padding: 0 !important; /* 카톡 내부 여백을 위해 기존 패딩 제거 */
    overflow: hidden !important;
    display: flex;
    flex-direction: column;
    background: #bacee0 !important; /* 카카오톡 기본 배경색 */
    border: 1px solid rgba(0, 0, 0, 0.15) !important;
    
    .chat-modal-close {
      top: 1rem !important;
      right: 1rem !important;
      z-index: 10;
      background: rgba(0, 0, 0, 0.2) !important;
      color: #ffffff !important;
      border: none !important;
      
      &:hover {
        background: rgba(239, 68, 68, 0.8) !important;
        color: #ffffff !important;
      }
    }
  }

  .kakao-chat-room {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    cursor: pointer; /* 대화방 전체가 클릭 가능한 액터임을 유도 */
    user-select: none;
    position: relative;

    .chat-header {
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(8px);
      padding: 1.2rem 1.5rem;
      border-bottom: 1px solid rgba(0, 0, 0, 0.08);
      display: flex;
      flex-direction: column;
      gap: 0.2rem;
      flex-shrink: 0;

      .chat-title {
        font-size: 1.15rem;
        font-weight: 800;
        color: #1f2937;
      }

      .chat-subtitle {
        font-size: 0.8rem;
        color: #6b7280;
        font-weight: 500;
      }
    }

    .chat-bubble-area {
      flex: 1;
      padding: 1.5rem;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      scrollbar-width: thin;
      scrollbar-color: rgba(0, 0, 0, 0.15) transparent;

      &::-webkit-scrollbar {
        width: 6px;
      }
      &::-webkit-scrollbar-thumb {
        background: rgba(0, 0, 0, 0.15);
        border-radius: 3px;
      }
    }

    .chat-messages-container {
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
      min-height: 100%;
      gap: 1.2rem;
      padding-bottom: 3.5rem; /* 하단 클릭 가이드바 레이어와 겹치지 않도록 여유 패딩 추가 */
    }

    .chat-bubble-row {
      display: flex;
      width: 100%;

      /* 상대방 메시지: 가로 flex 정렬하여 프로필 원형 아바타를 왼쪽에 배치 */
      &.row-other {
        flex-direction: row;
        align-items: flex-start;
        gap: 0.6rem;

        .profile-img-box {
          width: 40px;
          height: 40px;
          border-radius: 50%; /* 완전 원형 아바타 */
          background: #ffffff; /* 하얀색 배경 */
          border: 1px solid rgba(0, 0, 0, 0.08);
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          flex-shrink: 0;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);

          .profile-img {
            width: 100%;
            height: 100%;
            object-fit: contain;
            padding: 3px; /* 로고와 테두리간 여백 제공 */
          }
        }

        .message-content-box {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 0.25rem;
          max-width: 80%;

          .profile-name {
            font-size: 0.82rem;
            font-weight: 600;
            color: #4b5563;
          }
        }

        .bubble-container {
          position: relative;
        }

        .chat-bubble {
          background: #ffffff;
          color: #1f2937;
          border-radius: 4px 12px 12px 12px; /* 카톡 왼쪽 말풍선 둥글기 */
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          position: relative;

          /* 말풍선 왼쪽 꼬리표 */
          &::before {
            content: '';
            position: absolute;
            top: 10px;
            left: -6px;
            width: 0;
            height: 0;
            border-top: 6px solid transparent;
            border-bottom: 6px solid transparent;
            border-right: 6px solid #ffffff;
          }
        }
      }

      /* 내 메시지: 기존 우측 정렬 유지 */
      &.row-me {
        flex-direction: column;
        align-items: flex-end;

        .bubble-container {
          max-width: 85%;
          position: relative;
        }

        .chat-bubble {
          background: #fef01b; /* 카톡 노란색 */
          color: #1e293b;
          border-radius: 12px 4px 12px 12px; /* 카톡 오른쪽 말풍선 둥글기 */
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
          position: relative;

          /* 말풍선 오른쪽 꼬리표 */
          &::before {
            content: '';
            position: absolute;
            top: 10px;
            right: -6px;
            width: 0;
            height: 0;
            border-top: 6px solid transparent;
            border-bottom: 6px solid transparent;
            border-left: 6px solid #fef01b;
          }
        }
      }

      .chat-bubble {
        padding: 0.8rem 1rem;
        word-break: break-all;
        white-space: pre-line; /* 줄바꿈 렌더링 유지 */
        display: inline-block;

        .bubble-text {
          font-size: 0.98rem;
          line-height: 1.5;
          font-weight: 500;
        }
      }
    }

    .chat-reset-row {
      display: flex;
      justify-content: center;
      margin-top: 1.5rem;
      margin-bottom: 1rem;

      .chat-reset-btn {
        background: #374151;
        border: none;
        color: #ffffff;
        padding: 0.7rem 1.2rem;
        border-radius: 50px;
        font-size: 0.9rem;
        font-weight: 600;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        cursor: pointer;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        transition: all 0.2s ease;

        .reset-icon {
          width: 16px;
          height: 16px;
        }

        &:hover {
          background: #1f2937;
          transform: scale(1.02);
        }
      }
    }

    .chat-bottom-guide {
      position: absolute;
      bottom: 0;
      left: 0;
      width: 100%;
      background: rgba(0, 0, 0, 0.6);
      color: #ffffff;
      text-align: center;
      padding: 0.6rem 0;
      font-size: 0.85rem;
      font-weight: 600;
      letter-spacing: -0.01em;
      pointer-events: none; /* 클릭 이벤트가 대화방으로 흐르도록 처리 */
      z-index: 5;
      animation: fadeInUpGuide 0.4s ease;

      .guide-animate {
        display: inline-block;
        animation: pulseText 1.5s infinite;
      }
    }
  }

  /* 구분 모달 스타일 */
  .classification-modal {
    width: 100%;
    max-width: 1100px;
    height: 92vh; /* 높이값 확장 */
    overflow-y: hidden;
    display: flex;
    flex-direction: column;

    .classification-modal-content {
      display: flex;
      flex-direction: column;
      height: 100%;
      overflow: hidden;
    }

    /* 주요등장인물 + 상세구조 통합 스크롤 컨테이너 */
    .modal-scrollable-content {
      flex: 1;
      overflow-y: auto;
      padding-right: 0.5rem;
      scrollbar-width: thin;
      scrollbar-color: rgba(0, 0, 0, 0.15) transparent;

      &::-webkit-scrollbar {
        width: 6px;
      }
      &::-webkit-scrollbar-thumb {
        background: rgba(0, 0, 0, 0.15);
        border-radius: 3px;
      }
    }

    .accordion-container {
      flex-shrink: 0;
      display: flex;
      gap: 1rem;
      width: 100%;
      height: 180px;
      margin-bottom: 2rem;

      .accordion-item {
        flex: 1.2;
        background: rgba(241, 245, 249, 0.55);
        border: 1px solid rgba(0, 0, 0, 0.05);
        border-radius: 16px;
        display: flex;
        overflow: hidden;
        cursor: pointer;
        position: relative;
        transition: flex 0.6s cubic-bezier(0.16, 1, 0.3, 1), background-color 0.4s ease, border-color 0.4s ease;

        .accordion-tab-bar {
          min-width: 60px;
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: space-between;
          background: rgba(0, 0, 0, 0.01);
          border-right: 1px solid rgba(0, 0, 0, 0.03);
          padding: 2.2rem 0.5rem;
          box-sizing: border-box;
          transition: all 0.3s ease;

          .tab-index {
            font-size: 0.8rem;
            font-weight: 700;
            color: rgba(100, 116, 139, 0.45);
            letter-spacing: 0.1em;
            transition: color 0.3s ease;
          }

          .chapter-badge {
            display: inline-block;
            font-size: 1.05rem;
            font-weight: 700;
            color: #64748b;
            letter-spacing: 0.05em;
            white-space: nowrap;
            transform: rotate(-90deg);
            transform-origin: center;
            margin-bottom: 1.5rem;
            transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
          }
        }

        .accordion-body {
          flex: 1;
          min-width: 550px;
          padding: 2rem;
          display: flex;
          align-items: center;
          opacity: 0;
          visibility: hidden;
          transition: opacity 0.3s ease, visibility 0.3s ease;
          box-sizing: border-box;

          .accordion-inner-content {
            display: flex;
            flex-direction: column;
            width: 100%;

            .segment-number {
              font-size: 0.8rem;
              font-weight: 700;
              color: #4f46e5;
              letter-spacing: 0.15em;
              text-transform: uppercase;
              margin-bottom: 0.4rem;
            }

            .accordion-theme {
              font-size: 1.45rem;
              font-weight: 700;
              color: #0f172a;
              margin: 0 0 0.8rem 0;
            }

            .accordion-divider {
              width: 40px;
              height: 2px;
              background: #4f46e5;
              margin-bottom: 0.8rem;
            }

            .accordion-target {
              margin: 0;
              font-size: 0.95rem;
              line-height: 1.5;
              display: flex;
              flex-direction: column;
              gap: 0.2rem;

              .label {
                font-size: 0.75rem;
                color: #64748b;
                font-weight: 600;
              }

              .value {
                color: #334155;
              }
            }
          }
        }

        &:hover {
          background: rgba(241, 245, 249, 0.8);
          border-color: rgba(99, 102, 241, 0.25);

          .accordion-tab-bar .chapter-badge {
            color: #0f172a;
          }
        }

        &.expanded {
          flex: 7;
          background: linear-gradient(135deg, rgba(241, 245, 249, 0.92) 0%, rgba(255, 255, 255, 0.96) 100%);
          border-color: rgba(99, 102, 241, 0.35);
          cursor: default;

          .accordion-tab-bar {
            background: rgba(99, 102, 241, 0.05);
            border-color: rgba(99, 102, 241, 0.1);
            min-width: 85px;

            .tab-index {
              color: #4f46e5;
            }

            .chapter-badge {
              color: #4f46e5;
              transform: rotate(0deg);
              margin-bottom: 0;
            }
          }

          .accordion-body {
            opacity: 1;
            visibility: visible;
          }
        }
      }
    }

    .tab-container {
      display: none;
      width: 100%;
      margin-bottom: 2.5rem;

      .tabs-header {
        display: flex;
        border-bottom: 1px solid rgba(0, 0, 0, 0.08);
        margin-bottom: 1.5rem;
        gap: 0.5rem;

        .tab-btn {
          flex: 1;
          background: none;
          border: none;
          color: #64748b;
          font-size: 0.95rem;
          font-weight: 600;
          padding: 0.8rem 0;
          cursor: pointer;
          position: relative;
          transition: all 0.3s ease;

          &::after {
            content: '';
            position: absolute;
            bottom: -1px;
            left: 0;
            width: 100%;
            height: 2px;
            background: #4f46e5;
            transform: scaleX(0);
            transition: transform 0.3s ease;
          }

          &.active {
            color: #0f172a;

            &::after {
              transform: scaleX(1);
            }
          }
        }
      }

      .tab-body {
        background: rgba(241, 245, 249, 0.7);
        border: 1px solid rgba(0, 0, 0, 0.04);
        border-radius: 16px;
        padding: 1.8rem;

        .tab-inner-content {
          .segment-number {
            font-size: 0.75rem;
            font-weight: 700;
            color: #4f46e5;
            letter-spacing: 0.15em;
            display: block;
            margin-bottom: 0.3rem;
          }

          .tab-theme {
            font-size: 1.25rem;
            font-weight: 700;
            color: #0f172a;
            margin: 0 0 0.8rem 0;
          }

          .tab-divider {
            width: 30px;
            height: 2px;
            background: #4f46e5;
            margin-bottom: 0.8rem;
          }

          .tab-target {
            margin: 0;
            font-size: 0.9rem;
            line-height: 1.5;
            display: flex;
            flex-direction: column;
            gap: 0.1rem;

            .label {
              font-size: 0.7rem;
              color: #64748b;
              font-weight: 600;
            }

            .value {
              color: #334155;
            }
          }
        }
      }
    }

    /* 캐릭터 선택창 섹션 스타일 (미니멀화) */
    .characters-section {
      margin-top: 0.5rem;
      margin-bottom: 2rem;
      flex-shrink: 0;

      .section-title {
        font-size: 1.1rem;
        font-weight: 700;
        color: #475569;
        display: flex;
        align-items: center;
        gap: 1rem;
        margin-bottom: 1.5rem;

        .title-text {
          letter-spacing: -0.01em;
        }

        .accent-line {
          flex: 1;
          height: 1px;
          background: linear-gradient(90deg, rgba(99, 102, 241, 0.15) 0%, transparent 100%);
        }
      }

      .character-simple-list {
        display: flex;
        gap: 2rem;
        flex-wrap: wrap;
        justify-content: flex-start;
        padding-left: 0.5rem;
      }

      .char-simple-item {
        background: none;
        border: none;
        padding: 0;
        cursor: pointer;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.8rem;
        transition: transform 0.2s ease;

        .char-avatar-box {
          width: 80px;
          height: 80px;
          border-radius: 20px; /* 모서리가 정교하게 깎인 둥근 사각형 */
          overflow: hidden;
          background: rgba(255, 255, 255, 0.6);
          border: 1px solid rgba(0, 0, 0, 0.08);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);

          img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }

          span {
            font-size: 1.6rem;
            font-weight: 800;
            color: #4f46e5;
          }
        }

        .char-name-label {
          font-size: 0.95rem;
          font-weight: 600;
          color: #334155;
          transition: all 0.3s ease;
        }

        /* Hover & Active Effects */
        &:hover {
          transform: translateY(-2px);
          
          .char-avatar-box {
            border-color: rgba(99, 102, 241, 0.3);
            box-shadow: 0 4px 12px rgba(99, 102, 241, 0.08);
          }
          
          .char-name-label {
            color: #4f46e5;
          }
        }

        &.active {
          .char-avatar-box {
            border-color: transparent; /* 테두리 두께를 유지하여 레이아웃 흔들림 방지 */
            box-shadow: 0 0 0 3.5px #4f46e5, 0 6px 20px rgba(99, 102, 241, 0.15);
            background: #e0e7ff;
            
            span {
              color: #4f46e5;
            }
          }

          .char-name-label {
            color: #4f46e5;
            font-weight: 700;
          }
        }
      }
    }

    .details-container {
      margin-top: 0.5rem;
      flex: 1;

      .details-title {
        font-size: 1.15rem;
        font-weight: 700;
        color: #475569; /* 가독성 강화 */
        display: flex;
        align-items: center;
        gap: 1rem;
        margin-bottom: 1.5rem;

        .title-text {
          letter-spacing: -0.01em;
        }

        .accent-line {
          flex: 1;
          height: 1px;
          background: linear-gradient(90deg, rgba(99, 102, 241, 0.15) 0%, transparent 100%);
        }
      }

      .cards-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
        gap: 1.5rem;
        min-height: 200px; /* 전환 시 높이 붕괴 방지 */
      }

      .detail-card {
        background: rgba(255, 255, 255, 0.7); /* 화사한 라이트 모드 카드 */
        border: 1px solid rgba(99, 102, 241, 0.1);
        border-radius: 16px;
        padding: 1.8rem;
        transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        display: flex;
        flex-direction: column;

        .card-header-row {
          margin-bottom: 1rem;
        }

        .card-chapter-range {
          background: rgba(99, 102, 241, 0.08);
          border: 1px solid rgba(99, 102, 241, 0.18);
          color: #4f46e5; /* 짙은 인디고 */
          font-size: 0.75rem;
          font-weight: 700;
          padding: 0.3rem 0.7rem;
          border-radius: 50px;
        }

        .card-sub-title {
          font-size: 1.15rem;
          font-weight: 700;
          color: #0f172a; /* 짙은 차콜 */
          margin: 0 0 0.8rem 0;
          line-height: 1.4;
        }

        .card-desc-text {
          font-size: 0.95rem;
          color: #334155; /* 가독성을 위한 짙은 회색 */
          line-height: 1.6;
          margin: 0;
          font-weight: 400; /* 좀 더 또렷한 굵기 */
          word-break: keep-all;
        }

        &:hover {
          background: rgba(255, 255, 255, 0.95);
          border-color: rgba(99, 102, 241, 0.3);
          box-shadow: 0 10px 25px rgba(99, 102, 241, 0.06);
          transform: translateY(-3px);
        }
      }
    }
  }

  /* 반응형 분기 (768px 미만 - 모바일 스위칭) */
  @media screen and (max-width: 768px) {
    padding: 3rem 1.2rem;

    .back-btn {
      top: 1.5rem;
      left: 1.5rem;
      padding: 0.5rem 1rem;
      font-size: 12px; /* 최소 폰트 12px 적용 */
    }

    .header-section {
      margin-bottom: 3rem;
      .page-title {
        font-size: 2.2rem;
      }
      .page-subtitle {
        font-size: 14px; /* 18.4px -> 14px */
      }
    }

    .main-cards-container {
      flex-direction: column;
      gap: 1.5rem;
      padding: 0 0.5rem;

      .main-card {
        padding: 2.5rem 2rem;
        
        .card-title {
          font-size: 1.5rem;
        }
        .card-desc {
          margin-bottom: 1.8rem;
          font-size: 13px; /* 16px -> 13px */
        }
        .btn-explore {
          font-size: 13px;
        }
      }
    }

    .modal-container {
      padding: 2rem 1.5rem;
      width: 100%;
      border-radius: 20px;

      .modal-header-title {
        font-size: 1.5rem;
        margin-bottom: 1.5rem;
      }
    }

    /* 카카오톡 모바일 폰트 최적화 */
    .kakao-chat-room {
      .chat-header {
        padding: 1rem 1.2rem;
        
        .chat-title {
          font-size: 15px; /* 18.4px -> 15px */
        }
        .chat-subtitle {
          font-size: 12px; /* 최소 폰트 12px 적용 */
        }
      }

      .chat-bubble-area {
        padding: 1.2rem;
      }

      .chat-bubble-row.row-other {
        .message-content-box .profile-name {
          font-size: 12px; /* 최소 폰트 12px 적용 */
        }
      }

      .chat-bubble-row {
        .chat-bubble {
          padding: 0.7rem 0.9rem;
          
          .bubble-text {
            font-size: 13px !important; /* 모바일에서 13px 강제 적용 (데스크톱 가중치 극복 및 최소 12px 기준 충족) */
          }
        }
      }

      .chat-reset-row .chat-reset-btn {
        font-size: 12px; /* 최소 폰트 12px 적용 */
        padding: 0.6rem 1rem;
      }

      .chat-bottom-guide {
        font-size: 12px; /* 최소 폰트 12px 적용 */
        padding: 0.5rem 0;
      }
    }

    .classification-modal {
      height: 90vh; /* 모바일 기기에서는 더 넉넉히 90vh로 크기 고정 */

      /* 데스크톱 가로 아코디언 비활성화 */
      .desktop-only {
        display: none !important;
      }

      /* 모바일 전용 탭 활성화 */
      .mobile-only {
        display: block !important;
      }

      .tab-container {
        flex-shrink: 0; /* 모바일 상단 탭 영역 찌그러짐 방지 */
        margin-bottom: 1.5rem;
        
        .tabs-header .tab-btn {
          font-size: 13px;
        }

        .tab-body {
          padding: 1.2rem;
          
          .tab-inner-content {
            .segment-number {
              font-size: 12px; /* 최소 폰트 12px 적용 */
            }
            .tab-theme {
              font-size: 16px; /* 20px -> 16px */
            }
            .tab-target {
              .label {
                font-size: 12px; /* 최소 폰트 12px 적용 */
              }
              .value {
                font-size: 13px; /* 14.4px -> 13px */
              }
            }
          }
        }
      }

      .characters-section {
        margin-bottom: 1.2rem;

        .character-selector-simple-container {
          padding: 0.8rem;
        }

        .character-simple-list {
          gap: 1.2rem;
          justify-content: center; /* 중앙 정렬 */

          .char-simple-item {
            gap: 0.5rem;

            .char-avatar-box {
              width: 60px;
              height: 60px;
              border-radius: 15px; /* 모서리가 둥근 사각형 */
              
              span {
                font-size: 1.3rem;
              }
            }

            .char-name-label {
              font-size: 12px; /* 최소 폰트 12px 적용 */
            }
          }
        }
      }

      .details-container {
        .details-title {
          font-size: 14px; /* 17.6px -> 14px */
          margin-bottom: 1.2rem;
        }

        .detail-card {
          padding: 1.2rem;
          
          .card-chapter-range {
            font-size: 12px; /* 최소 폰트 12px 적용 */
          }
          .card-sub-title {
            font-size: 14px; /* 18.4px -> 14px */
          }
          .card-desc-text {
            font-size: 13px; /* 15.2px -> 13px */
          }
        }
      }
    }
  }

  /* 450px 이하 초미니 모바일 대응 */
  @media screen and (max-width: 450px) {
    .header-section .page-title {
      font-size: 1.8rem;
    }

    .modal-container {
      padding: 1.5rem 1rem;
      
      .modal-close {
        top: 1rem;
        right: 1rem;
        width: 32px;
        height: 32px;
        font-size: 1.2rem;
      }
    }
  }
}

/* 키프레임 애니메이션 */
@keyframes bounce {
  0%, 20%, 50%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-6px);
  }
  60% {
    transform: translateY(-3px);
  }
}

/* 모달 페이드 트랜지션 */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.4s ease;
  
  .modal-container {
    transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.4s ease;
  }
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;

  .modal-container {
    transform: scale(0.95) translateY(10px);
    opacity: 0;
  }
}

/* 리스트 페이드 트랜지션 (카드 목록 전환) */
.card-list-enter-active,
.card-list-leave-active {
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.card-list-enter-from {
  opacity: 0;
  transform: translateY(15px);
}

.card-list-leave-to {
  opacity: 0;
  transform: translateY(-15px);
  position: absolute; /* 퇴장 시 공간 차지를 방지하여 부드러운 그리드 리셋 유도 */
}

/* grid 리스트 이동 트랜지션 */
.card-list-move {
  transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

/* 로고 교차 페이드 트랜지션 */
.logo-fade-enter-active,
.logo-fade-leave-active {
  transition: opacity 1.5s cubic-bezier(0.4, 0, 0.2, 1);
}
.logo-fade-enter-from,
.logo-fade-leave-to {
  opacity: 0;
}

/* 단락 전환 페이드업 트랜지션 */
.segment-fade-up-enter-active,
.segment-fade-up-leave-active {
  transition: opacity 0.35s ease, transform 0.35s cubic-bezier(0.16, 1, 0.3, 1);
}

.segment-fade-up-enter-from {
  opacity: 0;
  transform: translateY(12px);
}

.segment-fade-up-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

/* 카톡 말풍선 페이드인 & 슬라이드업 애니메이션 */
.chat-bubble-fade-enter-active {
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}
.chat-bubble-fade-enter-from {
  opacity: 0;
  transform: translateY(28px);
}
</style>

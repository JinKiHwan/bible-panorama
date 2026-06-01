<script setup>
import { ref, computed } from 'vue';
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

// [개요] 블라인드 해제 상태 (A안: 영역별 직접 클릭 해제)
const themeUnlocked = ref(false);
const verseUnlocked = ref(false);

const openOverview = () => {
  showOverview.value = true;
  themeUnlocked.value = false;
  verseUnlocked.value = false;
};

const closeOverview = () => {
  showOverview.value = false;
};

// [구분] 활성화된 단락 ID
const activeSegmentId = ref(1);

const openClassification = () => {
  showClassification.value = true;
  activeSegmentId.value = 1;
};

const closeClassification = () => {
  showClassification.value = false;
};

// 현재 활성화된 단락 데이터
const currentSegment = computed(() => {
  return actSummaryData.find(item => item.id === activeSegmentId.value) || actSummaryData[0];
});
</script>

<template>
  <div class="act-summary-page">
    <!-- 은은한 미니멀 백버튼 -->
    <button class="back-btn" @click="goBack" aria-label="메인 화면으로 돌아가기">
      <span class="arrow">←</span>
      <span class="text">Back</span>
    </button>

    <!-- 배경 데코레이션 블러 서클 -->
    <div class="glow-bg-circle circle-1"></div>
    <div class="glow-bg-circle circle-2"></div>

    <!-- 타이틀 영역 -->
    <div class="header-section">
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

    <!-- [개요] 팝업 모달 -->
    <transition name="modal-fade">
      <div v-if="showOverview" class="modal-overlay" @click.self="closeOverview">
        <div class="modal-container overview-modal">
          <button class="modal-close" @click="closeOverview" aria-label="닫기">&times;</button>
          
          <div class="overview-modal-content">
            <h3 class="modal-header-title">사도행전 개요</h3>
            
            <!-- 상단 주제 영역 -->
            <div class="overview-section theme-section" @click="themeUnlocked = true">
              <div class="section-label">주제</div>
              <div class="section-body">
                <span class="theme-text">주제 : 하나님의 사람들이 펼쳐가는 성령행전</span>
              </div>
              <!-- 블라인드 레이어 -->
              <div class="blind-layer" :class="{ 'unlocked': themeUnlocked }">
                <div class="blind-hint">
                  <span class="click-icon">🖱️</span>
                  <span>클릭하여 주제 공개</span>
                </div>
              </div>
            </div>

            <!-- 하단 핵심구절 영역 -->
            <div class="overview-section verse-section" @click="verseUnlocked = true">
              <div class="section-label">핵심 구절</div>
              <div class="section-body">
                <blockquote class="verse-text">
                  “오직 성령이 너희에게 임하시면 너희가 권능을 받고, 예루살렘과 온 유대와 사마리아와 땅끝까지 이르러 내 증인이 되리라 하시니라”
                  <span class="verse-ref">사도행전 1장 8절</span>
                </blockquote>
              </div>
              <!-- 블라인드 레이어 -->
              <div class="blind-layer" :class="{ 'unlocked': verseUnlocked }">
                <div class="blind-hint">
                  <span class="click-icon">🖱️</span>
                  <span>클릭하여 핵심구절 공개</span>
                </div>
              </div>
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
                  <p class="card-desc-text">{{ chap.description }}</p>
                </div>
              </transition-group>
            </div>
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
  background: radial-gradient(circle at center, #0f172a 0%, #020617 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  overflow-x: hidden;
  box-sizing: border-box;

  /* 미니멀 백버튼 (opacity 0.3 -> hover 1.0) */
  .back-btn {
    position: absolute;
    top: 2.5rem;
    left: 2.5rem;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 50px;
    padding: 0.6rem 1.2rem;
    color: #f8fafc;
    font-size: 0.95rem;
    font-weight: 500;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    opacity: 0.35;
    backdrop-filter: blur(4px);
    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    z-index: 10;

    .arrow {
      transition: transform 0.3s ease;
    }

    &:hover {
      opacity: 1;
      background: rgba(255, 255, 255, 0.08);
      border-color: rgba(99, 102, 241, 0.4);
      box-shadow: 0 0 15px rgba(99, 102, 241, 0.2);
      transform: translateY(-1px);

      .arrow {
        transform: translateX(-3px);
      }
    }
  }

  /* 은은한 배경 글로우 서클 */
  .glow-bg-circle {
    position: absolute;
    border-radius: 50%;
    filter: blur(140px);
    pointer-events: none;
    opacity: 0.15;
    z-index: 0;

    &.circle-1 {
      width: 400px;
      height: 400px;
      background: #6366f1;
      top: 10%;
      left: 10%;
    }

    &.circle-2 {
      width: 450px;
      height: 450px;
      background: #06b6d4;
      bottom: 10%;
      right: 10%;
    }
  }

  /* 헤더 섹션 */
  .header-section {
    text-align: center;
    margin-bottom: 4.5rem;
    z-index: 1;

    .page-title {
      font-size: 2.8rem;
      font-weight: 800;
      letter-spacing: -0.03em;
      background: linear-gradient(135deg, #f8fafc 30%, #94a3b8 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      margin-bottom: 0.8rem;
    }

    .page-subtitle {
      font-size: 1.15rem;
      color: #94a3b8;
      font-weight: 300;
      letter-spacing: -0.01em;
    }
  }

  /* 메인 카드 레이아웃 */
  .main-cards-container {
    display: flex;
    gap: 2.5rem;
    width: 100%;
    max-width: 900px;
    z-index: 1;

    .main-card {
      flex: 1;
      position: relative;
      background: rgba(15, 23, 42, 0.45);
      border: 1px solid rgba(255, 255, 255, 0.05);
      border-radius: 20px;
      padding: 3rem 2.5rem;
      cursor: pointer;
      overflow: hidden;
      backdrop-filter: blur(12px);
      transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);

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
        background: rgba(255, 255, 255, 0.03);
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 14px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #818cf8;
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
        color: #f8fafc;
        margin-bottom: 0.8rem;
        letter-spacing: 0.05em;
      }

      .card-desc {
        font-size: 1rem;
        color: #94a3b8;
        line-height: 1.6;
        margin-bottom: 2.5rem;
        font-weight: 300;
      }

      .btn-explore {
        margin-top: auto;
        font-size: 1rem;
        font-weight: 500;
        color: #a5b4fc;
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
        background: rgba(15, 23, 42, 0.6);
        border-color: rgba(99, 102, 241, 0.35);
        box-shadow: 0 15px 40px rgba(99, 102, 241, 0.12);

        .card-glow-overlay {
          opacity: 1;
        }

        .card-icon-wrapper {
          background: rgba(99, 102, 241, 0.1);
          border-color: rgba(99, 102, 241, 0.3);
          color: #a5b4fc;
        }

        .btn-explore {
          color: #f8fafc;
          .arrow-icon {
            transform: translateX(4px);
          }
        }
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
    background: rgba(2, 6, 17, 0.8);
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
    background: rgba(15, 23, 42, 0.9);
    border: 1px solid rgba(255, 255, 255, 0.08);
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 40px rgba(99, 102, 241, 0.1);
    border-radius: 24px;
    padding: 3rem;
    color: #f8fafc;
    box-sizing: border-box;
    max-height: 90vh;
    overflow-y: auto;
    scrollbar-width: thin;
    scrollbar-color: rgba(255, 255, 255, 0.1) transparent;

    &::-webkit-scrollbar {
      width: 6px;
    }
    &::-webkit-scrollbar-thumb {
      background: rgba(255, 255, 255, 0.1);
      border-radius: 3px;
    }

    .modal-close {
      position: absolute;
      top: 1.5rem;
      right: 1.5rem;
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(255, 255, 255, 0.08);
      color: #94a3b8;
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
        background: rgba(239, 68, 68, 0.1);
        color: #ef4444;
        border-color: rgba(239, 68, 68, 0.3);
      }
    }

    .modal-header-title {
      font-size: 2rem;
      font-weight: 700;
      margin-bottom: 2rem;
      text-align: center;
      background: linear-gradient(135deg, #f8fafc 40%, #818cf8 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
  }

  /* 개요 모달 스타일 */
  .overview-modal {
    width: 100%;
    max-width: 600px;

    .overview-section {
      position: relative;
      background: rgba(30, 41, 59, 0.35);
      border: 1px solid rgba(255, 255, 255, 0.04);
      border-radius: 16px;
      padding: 2.2rem 2rem;
      margin-bottom: 1.8rem;
      overflow: hidden;
      cursor: pointer;

      &:last-child {
        margin-bottom: 0;
      }

      .section-label {
        font-size: 0.8rem;
        text-transform: uppercase;
        letter-spacing: 0.1em;
        color: #818cf8;
        font-weight: 600;
        margin-bottom: 0.8rem;
      }

      /* 본래 텍스트 콘텐츠 */
      .theme-text {
        font-size: 1.35rem;
        font-weight: 700;
        color: #fbbf24; /* 매력적인 골드 톤 */
        letter-spacing: -0.01em;
      }

      .verse-text {
        font-size: 1.2rem;
        line-height: 1.7;
        font-weight: 400;
        color: #f1f5f9;
        margin: 0;
        font-style: italic;

        .verse-ref {
          display: block;
          margin-top: 0.8rem;
          font-size: 0.9rem;
          font-style: normal;
          color: #94a3b8;
          font-weight: 500;
        }
      }

      /* 블라인드 오버레이 레이어 (A안) */
      .blind-layer {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(15, 23, 42, 0.92);
        backdrop-filter: blur(14px);
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        opacity: 1;
        pointer-events: auto;
        z-index: 2;

        .blind-hint {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
          color: #94a3b8;
          font-size: 0.9rem;
          font-weight: 400;
          transition: all 0.3s ease;

          .click-icon {
            font-size: 1.4rem;
            animation: bounce 2s infinite;
          }
        }

        &:hover .blind-hint {
          color: #a5b4fc;
          text-shadow: 0 0 10px rgba(99, 102, 241, 0.4);
        }

        /* 해제 상태 */
        &.unlocked {
          opacity: 0;
          pointer-events: none;
          transform: scale(1.05);
        }
      }
    }
  }

  /* 구분 모달 스타일 */
  .classification-modal {
    width: 100%;
    max-width: 1100px;
    height: 85vh; /* 화면의 85% 고정 높이 */
    overflow-y: hidden; /* 모달 본체의 스크롤을 차단 */
    display: flex;
    flex-direction: column;

    .classification-modal-content {
      display: flex;
      flex-direction: column;
      height: 100%;
      overflow: hidden;
    }

    /* 1. 데스크톱 가로 아코디언 */
    .accordion-container {
      flex-shrink: 0; /* 상단 높이 보존 */
      display: flex;
      gap: 1rem;
      width: 100%;
      height: 180px;
      margin-bottom: 2rem;

      .accordion-item {
        flex: 1.2;
        background: rgba(30, 41, 59, 0.3);
        border: 1px solid rgba(255, 255, 255, 0.05);
        border-radius: 16px;
        display: flex;
        overflow: hidden;
        cursor: pointer;
        position: relative;
        transition: flex 0.6s cubic-bezier(0.16, 1, 0.3, 1), background-color 0.4s ease, border-color 0.4s ease;

        /* 기본 헤더(축소되었을 때 세로줄 형태나 작게 표시되는 텍스트) */
        .accordion-tab-bar {
          min-width: 60px;
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: space-between; /* 03과 장 범위 텍스트가 겹치지 않도록 분산 */
          background: rgba(255, 255, 255, 0.02);
          border-right: 1px solid rgba(255, 255, 255, 0.03);
          padding: 2.2rem 0.5rem;
          box-sizing: border-box;
          transition: all 0.3s ease;

          .tab-index {
            font-size: 0.8rem;
            font-weight: 700;
            color: rgba(148, 163, 184, 0.35);
            letter-spacing: 0.1em;
            transition: color 0.3s ease;
          }

          .chapter-badge {
            display: inline-block;
            font-size: 1.05rem;
            font-weight: 700;
            color: #94a3b8;
            letter-spacing: 0.05em;
            white-space: nowrap;
            transform: rotate(-90deg); /* 한글/숫자 방향을 90도 눕혀서 가독성 및 정렬 최적화 */
            transform-origin: center;
            margin-bottom: 1.5rem; /* 세로 회전 시 중앙 밸런스를 맞추기 위한 여백 */
            transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
          }
        }

        /* 확장 영역 */
        .accordion-body {
          flex: 1;
          min-width: 550px; /* 텍스트 찌그러짐 방지를 위해 최소 가로폭 고정 */
          padding: 2rem;
          display: flex;
          align-items: center;
          opacity: 0;
          visibility: hidden;
          transition: opacity 0.3s ease, visibility 0.3s ease; /* 전환 딜레이를 제거해 빠른 사라짐 연출 */
          box-sizing: border-box;

          .accordion-inner-content {
            display: flex;
            flex-direction: column;
            width: 100%;

            .segment-number {
              font-size: 0.8rem;
              font-weight: 700;
              color: #818cf8;
              letter-spacing: 0.15em;
              text-transform: uppercase;
              margin-bottom: 0.4rem;
            }

            .accordion-theme {
              font-size: 1.45rem;
              font-weight: 700;
              color: #f8fafc;
              margin: 0 0 0.8rem 0;
            }

            .accordion-divider {
              width: 40px;
              height: 2px;
              background: #818cf8;
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
                color: #cbd5e1;
              }
            }
          }
        }

        /* Hover */
        &:hover {
          background: rgba(30, 41, 59, 0.45);
          border-color: rgba(99, 102, 241, 0.2);

          .accordion-tab-bar .chapter-badge {
            color: #f8fafc;
          }
        }

        /* Expanded State (flex: 7) */
        &.expanded {
          flex: 7;
          background: linear-gradient(135deg, rgba(30, 41, 59, 0.6) 0%, rgba(15, 23, 42, 0.8) 100%);
          border-color: rgba(99, 102, 241, 0.4);
          cursor: default;

          .accordion-tab-bar {
            background: rgba(99, 102, 241, 0.08);
            border-color: rgba(99, 102, 241, 0.15);
            min-width: 85px; /* 확장되었을 때는 가로폭을 좀 더 넓게 확보 */

            .tab-index {
              color: #818cf8;
            }

            .chapter-badge {
              color: #f8fafc;
              transform: rotate(0deg); /* 확장 시 정방향 가로 읽기로 복원 */
              margin-bottom: 0; /* 정방향 복원 시 여백 제거 */
            }
          }

          .accordion-body {
            opacity: 1;
            visibility: visible;
          }
        }
      }
    }

    /* 2. 모바일 전용 탭 레이아웃 */
    .tab-container {
      display: none;
      width: 100%;
      margin-bottom: 2.5rem;

      .tabs-header {
        display: flex;
        border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        margin-bottom: 1.5rem;
        gap: 0.5rem;

        .tab-btn {
          flex: 1;
          background: none;
          border: none;
          color: #94a3b8;
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
            background: #818cf8;
            transform: scaleX(0);
            transition: transform 0.3s ease;
          }

          &.active {
            color: #f8fafc;

            &::after {
              transform: scaleX(1);
            }
          }
        }
      }

      .tab-body {
        background: rgba(30, 41, 59, 0.4);
        border: 1px solid rgba(255, 255, 255, 0.05);
        border-radius: 16px;
        padding: 1.8rem;

        .tab-inner-content {
          .segment-number {
            font-size: 0.75rem;
            font-weight: 700;
            color: #818cf8;
            letter-spacing: 0.15em;
            display: block;
            margin-bottom: 0.3rem;
          }

          .tab-theme {
            font-size: 1.25rem;
            font-weight: 700;
            color: #f8fafc;
            margin: 0 0 0.8rem 0;
          }

          .tab-divider {
            width: 30px;
            height: 2px;
            background: #818cf8;
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
              color: #cbd5e1;
            }
          }
        }
      }
    }

    /* 하단 장별 상세 내용 카드 목록 */
    .details-container {
      margin-top: 1.5rem;
      flex: 1; /* 고정 높이 내 남는 가용 영역 전체 점유 */
      overflow-y: auto; /* 내용 초과 시에만 내부 스크롤 허용 */
      padding-right: 0.5rem;

      /* 깔끔한 내부 스크롤바 디자인 */
      scrollbar-width: thin;
      scrollbar-color: rgba(255, 255, 255, 0.15) transparent;

      &::-webkit-scrollbar {
        width: 6px;
      }
      &::-webkit-scrollbar-thumb {
        background: rgba(255, 255, 255, 0.15);
        border-radius: 3px;
      }

      .details-title {
        font-size: 1.2rem;
        font-weight: 700;
        color: #94a3b8;
        display: flex;
        align-items: center;
        gap: 1rem;
        margin-bottom: 1.8rem;

        .title-text {
          letter-spacing: -0.01em;
        }

        .accent-line {
          flex: 1;
          height: 1px;
          background: linear-gradient(90deg, rgba(255, 255, 255, 0.08) 0%, transparent 100%);
        }
      }

      .cards-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
        gap: 1.5rem;
        min-height: 200px; /* 전환 시 높이 붕괴 방지 */
      }

      .detail-card {
        background: rgba(30, 41, 59, 0.25);
        border: 1px solid rgba(255, 255, 255, 0.04);
        border-radius: 16px;
        padding: 1.8rem;
        transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        display: flex;
        flex-direction: column;

        .card-header-row {
          margin-bottom: 1rem;
        }

        .card-chapter-range {
          background: rgba(129, 140, 248, 0.1);
          border: 1px solid rgba(129, 140, 248, 0.2);
          color: #a5b4fc;
          font-size: 0.75rem;
          font-weight: 700;
          padding: 0.3rem 0.7rem;
          border-radius: 50px;
        }

        .card-sub-title {
          font-size: 1.15rem;
          font-weight: 700;
          color: #f8fafc;
          margin: 0 0 0.8rem 0;
          line-height: 1.4;
        }

        .card-desc-text {
          font-size: 0.95rem;
          color: #94a3b8;
          line-height: 1.6;
          margin: 0;
          font-weight: 300;
          word-break: keep-all;
        }

        &:hover {
          background: rgba(30, 41, 59, 0.4);
          border-color: rgba(99, 102, 241, 0.25);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
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
      font-size: 0.85rem;
    }

    .header-section {
      margin-bottom: 3rem;
      .page-title {
        font-size: 2.2rem;
      }
      .page-subtitle {
        font-size: 1rem;
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
        }
      }
    }

    .modal-container {
      padding: 2rem 1.5rem;
      width: 100%;
      border-radius: 20px;

      .modal-header-title {
        font-size: 1.6rem;
        margin-bottom: 1.5rem;
      }
    }

    .overview-modal {
      .overview-section {
        padding: 1.8rem 1.5rem;
        margin-bottom: 1.2rem;

        .theme-text {
          font-size: 1.15rem;
        }

        .verse-text {
          font-size: 1.05rem;
        }
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
      }

      .details-container {
        .details-title {
          font-size: 1.1rem;
          margin-bottom: 1.2rem;
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
</style>

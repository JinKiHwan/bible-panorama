<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';

// GSAP 플러그인 등록
gsap.registerPlugin(ScrollTrigger);

const wrapper = ref(null);
const currentEraIndex = ref(0);
const isBooksVisible = ref(false);
const progress = ref(0);
const isNavOpen = ref(false); // 네비게이션 메뉴 토글 상태
// 배경 이미지 제어를 위한 ref 추가
const bgImage = ref(null);
// 현재 표시 중인 배경 이미지 URL (초기값 설정)
const displayBgUrl = ref('/img/genesis01.webp');

// 데이터 (bgURL 중복 등 정리)
const eras = ref([
  {
    id: 1,
    title: '창조 시대',
    subtitle: '시작의 역사',
    bgKeyword: 'beggining',
    bgURL: '/img/genesis_01.webp',
    type: 'OT',
    mainStream: '창세기 1-11장',
    detail: '역사의 서막입니다. 하나님께서 천지를 창조하시고, 인간의 타락과 홍수 심판, 바벨탑 사건을 통해 인류가 전 세계로 흩어지게 된 배경을 다룹니다.',
    characters: ['아담', '하와', '노아'],
    relatedBooks: [],
  },
  {
    id: 2,
    title: '족장 시대',
    subtitle: '한 사람을 통한 언약',
    bgKeyword: 'patriarchs',
    bgURL: '/img/genesis_02.webp',
    type: 'OT',
    mainStream: '창세기 12-50장',
    detail: '하나님께서 아브라함을 택하여 믿음의 조상으로 세우십니다. 이삭, 야곱, 요셉 4대의 족장을 통해 이스라엘이라는 민족 공동체의 기초가 세워집니다.',
    characters: ['아브라함', '이삭', '야곱', '요셉'],
    relatedBooks: [{ name: '욥기', category: '시가서', desc: '족장 시대 즈음 동방의 의인 욥이 겪은 고난과 하나님의 주권에 대한 기록', bgURL: '' }],
  },
  {
    id: 3,
    title: '출애굽/광야',
    subtitle: '구원과 율법',
    bgKeyword: 'exodus',
    bgURL: '/img/exodus.webp',
    type: 'OT',
    mainStream: '출애굽기, 민수기',
    detail: '400년 노예 생활에서의 해방(출애굽기)과 약속의 땅을 향한 40년의 여정(민수기)입니다. 이 과정에서 하나님의 백성으로 거듭나는 법(레위기, 신명기)을 받습니다.',
    characters: ['모세', '아론'],
    relatedBooks: [
      { name: '레위기', category: '율법서', desc: '시내산에서 받은 제사법과 거룩한 삶의 지침', bgURL: '' },
      { name: '신명기', category: '율법서', desc: '가나안 입성 직전, 모세가 다음 세대에게 전한 고별 설교', bgURL: '' },
      { name: '시편 (모세)', category: '시가서', desc: '시편 90편 등 모세의 기도', bgURL: '' },
    ],
  },
  {
    id: 4,
    title: '정복/사사',
    subtitle: '정착과 혼란',
    bgKeyword: 'conquest',
    bgURL: '/img/joshua.webp',
    type: 'OT',
    mainStream: '여호수아, 사사기',
    detail: '약속의 땅 가나안을 정복하고 분배받습니다(여호수아). 그러나 이후 왕이 없던 시대(사사기)에는 타락과 구원이 반복되는 악순환을 겪습니다.',
    characters: ['여호수아', '기드온', '삼손'],
    relatedBooks: [{ name: '룻기', category: '역사서', desc: '사사 시대의 어두움 속에 빛나는 다윗의 조상 룻의 이야기', bgURL: '' }],
  },
  {
    id: 5,
    title: '단일 왕국',
    subtitle: '왕국의 영광',
    bgKeyword: 'kingdom',
    bgURL: '/img/david.webp',
    type: 'OT',
    mainStream: '사무엘상/하, 열왕기상(초반)',
    detail: '사무엘이 왕정 시대를 엽니다. 사울의 실패 후 다윗이 왕국을 견고히 하고, 솔로몬이 성전을 건축하며 최고의 번영을 누립니다.',
    characters: ['다윗', '솔로몬'],
    relatedBooks: [
      { name: '시편', category: '시가서', desc: '다윗이 쓴 수많은 찬양과 기도', bgURL: '' },
      { name: '잠언/전도서/아가', category: '시가서', desc: '솔로몬의 지혜와 사랑의 노래', bgURL: '' },
      { name: '역대상/하', category: '역사서', desc: '제사장적 관점에서 다시 기록된 왕들의 역사', bgURL: '' },
    ],
  },
  {
    id: 6,
    title: '분열 왕국',
    subtitle: '분열과 선지자의 외침',
    bgKeyword: 'divided',
    bgURL: '/img/elijah.webp',
    type: 'OT',
    mainStream: '열왕기상/하',
    detail: '나라가 남북으로 갈라집니다. 왕들의 타락이 깊어질수록 하나님은 수많은 선지자를 보내어 심판을 경고하고 회개를 촉구합니다.',
    characters: ['엘리야', '히스기야'],
    relatedBooks: [
      { name: '호세아/아모스/요나', category: '북이스라엘 예언', desc: '북이스라엘의 멸망을 경고한 선지서들', bgURL: '' },
      { name: '이사야/미가', category: '남유다 예언', desc: '남유다의 죄악 지적과 메시아 예언', bgURL: '' },
      { name: '요엘/오바댜', category: '예언서', desc: '주변국 심판과 여호와의 날 경고', bgURL: '' },
    ],
  },
  {
    id: 7,
    title: '포로 시대',
    subtitle: '심판과 남은 자',
    bgKeyword: 'exile',
    bgURL: '/img/daniel.webp',
    type: 'OT',
    mainStream: '열왕기하(후반), 다니엘',
    detail: '결국 예루살렘은 함락되고 백성들은 바벨론으로 끌려갑니다. 나라 잃은 슬픔 속에서도 하나님은 다니엘, 에스겔 등을 통해 회복을 약속하십니다.',
    characters: ['다니엘', '에스겔'],
    relatedBooks: [
      { name: '예레미야/애가', category: '예언서', desc: '눈물의 선지자가 본 멸망과 새 언약', bgURL: '' },
      { name: '에스겔', category: '예언서', desc: '포로지 그발 강가에서 본 환상과 회복', bgURL: '' },
      { name: '에스더', category: '역사서', desc: '페르시아 제국 내 유대인 몰살 위기에서의 구원', bgURL: '' },
    ],
  },
  {
    id: 8,
    title: '포로 귀환',
    subtitle: '재건과 침묵',
    bgKeyword: 'return',
    bgURL: '/img/nehemiah.webp',
    type: 'OT',
    mainStream: '에스라, 느헤미야',
    detail: '고레스 칙령으로 3차에 걸쳐 본국으로 돌아옵니다. 스룹바벨(성전), 에스라(말씀), 느헤미야(성벽)가 무너진 이스라엘을 재건합니다.',
    characters: ['에스라', '느헤미야'],
    relatedBooks: [
      { name: '학개/스가랴', category: '예언서', desc: '성전 재건을 독려한 선지자들', bgURL: '' },
      { name: '말라기', category: '예언서', desc: '구약의 마지막 경고와 침묵의 시작', bgURL: '' },
    ],
  },
  {
    id: 9,
    title: '복음 시대',
    subtitle: '왕의 오심',
    bgKeyword: 'gospel',
    bgURL: '/img/jesus.webp',
    type: 'NT',
    mainStream: '마태, 마가, 누가, 요한',
    detail: '400년의 침묵을 깨고 예수 그리스도가 오십니다. 공생애 사역, 십자가 죽음, 그리고 부활을 통해 구약을 완성하고 새 시대를 엽니다.',
    characters: ['예수 그리스도', '제자들'],
    relatedBooks: [],
  },
  {
    id: 10,
    title: '교회 시대',
    subtitle: '복음의 확장',
    bgKeyword: 'acts',
    bgURL: '/img/acts.webp',
    type: 'NT',
    mainStream: '사도행전',
    detail: '성령 강림으로 교회가 시작됩니다. 베드로와 바울을 통해 예루살렘에서 시작된 복음이 로마 제국 전체로 뻗어나가는 역동적인 역사입니다.',
    characters: ['베드로', '바울'],
    relatedBooks: [
      { name: '바울 서신서', category: '서신서', desc: '로마서, 고린도전후서, 갈라디아서 등 전도 여행 중 보낸 편지들' },
      { name: '공동 서신서', category: '서신서', desc: '야고보서, 베드로전후서, 요한서신 등', bgURL: '' },
      { name: '요한계시록', category: '예언서', desc: '역사의 마지막과 새 하늘 새 땅의 환상', bgURL: '' },
    ],
  },
]);

const currentEra = computed(() => eras.value[currentEraIndex.value]);

const toggleBooks = () => {
  isBooksVisible.value = !isBooksVisible.value;
};

const toggleNav = () => {
  isNavOpen.value = !isNavOpen.value;
};

watch(currentEraIndex, () => {
  isBooksVisible.value = false;
});

// 시대가 바뀔 때 배경 이미지 페이드 효과 적용 (GSAP)
watch(currentEraIndex, (newIndex) => {
  const nextEra = eras.value[newIndex];
  const nextUrl = nextEra.bgURL || '/img/genesis01.webp';

  // 이미지가 같으면 애니메이션 스킵
  if (displayBgUrl.value === nextUrl) return;

  if (bgImage.value) {
    // 이전 애니메이션이 있다면 중단
    gsap.killTweensOf(bgImage.value);

    // 타임라인 생성: 사라짐 -> 이미지 교체 -> 나타남
    const tl = gsap.timeline();
    tl.to(bgImage.value, { opacity: 0, duration: 0.3, ease: 'power1.out' })
      .call(() => {
        displayBgUrl.value = nextUrl;
      })
      .to(bgImage.value, { opacity: 0.25, duration: 0.5, ease: 'power1.in', delay: 0.05 });
  } else {
    displayBgUrl.value = nextUrl;
  }
});
// 특정 시대로 스크롤 이동하는 함수
const scrollToEra = (index) => {
  isNavOpen.value = false; // 이동 시 메뉴 닫기

  // 현재 화면 너비를 기준으로 모바일/데스크탑 판단
  const isMobile = window.innerWidth < 768;

  if (isMobile) {
    // 모바일: 세로 스크롤
    // .era-section 요소들을 찾아서 해당 인덱스의 위치로 이동
    const sections = document.querySelectorAll('.era-section');
    if (sections[index]) {
      sections[index].scrollIntoView({ behavior: 'smooth' });
    }
  } else {
    // 데스크탑: 가로 스크롤 (GSAP ScrollTrigger와 연동)
    // ScrollTrigger의 전체 스크롤 길이와 비율을 계산하여 이동
    const totalDistance = eras.value.length * 1000;
    // index가 0이면 0, 마지막이면 100% 진행된 위치 계산
    // wrapper가 핀(pin) 고정되기 시작하는 위치 + 진행률에 따른 거리
    const progressRatio = index / (eras.value.length - 1);
    const scrollPos = wrapper.value.offsetTop + progressRatio * totalDistance;

    window.scrollTo({
      top: scrollPos,
      behavior: 'smooth',
    });
  }
};
// ScrollTrigger 인스턴스를 저장할 변수
let mm = gsap.matchMedia();

onMounted(() => {
  // 초기 이미지 설정 (데이터 로드 후)
  displayBgUrl.value = eras.value[0].bgURL || '/img/genesis01.webp';

  const sections = gsap.utils.toArray('.era-section');

  // GSAP Match Media: 반응형 스크롤 로직 분기
  mm.add('(min-width: 768px)', () => {
    // [데스크탑] 가로 스크롤 로직
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
          if (index !== currentEraIndex.value) {
            currentEraIndex.value = index;
          }
        },
      },
    });
  });

  mm.add('(max-width: 767px)', () => {
    // [모바일] 세로 스크롤 로직
    // 각 섹션이 화면에 들어올 때 인덱스 업데이트
    sections.forEach((section, index) => {
      ScrollTrigger.create({
        trigger: section,
        start: 'top center', // 섹션 상단이 화면 중앙에 올 때
        end: 'bottom center',
        onEnter: () => updateMobileIndex(index),
        onEnterBack: () => updateMobileIndex(index),
      });
    });

    // 전체 진행률 계산 (모바일용)
    ScrollTrigger.create({
      trigger: wrapper.value,
      start: 'top top',
      end: 'bottom bottom',
      onUpdate: (self) => {
        progress.value = Math.round(self.progress * 100);
      },
    });
  });
});

const updateMobileIndex = (index) => {
  currentEraIndex.value = index;
};

onUnmounted(() => {
  // 컴포넌트 해제 시 matchMedia 정리
  mm.revert();
});
</script>

<template>
  <div class="home-container">
    <!-- Header -->
    <header class="header-bar">
      <h1 class="logo"><a href="/">BIBLE PANORAMA</a></h1>

      <!-- 데스크탑에서는 헤더 중앙에 진행바 표시 -->
      <div class="header-controls">
        <div class="progress-track">
          <div class="progress-fill" :style="{ width: progress + '%' }"></div>
        </div>
        <span class="step-indicator">PART {{ currentEraIndex + 1 }}</span>
      </div>

      <!-- 네비게이션 버튼 -->
      <button class="nav-toggle-btn" @click="toggleNav">
        <span v-if="!isNavOpen">MENU</span>
        <span v-else>CLOSE</span>
      </button>

      <!-- 네비게이션 메뉴 (Overlay 형태) -->
      <transition name="slide-fade">
        <nav v-if="isNavOpen" class="main-nav">
          <ul>
            <li v-for="(era, index) in eras" :key="era.id" :class="[{ active: currentEraIndex === index }, era.type]">
              <a href="#" @click.prevent="scrollToEra(index)">
                <span class="nav-idx">{{ String(index + 1).padStart(2, '0') }}</span>
                <span class="nav-title">{{ era.title }}</span>
              </a>
            </li>
          </ul>
        </nav>
      </transition>
    </header>

    <!-- 1. Scroll Trigger Wrapper -->
    <div class="wrapper" ref="wrapper">
      <div class="horizontal-scroll-container" ref="container">
        <div v-for="era in eras" :key="'bg-' + era.id" class="era-section" :id="era.bgKeyword" :class="{ active: currentEraIndex + 1 === era.id }">
          <div class="timeline-graphic">
            <span></span>
          </div>
          <div class="bg-keyword-text">{{ era.bgKeyword }}</div>
          <div class="timeline-dot" :class="era.type"></div>
        </div>
      </div>
    </div>

    <!-- 2. Fixed Main Content Layer -->
    <div class="fixed-content-layer">
      <transition name="fade" mode="out-in">
        <div :key="currentEra.id" class="main-card" :class="currentEra.type">
          <!-- 모바일 이미지 표시 (옵션) -->
          <figure class="mobile-only-img">
            <img :src="currentEra.bgURL || '/img/genesis_01.png'" alt="" />
          </figure>

          <!-- Top Badge -->
          <div class="card-header">
            <div class="main-bible-badge" :class="currentEra.type">
              <span class="icon">📖</span>
              <span>중심 역사서: {{ currentEra.mainStream }}</span>
            </div>
            <span class="era-type" :class="currentEra.type">
              {{ currentEra.type === 'OT' ? 'Old Testament' : 'New Testament' }}
            </span>
          </div>

          <!-- Title & Subtitle -->
          <div class="title-area">
            <h2>{{ currentEra.title }}</h2>
            <p>{{ currentEra.subtitle }}</p>
          </div>

          <!-- Description -->
          <div class="description">
            {{ currentEra.detail }}
          </div>

          <!-- Key Figures -->
          <div class="key-figures">
            <h4>Key Figures</h4>
            <div class="tags">
              <span v-for="char in currentEra.characters" :key="char" class="tag">
                {{ char }}
              </span>
            </div>
          </div>

          <!-- Action Button -->
          <div class="action-area">
            <button @click="toggleBooks" class="books-btn" :class="currentEra.type">
              <span>
                <span v-if="currentEra.relatedBooks.length > 0">함께 읽는 성경 ({{ currentEra.relatedBooks.length }}권)</span>
                <span v-else>관련 성경 없음</span>
              </span>
              <svg :class="{ 'rotate-180': isBooksVisible }" class="arrow-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
              </svg>
            </button>
          </div>
        </div>
      </transition>
    </div>

    <!-- 배경 이미지 레이어 -->
    <div class="bible_bg">
      <figure ref="bgImage">
        <!-- 에러 방지를 위해 기본 이미지 폴백 추가 -->
        <img :src="displayBgUrl" alt="Background" />
      </figure>
    </div>

    <!-- 3. Bottom Sheet -->
    <div class="bottom-panel" :class="{ show: isBooksVisible }">
      <div class="panel-inner">
        <div class="panel-header">
          <div class="header-text">
            <h3>📚 Context & Side Books</h3>
            <p>이 시대의 역사적 배경 속에서 기록된 예언서, 시가서, 서신서들입니다.</p>
          </div>
          <button @click="isBooksVisible = false" class="close-btn">
            <svg class="close-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        <!-- 관련 성경 그리드 -->
        <div class="books-grid-wrapper custom-scroll">
          <div v-if="currentEra.relatedBooks.length > 0" class="books-grid">
            <div v-for="book in currentEra.relatedBooks" :key="book.name" class="book-card">
              <div class="book-bg-icon">📖</div>
              <div class="book-category">
                <span>{{ book.category }}</span>
              </div>
              <h4>{{ book.name }}</h4>
              <p>{{ book.desc }}</p>
            </div>
          </div>
          <div v-else class="empty-state">
            <span class="empty-icon">📜</span>
            <p>이 시대에는 별도의 관련 성경(Side Books)이 없습니다.</p>
            <p class="sub-text">중심 역사서만 읽으시면 됩니다.</p>
          </div>
        </div>
      </div>
    </div>

    <div v-if="isBooksVisible" @click="isBooksVisible = false" class="overlay"></div>
  </div>
</template>

<style lang="scss" scoped>
/* 색상 변수 정의 */
.home-container {
  font-family: 'Noto Sans KR', sans-serif;
  background-color: $bg-color;
  color: $text-primary;
  min-height: 100vh;
  position: relative;
  z-index: 0;
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

  .logo {
    font-size: 1.25rem;
    font-weight: 700;
    font-family: 'Noto Serif KR', serif;
    @include mobile {
      font-size: 16px;
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
        background-color: white;
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
          }

          .nav-title {
            font-weight: 500;
            font-size: 0.875rem;
          }
        }

        &.active.OT a {
          background-color: rgba($ot-color, 0.2);
          color: lighten($ot-color, 20%);

          .nav-idx {
            color: rgba(255, 255, 255, 0.7);
          }
        }
        &.active.NT a {
          background-color: rgba($nt-color, 0.2);
          color: lighten($nt-color, 20%);
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
        animation: move infinite 5s linear;
        visibility: hidden;
        opacity: 0;

        @include mobile {
          animation: move-mobile infinite 5s linear;
          width: 10px;
          aspect-ratio: 20/150;
          transform: translate(-50%, 0);
        }

        @keyframes move {
          0% {
            left: 0;
          }
          100% {
            left: 100%;
          }
        }

        @keyframes move-mobile {
          0% {
            top: 0;
          }
          100% {
            top: 100%;
          }
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
    font-size: 15vw; /* 모바일에서 더 크게 */
    font-weight: 900;
    opacity: 0.1;
    font-family: 'Noto Serif KR', serif;
    white-space: nowrap;
    pointer-events: none;
    letter-spacing: 0.5rem;
    text-transform: uppercase;

    /* 모바일에서는 텍스트가 세로로 겹치지 않게 회전시킬 수도 있음 */
    @media (min-width: 768px) {
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

/* Main Content Card */
.fixed-content-layer {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 10;
  display: flex;
  align-items: center; /* 데스크탑: 중앙 정렬 */
  justify-content: center;
}

.main-card {
  pointer-events: auto;
  width: 90%;
  max-width: 650px;
  // background: rgba(15, 23, 42, 1); /* 모바일 가독성을 위해 투명도 조절 */
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
  /* 모바일 스타일 조정 */
  @media (max-width: 767px) {
    width: 95%;
    padding: 2rem;
    gap: 1rem;
    max-height: 70vh; /* 너무 길어지지 않게 제한 */
    //overflow-y: auto; /* 내용 많으면 내부 스크롤 */
  }

  /* 네온 효과 요소 추가 */
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

  /* 내부 컨텐츠가 가려지지 않도록 배경을 하나 더 덧댐 */
  &::before {
    content: '';
    position: absolute;
    inset: 1px; /* 1px 안쪽으로 */
    // background: rgba(15, 23, 42, 1); /* 카드 배경색 */
    background: linear-gradient(180deg, rgba(0, 0, 0, 1) 0%, #212121 100%);
    border-radius: inherit;
    z-index: -1;
  }

  &.NT {
    &::after {
      background: conic-gradient(transparent, rgba($nt-color, 0.5), transparent 30%);
    }
  }

  @keyframes rotate {
    100% {
      transform: rotate(1turn);
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

      @media (max-width: 767px) {
        font-size: 12px;
        padding: 0.5rem 1rem;
      }

      &.OT {
        background-color: rgba($ot-color, 0.2);
        color: lighten($ot-color, 20%);
        border-color: rgba($ot-color, 0.3);
      }
      &.NT {
        background-color: rgba($nt-color, 0.2);
        color: lighten($nt-color, 20%);
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
        color: lighten($ot-color, 10%);
      }
      &.NT {
        color: lighten($nt-color, 10%);
      }
    }
  }

  .title-area {
    h2 {
      font-size: 2.5rem;
      font-weight: 700;
      font-family: 'Noto Serif KR', serif;
      color: white;
      margin: 0 0 0.5rem 0;

      @include mobile {
        font-size: 18px;
        margin-bottom: 10px;
      }
    }
    p {
      font-size: 1.125rem;
      color: lighten($accent-color, 25%);
      font-weight: 500;
      margin: 0;

      @include mobile {
        font-size: 12px;
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
      font-size: 12px;
      line-height: 1.5;
      max-height: 100px; /* 모바일에서 설명 너무 길면 자르거나 스크롤 */
      overflow-y: auto;
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
        font-size: 12px;
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
          font-size: 12px;
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

    .books-btn {
      width: 100%;
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
      box-shadow: 0 10px 15px -3px rgba(49, 46, 129, 0.5);
      border: none;
      cursor: pointer;

      &:hover {
        background: linear-gradient(to right, darken($ot-color, 5%), darken(#047a8f, 5%));
      }

      &.NT {
        background: linear-gradient(to right, $nt-color, #9f2a3d);
        &:hover {
          background: linear-gradient(to right, darken($nt-color, 5%), darken(#9f2a3d, 5%));
        }
      }

      @include mobile {
        width: 100%;
        font-size: 12px;
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

/* Bottom Sheet */
.bottom-panel {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 60vh; /* 모바일에서 좀 더 높게 */
  background-color: $bg-color;
  border-top: 1px solid $border-color;
  z-index: 50;
  box-shadow: 0 -10px 40px rgba(0, 0, 0, 0.5);
  visibility: hidden;
  opacity: 0;
  transform: translateY(100%);
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);

  &.show {
    transform: translateY(0);
    visibility: visible;
    opacity: 1;
  }

  .panel-inner {
    max-width: 64rem;
    margin: 0 auto;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    padding: 2rem;

    @media (max-width: 767px) {
      padding: 1.5rem;
    }
  }

  .panel-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    padding-bottom: 1rem;

    @include mobile {
      align-items: flex-start;
    }

    .header-text {
      @include mobile {
        max-width: calc(100% - 3rem);
      }
      h3 {
        font-size: 1.5rem;
        font-weight: 700;
        font-family: 'Noto Serif KR', serif;
        color: white;
        margin: 0;
        display: flex;
        align-items: center;
        gap: 0.5rem;

        @include mobile {
          font-size: 18px;
        }
      }
      p {
        color: $text-secondary;
        font-size: 0.875rem;
        margin: 0.25rem 0 0 0;

        @include mobile {
          margin-top: 10px;
          font-size: 12px;
          line-height: 1.25;
        }
      }
    }

    .close-btn {
      background-color: #1e293b;
      padding: 0.5rem;
      border-radius: 9999px;
      color: $text-secondary;
      border: none;
      cursor: pointer;
      transition: all 0.2s;

      @include mobile {
        padding: 0;
      }

      &:hover {
        background-color: #334155;
        color: white;
      }

      .close-icon {
        width: 1.5rem;
        height: auto;
        aspect-ratio: 1/1;

        @include mobile {
          width: 3rem;
        }
      }
    }
  }

  .books-grid-wrapper {
    overflow-y: auto;
    padding-right: 0.5rem;
  }

  .books-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 1rem;

    @media (min-width: 768px) {
      grid-template-columns: repeat(2, 1fr);
    }
    @media (min-width: 1024px) {
      grid-template-columns: repeat(3, 1fr);
    }

    .book-card {
      background-color: rgba(30, 41, 59, 0.5);
      padding: 1.25rem;
      border-radius: 0.75rem;
      border: 1px solid #334155;
      transition: all 0.2s;
      cursor: pointer;
      position: relative;
      overflow: hidden;

      &:hover {
        border-color: $accent-color;
        background-color: #1e293b;

        .book-bg-icon {
          opacity: 0.1;
        }

        h4 {
          color: white;
        }

        .book-category span {
          background-color: rgba($accent-color, 0.3);
          color: lighten($accent-color, 20%);
        }
      }

      .book-bg-icon {
        position: absolute;
        right: -1rem;
        bottom: -1rem;
        font-size: 3.75rem;
        opacity: 0.05;
        filter: grayscale(100%);
        transition: opacity 0.3s;

        @include mobile {
          font-size: 52px;
        }
      }

      .book-category {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 0.5rem;

        span {
          font-size: 0.75rem;
          font-weight: 700;
          padding: 0.25rem 0.5rem;
          border-radius: 0.25rem;
          background-color: #334155;
          color: #cbd5e1;
          transition: all 0.2s;

          @include mobile {
            font-size: 12px;
          }
        }
      }

      h4 {
        font-size: 1.125rem;
        font-weight: 700;
        color: #e2e8f0;
        margin: 0 0 0.25rem 0;
        transition: color 0.2s;

        @include mobile {
          font-size: 16px;
          margin: 0 0 8px 0;
        }
      }

      p {
        font-size: 0.875rem;
        color: $text-secondary;
        margin: 0;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
        @include mobile {
          font-size: 12px;
        }
      }
    }
  }

  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 10rem;
    color: $text-muted;
    background-color: rgba(30, 41, 59, 0.3);
    border-radius: 0.75rem;
    border: 1px dashed #334155;

    @include mobile {
      font-size: 12px;
      line-height: 1.25;
    }

    .empty-icon {
      font-size: 1.875rem;
      margin-bottom: 0.5rem;

      @include mobile {
        font-size: 12px;
      }
    }

    p {
      margin: 0;
      &.sub-text {
        font-size: 0.75rem;
        margin-top: 0.25rem;
        @include mobile {
          font-size: 12px;
        }
      }
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

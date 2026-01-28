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

// [추가] 선택된 관련 성경 (null이면 시대 정보 표시)
const selectedBook = ref(null);

// 배경 이미지 제어를 위한 ref
const bgImage = ref(null);
// 현재 표시 중인 배경 이미지 URL
const displayBgUrl = ref('/img/genesis_01.webp');

// 데이터 (관련 성경 낱권 분리 완료)
const eras = ref([
    {
        id: 1,
        title: '창조 시대',
        subtitle: '시작의 역사',
        bgKeyword: 'beggining',
        bgURL: '/img/genesis_01.webp',
        type: 'OT',
        mainStream: '창세기 1-11장',
        detail: '태초에 하나님께서 천지를 창조하시며 역사가 시작됩니다. 인간은 하나님의 형상으로 지음받았으나 선악과 사건으로 타락하고, 죄는 가인과 홍수, 바벨탑 사건을 거치며 전 인류로 확산됩니다. 이 시기는 세상의 시작과 인간 문제의 근원을 보여줍니다.',
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
        detail: '하나님은 아브라함 한 사람을 부르셔서 민족과 구원의 역사를 시작하십니다. 이삭, 야곱, 요셉으로 이어지는 족장들의 삶 속에서 약속은 위기와 실패 속에서도 계승되며, 이스라엘 민족의 정체성과 언약의 기초가 세워집니다.',
        characters: ['아브라함', '이삭', '야곱', '요셉'],
        relatedBooks: [
            {
                name: '욥기',
                category: '시가서',
                desc: '의인 욥이 이유를 알 수 없는 극심한 고난을 겪으며 하나님의 공의와 주권을 질문합니다. 친구들의 논쟁과 하나님의 직접적인 응답을 통해, 고난의 원인보다 하나님을 신뢰하는 자리로 독자를 이끕니다.',
                bgURL: '/img/job.webp',
            },
        ],
    },

    {
        id: 3,
        title: '출애굽/광야',
        subtitle: '구원과 율법',
        bgKeyword: 'exodus',
        bgURL: '/img/exodus.webp',
        type: 'OT',
        mainStream: '출애굽기, 민수기',
        detail: '이스라엘은 400년간의 애굽 노예 생활에서 해방되어 출애굽을 경험합니다. 이후 40년 광야 여정 속에서 불순종과 훈련을 반복하며, 하나님은 율법을 통해 백성의 정체성과 거룩한 삶의 기준을 세우십니다.',
        characters: ['모세', '아론'],
        relatedBooks: [
            {
                name: '레위기',
                category: '율법서',
                desc: '시내산에서 주어진 제사 규례와 정결 법을 통해 거룩하신 하나님과 죄인인 인간이 어떻게 관계할 수 있는지를 보여줍니다. 속죄, 제사장 직분, 일상 속 거룩이 핵심 주제입니다.',
                bgURL: '/img/leviticus.webp',
            },
            {
                name: '신명기',
                category: '율법서',
                desc: '가나안 입성 직전, 모세가 다음 세대에게 전한 고별 설교입니다. 광야의 역사를 되짚으며 율법의 의미를 다시 풀어 설명하고, “생명을 택하라”는 선택의 메시지로 마무리됩니다.',
                bgURL: '/img/deuteronomy.webp',
            },
            {
                name: '시편 (모세)',
                category: '시가서',
                desc: '대표적으로 시편 90편을 통해 인생의 덧없음과 하나님의 영원을 대조합니다. 광야의 현실 속에서 하나님을 영원한 거처로 고백하는 기도가 담겨 있습니다.',
                bgURL: '/img/psalter_01.webp',
            },
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
        detail: '이스라엘은 여호수아의 인도로 가나안을 정복하고 땅을 분배받습니다. 그러나 왕이 없던 사사 시대에는 불순종과 우상숭배가 반복되며, 타락과 구원이 순환하는 혼란의 시기를 겪습니다.',
        characters: ['여호수아', '기드온', '삼손'],
        relatedBooks: [
            {
                name: '룻기',
                category: '역사서',
                desc: '사사 시대의 어둠 속에서 룻과 나오미의 헌신을 통해 하나님의 섭리가 조용히 이어짐을 보여줍니다. 이방 여인 룻이 다윗의 계보에 포함되는 은혜가 핵심입니다.',
                bgURL: '/img/rute.webp',
            },
        ],
    },

    {
        id: 5,
        title: '단일 왕국',
        subtitle: '왕국의 영광',
        bgKeyword: 'kingdom',
        bgURL: '/img/david.webp',
        type: 'OT',
        mainStream: '사무엘상/하, 열왕기상(초반)',
        detail: '사무엘을 통해 왕정이 시작되고, 사울의 실패 이후 다윗이 왕국을 견고히 세웁니다. 솔로몬 시대에는 성전이 건축되며 정치·경제·영적 전성기를 맞이하지만, 그 안에 균열의 씨앗도 함께 자라납니다.',
        characters: ['다윗', '솔로몬'],
        relatedBooks: [
            {
                name: '시편',
                category: '시가서',
                desc: '다윗을 중심으로 한 찬양과 탄식, 회개와 감사의 기도 모음입니다. 개인의 내면과 공동체 예배가 함께 흐르며, 고난 속에서도 하나님을 신뢰하는 믿음의 언어를 배웁니다.',
                bgURL: '/img/psalter_02.webp',
            },
            {
                name: '잠언',
                category: '시가서',
                desc: '여호와를 경외함을 지혜의 시작으로 삼아 말과 관계, 돈과 선택의 원리를 가르칩니다. 일상의 삶을 지혜롭게 살아가는 실천적 교훈이 담겨 있습니다.',
                bgURL: '/img/proverbs.webp',
            },
            {
                name: '전도서',
                category: '시가서',
                desc: '지혜와 쾌락, 성취를 모두 경험한 후 인생의 허무를 직면합니다. 그럼에도 하나님을 경외하며 현재의 삶을 선물로 받아들이는 태도를 가르칩니다.',
                bgURL: '/img/ecclesiastes.webp',
            },
            {
                name: '아가',
                category: '시가서',
                desc: '남녀의 사랑을 시로 노래하며 갈망과 기다림, 결합과 회복을 묘사합니다. 사랑은 소유가 아닌 선택이며, 죽음처럼 강한 힘임을 선언합니다.',
                bgURL: '/img/songsofsolonon.webp',
            },
            {
                name: '역대상',
                category: '역사서',
                desc: '아담부터 다윗까지의 계보와 다윗 통치를 예배와 성전 준비의 관점에서 재조명합니다. 하나님의 나라가 무엇인지 신학적으로 정리한 역사서입니다.',
                bgURL: '',
            },
            {
                name: '역대하',
                category: '역사서',
                desc: '솔로몬 이후 남유다 왕들의 역사를 언약과 예배의 관점에서 기록합니다. 회개와 회복, 그리고 포로로 끝나는 역사 속에서도 소망을 남깁니다.',
                bgURL: '',
            },
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
        detail: '솔로몬 사후 왕국은 북이스라엘과 남유다로 분열됩니다. 정치적 타락이 깊어질수록 하나님은 선지자들을 보내 심판과 회개, 그리고 회복의 소망을 외치게 하십니다.',
        characters: ['엘리야', '히스기야'],
        relatedBooks: [
            {
                name: '호세아',
                category: '북이스라엘 예언',
                desc: '불성실한 아내 고멜과의 결혼을 통해 우상숭배에 빠진 이스라엘을 고발합니다. 심판 속에서도 변하지 않는 하나님의 사랑과 회복의 약속이 흐릅니다.',
                bgURL: '/img/hosea.webp',
            },
            {
                name: '아모스',
                category: '북이스라엘 예언',
                desc: '형식적인 예배와 사회적 불의를 꾸짖으며 공의와 정의를 외칩니다. 신앙은 예배가 아니라 삶에서 증명되어야 함을 선포합니다.',
                bgURL: '/img/amos.webp',
            },
            {
                name: '요나',
                category: '북이스라엘 예언',
                desc: '원수 니느웨로 향하라는 명령을 거부한 요나의 도망과 회복 이야기입니다. 하나님의 자비가 이스라엘 밖까지 확장됨을 보여줍니다.',
                bgURL: '/img/yona.webp',
            },
            {
                name: '이사야',
                category: '남유다 예언',
                desc: '유다의 죄를 고발하면서도 메시아와 새 창조의 소망을 풍성하게 예언합니다. 임마누엘과 고난받는 종의 메시지가 중심입니다.',
                bgURL: '/img/isaiah.webp',
            },
            {
                name: '미가',
                category: '남유다 예언',
                desc: '지도자들의 탐욕을 책망하며 공의·인애·겸손의 삶을 제시합니다. 베들레헴에서 태어날 통치자 예언이 포함됩니다.',
                bgURL: '/img/micah.webp',
            },
            {
                name: '요엘',
                category: '남유다 예언',
                desc: '메뚜기 재앙을 여호와의 날로 해석하며 회개를 촉구합니다. 성령을 만민에게 부어주실 약속이 담겨 있습니다.',
                bgURL: '',
            },
            {
                name: '오바댜',
                category: '남유다 예언',
                desc: '형제 유다의 환난을 조롱한 에돔을 향한 심판 선언입니다. 교만한 권세는 반드시 무너진다는 메시지를 전합니다.',
                bgURL: '',
            },
            {
                name: '나훔',
                category: '남유다 예언',
                desc: '잔혹한 제국 앗수르의 수도 니느웨 멸망을 선포하며, 악의 권력이 영원하지 않음을 증언합니다.',
                bgURL: '',
            },
            {
                name: '하박국',
                category: '남유다 예언',
                desc: '악인이 형통하는 현실을 질문하며 하나님의 응답을 기다립니다. “의인은 믿음으로 산다”는 신앙 고백으로 마무리됩니다.',
                bgURL: '',
            },
            {
                name: '스바냐',
                category: '남유다 예언',
                desc: '여호와의 날의 심판을 선포하면서도 남은 자를 통한 회복과 기쁨의 약속을 전합니다.',
                bgURL: '',
            },
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
        detail: '예루살렘은 함락되고 백성은 바벨론으로 끌려갑니다. 나라를 잃은 상황에서도 하나님은 다니엘과 선지자들을 통해 여전히 역사의 주권자이심을 드러내십니다.',
        characters: ['다니엘', '에스겔'],
        relatedBooks: [
            {
                name: '예레미야',
                category: '예언서',
                desc: '멸망 직전의 유다에 끝까지 회개를 외친 눈물의 선지자 이야기입니다. 심판 속에서도 새 언약과 회복의 소망을 전합니다.',
                bgURL: '',
            },
            {
                name: '예레미야애가',
                category: '예언서',
                desc: '예루살렘 멸망을 애도하는 시로, 절망 속에서도 하나님의 긍휼을 붙드는 신앙을 보여줍니다.',
                bgURL: '',
            },
            {
                name: '에스겔',
                category: '예언서',
                desc: '포로지에서 환상과 상징을 통해 심판과 회복을 선포합니다. 마른 뼈 환상은 재창조의 희망을 상징합니다.',
                bgURL: '',
            },
            {
                name: '에스더',
                category: '역사서',
                desc: '페르시아 제국에서 유다 민족이 멸절 위기에 처했을 때, 하나님의 보이지 않는 섭리로 구원이 이루어지는 이야기입니다.',
                bgURL: '',
            },
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
        detail: '고레스 칙령으로 포로들이 귀환하며 성전과 성벽, 공동체가 재건됩니다. 외형은 회복되지만 영적 갈증 속에서 메시아를 기다리는 침묵의 시기로 이어집니다.',
        characters: ['에스라', '느헤미야'],
        relatedBooks: [
            {
                name: '학개',
                category: '예언서',
                desc: '성전 재건을 미루는 백성을 책망하며 하나님의 집을 우선순위에 둘 것을 촉구합니다.',
                bgURL: '',
            },
            {
                name: '스가랴',
                category: '예언서',
                desc: '환상과 상징을 통해 성전 재건을 격려하고 장차 오실 왕에 대한 메시아적 소망을 전합니다.',
                bgURL: '',
            },
            {
                name: '말라기',
                category: '예언서',
                desc: '형식적 예배와 무너진 언약을 책망하며, 주의 길을 예비할 자의 오심을 예언합니다.',
                bgURL: '',
            },
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
        detail: '400년의 침묵을 깨고 예수 그리스도가 오십니다. 그의 삶과 가르침, 십자가 죽음과 부활을 통해 하나님의 나라가 시작되고 구약의 약속이 성취됩니다.',
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
        detail: '성령 강림으로 교회가 탄생하고, 복음은 예루살렘에서 시작해 온 세상으로 확장됩니다. 박해와 선교 속에서 교회는 하나님의 나라를 증언합니다.',
        characters: ['베드로', '바울'],
        relatedBooks: [
            {
                name: '로마서',
                category: '바울서신',
                desc: '복음을 가장 체계적으로 설명하며 죄, 은혜, 이신칭의와 성화의 과정을 다룹니다.',
                bgURL: '',
            },
            {
                name: '고린도전서',
                category: '바울서신',
                desc: '분열된 교회를 향해 십자가의 지혜와 사랑의 본질을 가르칩니다.',
                bgURL: '',
            },
            {
                name: '갈라디아서',
                category: '바울서신',
                desc: '율법이 아닌 믿음으로 얻는 자유와 복음의 본질을 강하게 변호합니다.',
                bgURL: '',
            },
            {
                name: '히브리서',
                category: '공동서신',
                desc: '예수 그리스도를 새 언약의 대제사장으로 제시하며 믿음과 인내를 권면합니다.',
                bgURL: '',
            },
            {
                name: '요한계시록',
                category: '예언서',
                desc: '박해 속 교회에 어린양의 승리와 새 하늘과 새 땅의 소망을 보여줍니다.',
                bgURL: '',
            },
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

// [추가] 책 선택 함수
const selectBook = (book) => {
    selectedBook.value = book;
    isBooksVisible.value = false;
};

// [추가] 책 상세 닫기 함수
const closeBookDetail = () => {
    selectedBook.value = null;
};

// 시대가 변경되면 하단 패널과 상세 뷰 초기화
watch(currentEraIndex, () => {
    isBooksVisible.value = false;
    selectedBook.value = null;
});

// [배경 이미지 로직 개선]
// 현재 보여줘야 할 배경 이미지 URL 계산 (선택된 책이 있으면 책 이미지, 없으면 시대 이미지)
const activeBgUrl = computed(() => {
    if (selectedBook.value && selectedBook.value.bgURL) {
        return selectedBook.value.bgURL;
    }
    return eras.value[currentEraIndex.value].bgURL || '/img/genesis_01.webp';
});

// activeBgUrl이 변경될 때마다 이미지 교체 애니메이션 실행
watch(activeBgUrl, (newUrl) => {
    // 이미지가 같으면 애니메이션 스킵
    if (displayBgUrl.value === newUrl) return;

    // 새 이미지 미리 로드
    const imgLoader = new Image();
    imgLoader.src = newUrl;

    // 먼저 기존 이미지를 페이드 아웃 시작
    if (bgImage.value) {
        gsap.to(bgImage.value, {
            opacity: 0,
            duration: 0.3,
            onComplete: () => {
                // 이미지가 로드되었는지 확인하고 교체 함수 실행
                if (imgLoader.complete) {
                    swapAndFadeIn();
                } else {
                    imgLoader.onload = swapAndFadeIn;
                }
            },
        });
    } else {
        // 초기 상태 등에서는 바로 로드 대기
        imgLoader.onload = swapAndFadeIn;
    }

    function swapAndFadeIn() {
        displayBgUrl.value = newUrl;
        // DOM 업데이트 후 페이드 인
        setTimeout(() => {
            if (bgImage.value) {
                gsap.to(bgImage.value, { opacity: 0.25, duration: 0.5 });
            }
        }, 50);
    }
});

// 특정 시대로 스크롤 이동하는 함수
const scrollToEra = (index) => {
    isNavOpen.value = false;

    const isMobile = window.innerWidth < 768;

    if (isMobile) {
        const sections = document.querySelectorAll('.era-section');
        if (sections[index]) {
            sections[index].scrollIntoView({ behavior: 'smooth' });
        }
    } else {
        const totalDistance = eras.value.length * 1000;
        const progressRatio = index / (eras.value.length - 1);
        const scrollPos = wrapper.value.offsetTop + progressRatio * totalDistance;

        window.scrollTo({
            top: scrollPos,
            behavior: 'smooth',
        });
    }
};

// [이미지 프리로딩 함수]
const preloadImages = () => {
    eras.value.forEach((era) => {
        if (era.bgURL) {
            const img = new Image();
            img.src = era.bgURL;
        }
    });
};

let mm = gsap.matchMedia();

onMounted(() => {
    preloadImages();
    // 초기 이미지 설정
    displayBgUrl.value = eras.value[0].bgURL || '/img/genesis_01.webp';

    const sections = gsap.utils.toArray('.era-section');

    mm.add('(min-width: 768px)', () => {
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
        sections.forEach((section, index) => {
            ScrollTrigger.create({
                trigger: section,
                start: 'top center',
                end: 'bottom center',
                onEnter: () => updateMobileIndex(index),
                onEnterBack: () => updateMobileIndex(index),
            });
        });

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
    mm.revert();
});
</script>

<template>
    <div class="home-container">
        <!-- Header -->
        <header class="header-bar">
            <h1 class="logo"><a href="/">BIBLE PANORAMA</a></h1>

            <div class="header-controls hidden-mobile">
                <div class="progress-track">
                    <div class="progress-fill" :style="{ width: progress + '%' }"></div>
                </div>
                <span class="step-indicator">PART {{ currentEraIndex + 1 }}</span>
            </div>

            <button class="nav-toggle-btn" @click="toggleNav">
                <span v-if="!isNavOpen">MENU</span>
                <span v-else>CLOSE</span>
            </button>

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
                <!-- [CASE 1] 시대 정보 메인 카드 (책 선택 안되었을 때) -->
                <div v-if="!selectedBook" :key="'era-' + currentEra.id" class="main-card" :class="currentEra.type">
                    <!-- 모바일 이미지 표시 -->
                    <figure class="mobile-only-img">
                        <img :src="currentEra.bgURL || '/img/genesis_01.png'" alt="" />
                    </figure>

                    <div class="card-header">
                        <div class="main-bible-badge" :class="currentEra.type">
                            <span class="icon">📖</span>
                            <span>중심 역사서: {{ currentEra.mainStream }}</span>
                        </div>
                        <span class="era-type" :class="currentEra.type">
                            {{ currentEra.type === 'OT' ? 'Old Testament' : 'New Testament' }}
                        </span>
                    </div>

                    <div class="title-area">
                        <h2>{{ currentEra.title }}</h2>
                        <p>{{ currentEra.subtitle }}</p>
                    </div>

                    <div class="description">
                        {{ currentEra.detail }}
                    </div>

                    <div class="key-figures">
                        <h4>Key Figures</h4>
                        <div class="tags">
                            <span v-for="char in currentEra.characters" :key="char" class="tag">
                                {{ char }}
                            </span>
                        </div>
                    </div>

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

                <!-- [CASE 2] 책 상세 정보 카드 (책 선택 시 Overlay) -->
                <div v-else :key="'book-' + selectedBook.name" class="main-card book-detail-card" :class="currentEra.type">
                    <!-- 닫기 버튼 -->
                    <button class="detail-close-btn" @click="closeBookDetail">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                    <figure class="mobile-only-img">
                        <img :src="selectedBook.bgURL || '/img/genesis_01.png'" alt="" />
                    </figure>

                    <div class="card-header">
                        <div class="main-bible-badge" :class="currentEra.type">
                            <span class="icon">📜</span>
                            <span>{{ selectedBook.category }}</span>
                        </div>
                        <span class="era-type" :class="currentEra.type"> Related Book </span>
                    </div>

                    <div class="title-area">
                        <h2>{{ selectedBook.name }}</h2>
                        <p>{{ currentEra.title }} 시대 배경</p>
                    </div>

                    <div class="description book-desc">
                        {{ selectedBook.desc }}
                    </div>

                    <!-- 하단 여백용 -->
                    <div class="mt-4"></div>
                </div>
            </transition>
        </div>

        <!-- 배경 이미지 레이어 -->
        <div class="bible_bg">
            <figure ref="bgImage">
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
                        <!-- [변경] 클릭 시 selectBook 함수 호출 -->
                        <div v-for="book in currentEra.relatedBooks" :key="book.name" class="book-card" :class="{ selected: selectedBook && selectedBook.name === book.name }" @click="selectBook(book)">
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

        a {
            background-image:url('/img/common/gradient.webp');
            background-repeat: no-repeat;
            background-position: center center;
            background-size: cover;
            background-clip: text;
            -webkit-background-clip: text;
            color: transparent;
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

            @include mobile {
                display: none;
            }
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

                @keyframes move {
                    0% {
                        left: 0;
                    }
                    100% {
                        left: 100%;
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
        font-size: 10vw; /* 모바일에서 더 크게 */
        font-weight: 900;
        opacity: 0.1;
        font-family: 'Noto Serif KR', serif;
        white-space: nowrap;
        pointer-events: none;
        letter-spacing: 0.5rem;
        text-transform: uppercase;

        /* 모바일에서는 텍스트가 세로로 겹치지 않게 회전시킬 수도 있음 */
        @include mobile {
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

    @include mobile {
        align-items: flex-end; /* 예: 하단 배치 */
        padding-bottom: 2rem;
    }
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
        margin-bottom: 5vh;
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
        height: 2rem;
        z-index: 20;

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
            box-shadow: 0 10px 15px -3px rgba($ot-color, 0.25);
            border: none;
            cursor: pointer;

            &:hover {
                background: linear-gradient(to right, darken($ot-color, 5%), darken(#047a8f, 5%));
            }

            &.NT {
                background: linear-gradient(to right, $nt-color, #9f2a3d);
                box-shadow: 0 10px 15px -3px rgba($nt-color, 0.25);
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
        max-height: 85%;
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

            /* 선택된 카드 스타일 추가 */
            &.selected {
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
                line-height: 1.25;
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

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { auth, googleProvider } from '@/firebase';
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import HamburgerIcon from '@/components/icons/HamburgerIcon.vue';
import CloseIcon from '@/components/icons/CloseIcon.vue';
import { useTheme } from '@/composables/useTheme';

// [중요] 전역 상태 가져오기
import { useAuthState } from '@/composables/useAuthState';
import { usePanoramaState } from '@/composables/usePanoramaState';

const router = useRouter();

// 1. 로그인 상태 전역 관리
const { currentUser } = useAuthState();

// 2. 파노라마 데이터 전역 관리
const { progress, currentEraIndex, eras, isNavOpen, triggerScrollToEra } = usePanoramaState();
const { isDark, toggleTheme, initTheme } = useTheme();

defineProps({
  isPanorama: {
    type: Boolean,
    default: false,
  },
});

const isProfileMenuOpen = ref(false);

// --- Firebase Auth Logic ---
const handleLogin = async () => {
  try {
    await signInWithPopup(auth, googleProvider);
  } catch (error) {
    console.error('Login Failed:', error);
    alert('로그인에 실패했습니다.');
  }
};

const handleLogout = async () => {
  if (confirm('정말 로그아웃 하시겠습니까?')) {
    try {
      await signOut(auth);
      isProfileMenuOpen.value = false;
      router.push('/');
    } catch (error) {
      console.error('Logout Failed:', error);
    }
  }
};

const toggleProfileMenu = () => {
  isProfileMenuOpen.value = !isProfileMenuOpen.value;
};

const handleHome = () => {
  isProfileMenuOpen.value = false;
  isNavOpen.value = false;
  router.push('/');
};

const handleMyPage = () => {
  isProfileMenuOpen.value = true;
  isNavOpen.value = false;
  router.push('/mypage');
};

const toggleNav = () => {
  isNavOpen.value = !isNavOpen.value;
};

const handleScrollToEra = (index) => {
  triggerScrollToEra(index);
  isNavOpen.value = false;
};
</script>

<template>
  <header class="header-bar" :class="{ 'panorama-mode': isPanorama }">
    <h1 class="logo" @click="handleHome">BIBLE PANORAMA</h1>

    <!-- [기능 분기] 중앙 진행 바 (isPanorama일 때만 표시) -->
    <div v-if="isPanorama" class="header-controls">
      <div class="progress-track">
        <div class="progress-fill" :style="{ width: progress + '%' }"></div>
      </div>
      <span class="step-indicator">PART {{ currentEraIndex + 1 }}</span>
    </div>

    <!-- 우측 컨트롤 영역 -->
    <div class="right-actions">
      <div class="theme-toggle-wrapper">
        <div class="toggle toggle--daynight">
          <!-- isDark가 true일 때(밤) unchecked, false일 때(낮) checked -->
          <input type="checkbox" id="toggle--daynight" class="toggle--checkbox" :checked="!isDark" @change="toggleTheme" />
          <label class="toggle--btn" for="toggle--daynight">
            <span class="toggle--feature"></span>
          </label>
        </div>
      </div>
      <!-- 로그인/프로필 -->
      <button v-if="!currentUser" class="login-btn" @click="handleLogin">Login</button>
      <div v-else class="user-profile-wrapper" @click="toggleProfileMenu">
        <div class="user-profile" :title="currentUser.displayName">
          <img :src="currentUser.photoURL" alt="Profile" />
        </div>

        <!-- [추가] 닉네임 표시 (currentUser.displayName) -->
        <span class="user-name" v-if="currentUser.displayName">{{ currentUser.displayName }}</span>

        <!-- 프로필 드롭다운 -->
        <transition name="dropdown-fade">
          <div v-if="isProfileMenuOpen" class="profile-dropdown">
            <button @click="handleMyPage">MyPage</button>
            <button @click="handleLogout" class="logout">Logout</button>
          </div>
        </transition>
      </div>

      <!-- [기능 분기] 햄버거 메뉴 버튼 (isPanorama일 때만 표시) -->
      <button v-if="isPanorama" class="nav-toggle-btn" @click="toggleNav">
        <span v-if="!isNavOpen"><HamburgerIcon /></span>
        <span v-else><CloseIcon /></span>
      </button>
    </div>

    <!-- [기능 분기] 네비게이션 드로어 (isPanorama일 때만 표시) -->
    <transition name="slide-fade">
      <nav v-if="isPanorama && isNavOpen" class="main-nav">
        <ul>
          <li v-for="(era, index) in eras" :key="era.id" :class="[{ active: currentEraIndex === index }, era.type]">
            <a href="#" @click.prevent="handleScrollToEra(index)">
              <span class="nav-idx">{{ String(index + 1).padStart(2, '0') }}</span>
              <span class="nav-title">{{ era.title }}</span>
            </a>
          </li>
        </ul>
      </nav>
    </transition>
  </header>
</template>

<style lang="scss" scoped>
@use 'sass:color';

.header-bar {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  max-width: 100vw;
  z-index: 40;
  padding: 1rem 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: white;

  @include mobile {
    backdrop-filter: blur(5px);
  }

  /* panorama-mode 스타일 고정 */
  &.panorama-mode {
    mix-blend-mode: difference;

    .light & {
      mix-blend-mode: normal;
    }

    @include mobile {
      mix-blend-mode: normal;
    }
  }

  .logo {
    font-size: 1.25rem;
    font-weight: 700;
    font-family: 'Noto Serif KR', serif;
    background-image: url('/img/common/gradient.webp');
    background-repeat: no-repeat;
    background-position: center center;
    background-size: cover;
    background-clip: text;
    -webkit-background-clip: text;
    color: transparent;
    cursor: pointer;

    .light & {
      filter: invert(1);
    }

    @include mobile {
      font-size: 16px;
    }
  }

  .header-controls {
    display: flex;
    align-items: center;
    gap: 1rem;
    position: fixed;
    left: 50%;
    transform: translateX(-50%);

    .light & {
      filter: invert(1);
    }
    @include mobile {
      left: 50%;
      bottom: 6.5rem;
    }

    .progress-track {
      height: 0.25rem;
      width: 8rem;
      background-color: #374151;
      border-radius: 9999px;
      overflow: hidden;
      @include mobile {
        width: 70vw;
      }
      .progress-fill {
        height: 100%;
        background: url('/img/common/gradient.webp') no-repeat center center/cover;
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

  .right-actions {
    display: flex;
    align-items: center;
    gap: 1rem;
    z-index: 60;

    .login-btn {
      background: transparent;
      border: 1px solid rgba(255, 255, 255, 0.3);
      color: white;
      padding: 0.5rem 1rem;
      border-radius: 2rem;
      font-size: 0.75rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s;
      margin-right: 0.5rem;
      &:hover {
        background: white;
        color: #020617;
      }
      @include mobile {
        padding: 0.4rem 0.8rem;
        font-size: 12px;
      }
    }

    /* [수정] 프로필 래퍼 스타일 */
    .user-profile-wrapper {
      position: relative;
      display: flex; /* 닉네임과 이미지 가로 정렬 */
      align-items: center;
      gap: 0.5rem;
      cursor: pointer;

      /* [추가] 닉네임 스타일 */
      .user-name {
        font-size: 0.875rem;
        font-weight: 600;
        color: white;

        .light & {
          font-weight: 400;
          filter: invert(1);
        }

        @include mobile {
          display: none; /* 모바일에서는 숨김 */
        }
      }
    }

    .user-profile {
      width: 2rem;
      aspect-ratio: 1/1;
      border-radius: 50%;
      overflow: hidden;
      cursor: pointer;
      border: 1px solid rgba(255, 255, 255, 0.5);
      //margin-right: 0.5rem;
      @include mobile {
        width: 3.5rem;
      }

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }

    .profile-dropdown {
      position: absolute;
      top: 120%;
      right: 0;
      background: #1e293b;
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 0.5rem;
      padding: 0.5rem;
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
      min-width: 120px;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.5);
      button {
        background: transparent;
        border: none;
        color: #94a3b8;
        padding: 0.5rem;
        text-align: left;
        cursor: pointer;
        font-size: 0.875rem;
        border-radius: 0.25rem;
        transition: all 0.2s;
        white-space: nowrap;

        @include mobile {
          font-size: 14px;
          padding: 14px 10px;
        }

        &:hover {
          background: rgba(255, 255, 255, 0.05);
          color: white;
        }
        &.logout {
          color: #ef4444;
          &:hover {
            background: rgba(239, 68, 68, 0.1);
          }
        }
      }
    }

    .nav-toggle-btn {
      font-size: 1rem;
      background: transparent;
      border: none;
      color: white;
      cursor: pointer;
      padding: 0;
      @include mobile {
        font-size: 12px;
      }

      .light & {
        filter: invert(1);
      }
    }
  }

  /* 네비게이션 메뉴 */
  .main-nav {
    position: fixed;
    top: 60px;
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
    @include mobile {
      top: 45px;
      background: rgba(30, 41, 59, 0.9);
    }

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
          color: #94a3b8;
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
            color: #64748b;
            @include mobile {
              font-size: 12px;
            }
          }
          .nav-title {
            font-weight: 500;
            font-size: 0.875rem;
            @include mobile {
              font-size: 14px;
            }
          }
        }
        &.active.OT a {
          background-color: rgba(6, 182, 212, 0.2);
          color: color.adjust(#06b6d4, $lightness: 20%);
          .nav-idx {
            color: rgba(6, 182, 212, 0.7);
          }
        }
        &.active.NT a {
          background-color: rgba(244, 63, 94, 0.2);
          color: color.adjust(#f43f5e, $lightness: 20%);
          .nav-idx {
            color: rgba(244, 63, 94, 0.7);
          }
        }
      }
    }
  }
}

/* Transitions */
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.3s ease-out;
}
.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateY(-10px);
  opacity: 0;
}
.dropdown-fade-enter-active,
.dropdown-fade-leave-active {
  transition: all 0.2s ease-out;
}
.dropdown-fade-enter-from,
.dropdown-fade-leave-to {
  opacity: 0;
  transform: translateY(-5px);
}

@media (max-width: 767px) {
  .hidden-mobile {
    display: none !important;
  }
}

/* --- [추가] Day/Night Toggle CSS Start --- */
/* 원본 디자인을 유지하되 SCSS 변수 활용 */
$toggleHeight: 70px;
$toggleWidth: 125px;
$borderWidth: 5px;
$toggleBtnRadius: $toggleHeight - 14px;

$bgColor--night: #3c4145;
$borderColor--night: #1c1c1c;
$toggleBtn-bgColor--night: #fff;
$toggleBtn-borderColor--night: #e3e3c7;

$bgColor--day: #9ee3fb;
$borderColor--day: #86c3d7;
$toggleBtn-bgColor--day: #ffdf6d;
$toggleBtn-borderColor--day: #e1c348;

$cloud-borderColor: #d3d3d3;
$cloud-bgColor: #fff;

.theme-toggle-wrapper {
  /* 헤더에 맞게 크기 조절 (원본이 커서 0.4배로 축소) */
  transform: scale(0.4);
  width: 50px; /* 공간 차지용 (scale은 공간을 줄이지 않으므로) */
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 0.5rem;

  /* 스케일로 인해 발생하는 여백 보정 */
  .toggle {
    margin-top: 0;
    transform-origin: center center;
  }
}

.toggle {
  display: block;
  text-align: center;
  user-select: none;
}

.toggle--checkbox {
  display: none;
}

.toggle--btn {
  display: block;
  margin: 0 auto;
  font-size: 1.4em;
  transition: all 350ms ease-in;
  cursor: pointer;
}

.toggle--btn,
.toggle--checkbox,
.toggle--feature {
  &,
  &:before,
  &:after {
    transition: all 250ms ease-in;
  }
  &:before,
  &:after {
    content: '';
    display: block;
  }
}

/* Day/Night specific */
.toggle--daynight {
  .toggle--btn {
    position: relative;
    height: $toggleHeight;
    width: $toggleWidth;
    border-radius: $toggleHeight;
    border: $borderWidth solid $borderColor--night;
    background-color: $bgColor--night;

    // Toggle button (Moon/Sun circle)
    &:before {
      position: absolute;
      top: 2px;
      left: 4px;
      width: $toggleBtnRadius;
      height: $toggleBtnRadius;
      border-radius: 50%;
      background-color: $toggleBtn-bgColor--night;
      border: $borderWidth solid $toggleBtn-borderColor--night;
    }

    // Cloud (Initially hidden)
    &:after {
      position: absolute;
      top: 62%;
      left: $toggleWidth - ($toggleBtnRadius) - ($borderWidth * 2) - 20px;
      z-index: 10;
      width: calc($toggleBtnRadius / 5);
      height: calc($toggleBtnRadius / 5);
      opacity: 0;
      background-color: $cloud-bgColor;
      border-radius: 50%;

      // Cloud shape using box-shadow
      box-shadow:
        $cloud-bgColor 0 0,
        $cloud-bgColor 3px 0,
        $cloud-bgColor 6px 0,
        $cloud-bgColor 9px 0,
        $cloud-bgColor 11px 0,
        $cloud-bgColor 14px 0,
        $cloud-bgColor 16px 0,
        $cloud-bgColor 21px -1px 0 1px,
        $cloud-bgColor 16px -7px 0 -2px,
        $cloud-bgColor 7px -7px 0 1px,
        $cloud-borderColor 0 0 0 4px,
        $cloud-borderColor 6px 0 0 4px,
        $cloud-borderColor 11px 0 0 4px,
        $cloud-borderColor 16px 0 0 4px,
        $cloud-borderColor 21px -1px 0 5px,
        $cloud-borderColor 16px -7px 0 1px,
        $cloud-borderColor 7px -7px 0 5px;
      transition: opacity 100ms ease-in;
    }
  }

  // Stars
  .toggle--feature {
    display: block;
    position: absolute;
    top: 9px;
    left: 52.5%;
    z-index: 20;
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background-color: #fff;

    box-shadow:
      rgba(255, 255, 255, 0.1) 30px -3px 0 0,
      rgba(255, 255, 255, 0.1) 12px 10px 0 -1px,
      #fff 38px 18px 0 1px,
      rgba(255, 255, 255, 0.1) 32px 34px 0 0,
      #fff 20px 24px 0 -1.5px,
      rgba(255, 255, 255, 0.1) 5px 38px 0 1px;
    animation: starry_star 5s ease-in-out infinite;

    // Moon craters
    &:before {
      position: absolute;
      top: -2px;
      left: -25px;
      width: 18px;
      height: 18px;
      background-color: $toggleBtn-bgColor--night;
      border-radius: 50%;
      border: 5px solid $toggleBtn-borderColor--night;
      box-shadow:
        $toggleBtn-borderColor--night -28px 0 0 -3px,
        $toggleBtn-borderColor--night -8px 24px 0 -2px;
      transform-origin: -6px 130%;
    }
  }

  // Active state (Day)
  .toggle--checkbox:checked {
    & + .toggle--btn {
      background-color: $bgColor--day;
      border: $borderWidth solid $borderColor--day;

      &:before {
        left: $toggleWidth - ($toggleBtnRadius) - ($borderWidth * 2) - 4px;
        background-color: $toggleBtn-bgColor--day;
        border: $borderWidth solid $toggleBtn-borderColor--day;
      }
      &:after {
        opacity: 100;
        animation-name: bounceIn;
        animation-duration: 0.6s;
        animation-delay: 0.1s;
        animation-fill-mode: backwards;
        animation-timing-function: ease-in-out;
      }

      > .toggle--feature {
        opacity: 0;
        box-shadow:
          rgba(255, 255, 255, 0.1) 30px -3px 0 -4px,
          rgba(255, 255, 255, 0.1) 12px 10px 0 -5px,
          #fff 38px 18px 0 -3px,
          rgba(255, 255, 255, 0.1) 32px 34px 0 -4px,
          #fff 20px 24px 0 -5.5px,
          rgba(255, 255, 255, 0.1) 5px 38px 0 -3px;
        animation: none;

        &:before {
          left: 25px;
          transform: rotate(70deg);
        }
      }
    }
  }
}

@keyframes starry_star {
  50% {
    background-color: rgba(255, 255, 255, 0.1);
    box-shadow:
      #fff 30px -3px 0 0,
      #fff 12px 10px 0 -1px,
      rgba(255, 255, 255, 0.1) 38px 18px 0 1px,
      #fff 32px 34px 0 0,
      rgba(255, 255, 255, 0.1) 20px 24px 0 -1.5px,
      #fff 5px 38px 0 1px;
  }
}

@keyframes bounceIn {
  0% {
    opacity: 0;
    transform: scale(0.3);
  }
  50% {
    opacity: 100;
    transform: scale(1.1);
  }
  55% {
    transform: scale(1.1);
  }
  75% {
    transform: scale(0.9);
  }
  100% {
    opacity: 100;
    transform: scale(1);
  }
}
/* --- Day/Night Toggle CSS End --- */
</style>

<script setup>
import { ref, onMounted } from 'vue';
import { auth, googleProvider } from '@/firebase';
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import HamburgerIcon from '@/components/icons/HamburgerIcon.vue';
import CloseIcon from '@/components/icons/CloseIcon.vue';

const props = defineProps({
  // 파노라마 페이지 전용 모드 활성화 여부
  isPanorama: {
    type: Boolean,
    default: false,
  },
  // 파노라마용 데이터 (옵션)
  progress: Number,
  currentEraIndex: Number,
  eras: Array,
  isNavOpen: Boolean,
});

const emit = defineEmits(['toggleNav', 'scrollToEra']);

// 사용자 상태 (헤더 내부에서 독립적으로 관리)
const currentUser = ref(null);
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
    } catch (error) {
      console.error('Logout Failed:', error);
    }
  }
};

const toggleProfileMenu = () => {
  isProfileMenuOpen.value = !isProfileMenuOpen.value;
};

const handleMyPage = () => {
  alert('마이페이지는 준비 중입니다.');
  isProfileMenuOpen.value = false;
};

// Auth 상태 감지
onMounted(() => {
  onAuthStateChanged(auth, (user) => {
    currentUser.value = user;
  });
});
</script>

<template>
  <header class="header-bar" :class="{ 'panorama-mode': isPanorama }">
    <h1 class="logo"><a href="/">BIBLE PANORAMA</a></h1>

    <!-- [파노라마 전용] 중앙 진행 바 -->
    <div v-if="isPanorama" class="header-controls">
      <div class="progress-track">
        <div class="progress-fill" :style="{ width: progress + '%' }"></div>
      </div>
      <span class="step-indicator">PART {{ currentEraIndex + 1 }}</span>
    </div>

    <!-- 우측 컨트롤 영역 (공통: 로그인 + 파노라마용: 메뉴) -->
    <div class="right-actions">
      <!-- 로그인/프로필 (공통) -->
      <button v-if="!currentUser" class="login-btn" @click="handleLogin">Login</button>
      <div v-else class="user-profile-wrapper">
        <div class="user-profile" @click="toggleProfileMenu" :title="currentUser.displayName">
          <img :src="currentUser.photoURL" alt="Profile" />
        </div>

        <!-- 프로필 드롭다운 -->
        <transition name="dropdown-fade">
          <div v-if="isProfileMenuOpen" class="profile-dropdown">
            <button @click="handleMyPage">My Page</button>
            <button @click="handleLogout" class="logout">Logout</button>
          </div>
        </transition>
      </div>

      <!-- [파노라마 전용] 햄버거 메뉴 버튼 -->
      <button v-if="isPanorama" class="nav-toggle-btn" @click="$emit('toggleNav')">
        <span v-if="!isNavOpen"><HamburgerIcon /></span>
        <span v-else><CloseIcon /></span>
      </button>
    </div>

    <!-- [파노라마 전용] 네비게이션 드로어 -->
    <transition name="slide-fade">
      <nav v-if="isPanorama && isNavOpen" class="main-nav">
        <ul>
          <li v-for="(era, index) in eras" :key="era.id" :class="[{ active: currentEraIndex === index }, era.type]">
            <a href="#" @click.prevent="$emit('scrollToEra', index)">
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
  z-index: 40;
  padding: 1rem 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  mix-blend-mode: difference;
  color: white;

  @include mobile {
    mix-blend-mode: normal;
  }

  .logo {
    font-size: 1.25rem;
    font-weight: 700;
    font-family: 'Noto Serif KR', serif;
    @include mobile {
      font-size: 16px;
    }
    a {
      background-image: url('/img/common/gradient.webp');
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
    left: 50%;
    transform: translateX(-50%);
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
    gap: 0.5rem;
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

    .user-profile-wrapper {
      position: relative;
    }
    .user-profile {
      width: 2rem;
      aspect-ratio: 1/1;
      border-radius: 50%;
      overflow: hidden;
      cursor: pointer;
      border: 1px solid rgba(255, 255, 255, 0.5);
      margin-right: 0.5rem;
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
</style>

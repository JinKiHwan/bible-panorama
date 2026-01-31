<script setup>
import { ref, onMounted, onUnmounted } from 'vue'; // onUnmounted 추가
import { useRouter } from 'vue-router';
import { auth, db } from '@/firebase';
import { updateProfile, deleteUser, onAuthStateChanged } from 'firebase/auth';
import { collection, query, where, getDocs } from 'firebase/firestore';

import { erasData } from '@/data/bibleData';

const router = useRouter();
const currentUser = ref(null);
const loading = ref(true);

// 프로필 관련 상태
const nickname = ref('');
const isEditing = ref(false);
const newNickname = ref('');

// 클리어 데이터 관리
const clearedEraIds = ref(new Set());

// 리스너 해제 함수 저장용 변수
let authListenerUnsubscribe = null;

// --- 초기화 및 데이터 로드 ---
onMounted(() => {
  // 리스너를 변수에 할당
  authListenerUnsubscribe = onAuthStateChanged(auth, async (user) => {
    if (user) {
      currentUser.value = user;
      nickname.value = user.displayName || '이름 없음';
      newNickname.value = user.displayName || '';

      await loadClearStatus(user.uid);
      loading.value = false;
    } else {
      // [수정] loading.value = true; 제거
      // 페이지가 이동되는 동안 기존 화면이 유지되도록 두는 것이 DOM 에러를 방지합니다.
      router.replace('/');
    }
  });
});

// 컴포넌트가 사라질 때 리스너 해제
onUnmounted(() => {
  if (authListenerUnsubscribe) {
    authListenerUnsubscribe();
  }
});

// Firestore에서 클리어 기록 가져오기
const loadClearStatus = async (userId) => {
  try {
    const q = query(collection(db, 'cleared_status'), where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    const clears = new Set();
    querySnapshot.forEach((doc) => {
      clears.add(doc.data().eraId);
    });
    clearedEraIds.value = clears;
  } catch (error) {
    console.error('클리어 기록 로드 실패:', error);
  }
};

// --- 프로필 기능 ---
const startEdit = () => {
  isEditing.value = true;
};

const cancelEdit = () => {
  isEditing.value = false;
  newNickname.value = nickname.value;
};

const saveProfile = async () => {
  if (!newNickname.value.trim()) return alert('닉네임을 입력해주세요.');

  try {
    await updateProfile(currentUser.value, {
      displayName: newNickname.value,
    });
    nickname.value = newNickname.value;
    isEditing.value = false;
    alert('프로필이 수정되었습니다.');
  } catch (error) {
    console.error('프로필 수정 실패:', error);
    alert('오류가 발생했습니다.');
  }
};

const handleImageClick = () => {
  alert('프로필 이미지 변경 기능은 준비 중입니다.');
};

// --- 회원 탈퇴 ---
const handleWithdrawal = async () => {
  if (!confirm('정말로 탈퇴하시겠습니까?\n모든 묵상 노트와 클리어 기록이 사라질 수 있습니다.')) return;

  try {
    const user = auth.currentUser;
    await deleteUser(user);
    alert('회원 탈퇴가 완료되었습니다.');
    // 로그아웃 상태가 감지되어 자동으로 이동되지만, 명시적 이동도 안전합니다.
    router.replace('/');
  } catch (error) {
    console.error('탈퇴 실패:', error);
    if (error.code === 'auth/requires-recent-login') {
      alert('보안을 위해 다시 로그인한 후 탈퇴를 진행해주세요.');
    } else {
      alert('탈퇴 처리 중 오류가 발생했습니다.');
    }
  }
};

const handleHeaderLogout = () => {
  // AppHeader에서 처리됨
};
</script>

<template>
  <div class="mypage-container">
    <div class="content-wrapper" v-if="!loading">
      <!-- 1. 프로필 섹션 -->
      <section class="profile-section">
        <div class="profile-card">
          <div class="avatar-wrapper" @click="handleImageClick">
            <img :src="currentUser?.photoURL || '/img/default_avatar.png'" alt="Profile" />
            <div class="edit-overlay">📷</div>
          </div>

          <div class="info-wrapper">
            <div class="email">{{ currentUser?.email }}</div>

            <div v-if="!isEditing" class="nickname-display">
              <h2>{{ nickname }}</h2>
              <button class="edit-btn" @click="startEdit">수정</button>
            </div>

            <div v-else class="nickname-edit">
              <input type="text" v-model="newNickname" placeholder="새 닉네임" maxlength="10" />
              <div class="btn-group">
                <button class="save-btn" @click="saveProfile">저장</button>
                <button class="cancel-btn" @click="cancelEdit">취소</button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 2. 나의 여정 (클리어 리스트) -->
      <section class="journey-section">
        <h3 class="section-title">
          나의 여정 <span class="count">{{ clearedEraIds.size }} / {{ erasData.length }}</span>
        </h3>

        <div class="era-grid">
          <div v-for="era in erasData" :key="era.id" class="era-item" :class="{ clear: clearedEraIds.has(era.id) }">
            <div class="era-info">
              <span class="era-type" :class="era.type">{{ era.type === 'OT' ? '구약' : '신약' }}</span>
              <h4 class="era-title">{{ era.title }}</h4>
            </div>
            <div class="status-icon">
              <span v-if="clearedEraIds.has(era.id)">🏅</span>
              <span v-else class="locked">🔒</span>
            </div>
          </div>
        </div>
      </section>

      <!-- 3. 계정 관리 -->
      <section class="account-section">
        <button class="withdraw-btn" @click="handleWithdrawal">회원 탈퇴</button>
      </section>
    </div>

    <div v-else class="loading-screen">
      <p>Loading...</p>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use 'sass:color';

/* 다크 모드 기본 스타일 */
$bg-color: #020617;
$card-bg: rgba(30, 41, 59, 0.5);
$border-color: rgba(255, 255, 255, 0.1);
$text-primary: #f1f5f9;
$text-secondary: #94a3b8;
$accent-color: #6366f1;
$gold-color: #fbbf24;

.mypage-container {
  min-height: 100vh;
  background-color: $bg-color;
  color: $text-primary;
  padding-top: 80px;
  padding-bottom: 80px;
  font-family: 'Noto Sans KR', sans-serif;
}

.content-wrapper {
  max-width: 768px;
  margin: 0 auto;
  padding: 0 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 3rem;
}

/* 1. 프로필 섹션 */
.profile-section {
  .profile-card {
    background: $card-bg;
    border: 1px solid $border-color;
    border-radius: 1.5rem;
    padding: 2rem;
    display: flex;
    align-items: center;
    gap: 2rem;

    @media (max-width: 600px) {
      flex-direction: column;
      text-align: center;
      gap: 1rem;
    }

    .avatar-wrapper {
      position: relative;
      width: 100px;
      height: 100px;
      border-radius: 50%;
      overflow: hidden;
      cursor: pointer;
      border: 3px solid rgba($accent-color, 0.5);

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      .edit-overlay {
        position: absolute;
        inset: 0;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0;
        transition: opacity 0.2s;
        font-size: 1.5rem;
      }

      &:hover .edit-overlay {
        opacity: 1;
      }
    }

    .info-wrapper {
      flex: 1;

      .email {
        font-size: 0.875rem;
        color: $text-secondary;
        margin-bottom: 0.5rem;

        @include mobile {
          font-size: 14px;
          margin-bottom: 10px;
        }
      }

      .nickname-display {
        display: flex;
        align-items: center;
        gap: 0.75rem;

        @media (max-width: 600px) {
          justify-content: center;
        }

        h2 {
          font-size: 1.75rem;
          font-weight: 700;
          margin: 0;

          @include mobile {
            font-size: 18px;
          }
        }

        .edit-btn {
          font-size: 0.75rem;
          padding: 0.25rem 0.5rem;
          border: 1px solid $border-color;
          background: transparent;
          color: $text-secondary;
          border-radius: 0.25rem;
          cursor: pointer;

          @include mobile {
            font-size: 14px;
          }
          &:hover {
            color: white;
            border-color: white;
          }
        }
      }

      .nickname-edit {
        display: flex;
        gap: 0.5rem;

        @media (max-width: 600px) {
          flex-direction: column;
        }

        input {
          background: rgba(0, 0, 0, 0.3);
          border: 1px solid $border-color;
          color: white;
          padding: 0.5rem;
          border-radius: 0.5rem;
          font-size: 1rem;

          @include mobile {
            font-size: 18px;
          }
          &:focus {
            outline: none;
            border-color: $accent-color;
          }
        }

        .btn-group {
          display: flex;
          gap: 0.5rem;
          @media (max-width: 600px) {
            justify-content: center;
          }
        }

        button {
          padding: 0.5rem 1rem;
          border-radius: 0.5rem;
          font-size: 0.875rem;
          cursor: pointer;
          border: none;
          @include mobile {
            font-size: 14px;
          }

          &.save-btn {
            background: $accent-color;
            color: white;
            &:hover {
              background: color.adjust($accent-color, $lightness: -5%);
            }
          }
          &.cancel-btn {
            background: transparent;
            border: 1px solid $border-color;
            color: $text-secondary;
            &:hover {
              color: white;
            }
          }
        }
      }
    }
  }
}

/* 2. 여정 (클리어 리스트) */
.journey-section {
  .section-title {
    font-size: 1.25rem;
    font-weight: 700;
    margin-bottom: 1.5rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;

    @include mobile {
      font-size: 16px;
    }

    .count {
      font-size: 0.875rem;
      color: $accent-color;
      background: rgba($accent-color, 0.1);
      padding: 0.25rem 0.5rem;
      border-radius: 999px;

      @include mobile {
        font-size: 16px;
      }
    }
  }

  .era-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 1rem;

    .era-item {
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid $border-color;
      border-radius: 1rem;
      padding: 1.25rem;
      position: relative;
      transition: all 0.3s;
      overflow: hidden;

      &.clear {
        border-color: $gold-color;
        background: linear-gradient(135deg, rgba($gold-color, 0.1) 0%, rgba(255, 255, 255, 0.03) 100%);
        box-shadow: 0 0 15px rgba($gold-color, 0.15);

        .status-icon span {
          font-size: 1.5rem;
          filter: drop-shadow(0 0 5px rgba($gold-color, 0.5));
        }
      }

      &:not(.clear) {
        opacity: 0.5;
        .status-icon .locked {
          filter: grayscale(1);
        }
      }

      .era-info {
        margin-bottom: 1rem;

        .era-type {
          font-size: 0.7rem;
          font-weight: 700;
          padding: 0.1rem 0.4rem;
          border-radius: 0.25rem;
          margin-bottom: 0.25rem;
          display: inline-block;
          @include mobile {
            font-size: 14px;
          }

          &.OT {
            color: $ot-color;
            background: rgba(6, 182, 212, 0.1);
          }
          &.NT {
            color: $nt-color;
            background: rgba(244, 63, 94, 0.1);
          }
        }

        .era-title {
          font-size: 1rem;
          margin: 0.5rem 0 0;
          font-weight: 600;
          @include mobile {
            font-size: 16px;
          }
        }
      }

      .status-icon {
        position: absolute;
        bottom: 0.75rem;
        right: 0.75rem;
        font-size: 1.25rem;

        @include mobile {
          font-size: 14px;
        }
      }
    }
  }
}

/* 3. 계정 관리 */
.account-section {
  text-align: right;
  padding-top: 2rem;
  border-top: 1px solid $border-color;

  .withdraw-btn {
    background: transparent;
    border: none;
    color: #ef4444; /* red-500 */
    font-size: 0.875rem;
    text-decoration: underline;
    cursor: pointer;
    opacity: 0.7;
    transition: opacity 0.2s;

    @include mobile {
      font-size: 14px;
    }

    &:hover {
      opacity: 1;
    }
  }
}

.loading-screen {
  height: 80vh;
  display: flex;
  align-items: center;
  justify-content: center;
  color: $text-secondary;
}
</style>

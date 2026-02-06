<script setup>
import { ref, onMounted, computed, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { auth, db } from '@/firebase';
import { updateProfile, deleteUser, onAuthStateChanged } from 'firebase/auth';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { erasData } from '@/data/bibleData';

const router = useRouter();
const currentUser = ref(null);
const loading = ref(true);

const nickname = ref('');
const isEditing = ref(false);
const newNickname = ref('');

// 데이터 구조: Map (eraId -> { clearCount, solvedIds })
const eraProgressMap = ref(new Map());

// 문제표 모달 상태
const isQuizLogOpen = ref(false);
const selectedEraForLog = ref(null);

let authListenerUnsubscribe = null;

onMounted(() => {
    authListenerUnsubscribe = onAuthStateChanged(auth, async (user) => {
        if (user) {
            currentUser.value = user;
            nickname.value = user.displayName || '이름 없음';
            newNickname.value = user.displayName || '';

            await loadUserProgress(user.uid);
            loading.value = false;
        } else {
            router.replace('/');
        }
    });
});

onUnmounted(() => {
    if (authListenerUnsubscribe) {
        authListenerUnsubscribe();
    }
});

const loadUserProgress = async (userId) => {
    try {
        const q = query(collection(db, 'user_progress'), where('userId', '==', userId));
        const querySnapshot = await getDocs(q);

        const newMap = new Map();
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            newMap.set(data.eraId, {
                clearCount: data.clearCount || 0,
                solvedIds: data.solvedQuizIds || [],
            });
        });
        eraProgressMap.value = newMap;
    } catch (error) {
        console.error('진행 상황 로드 실패:', error);
    }
};

// 전체 유저 티어 계산 (총합)
const totalClearCount = computed(() => {
    let sum = 0;
    eraProgressMap.value.forEach((val) => (sum += val.clearCount));
    return sum;
});

const userTier = computed(() => {
    const count = totalClearCount.value;
    if (count === 0) return '방랑자 (Wanderer)';
    if (count < 5) return '순례자 (Pilgrim)';
    if (count < 15) return '구도자 (Seeker)';
    if (count < 30) return '전도자 (Evangelist)';
    if (count < 50) return '선지자 (Prophet)';
    return '사도 (Apostle)';
});

// [헬퍼] 해당 시대의 클리어 횟수 가져오기
const getClearCount = (eraId) => {
    return eraProgressMap.value.get(eraId)?.clearCount || 0;
};

// [추가] 시대별 마스터리 칭호 반환 함수
const getEraTierName = (count) => {
    if (count <= 0) return '';
    if (count === 1) return '입문자';
    if (count === 2) return '탐험가';
    if (count === 3) return '숙련자';
    if (count === 4) return '전문가';
    return '마스터'; // 5회 이상
};

// 문제표 열기
const openQuizLog = (era) => {
    selectedEraForLog.value = era;
    isQuizLogOpen.value = true;
};

const closeQuizLog = () => {
    isQuizLogOpen.value = false;
    selectedEraForLog.value = null;
};

// 푼 문제인지 확인하는 헬퍼
const isQuizSolved = (eraId, quizId) => {
    const progress = eraProgressMap.value.get(eraId);
    return progress && progress.solvedIds && progress.solvedIds.includes(quizId);
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
</script>

<template>
    <div class="mypage-container">
        <div class="content-wrapper" v-if="!loading">
            <!-- 1. 프로필 & 티어 섹션 -->
            <section class="profile-section">
                <div class="profile-card">
                    <div class="avatar-wrapper" @click="handleImageClick">
                        <img :src="currentUser?.photoURL || '/img/default_avatar.png'" alt="Profile" />
                        <div class="edit-overlay">📷</div>
                    </div>

                    <div class="info-wrapper">
                        <div class="tier-badge">{{ userTier }}</div>

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

                        <div class="stats">
                            총 퀴즈 클리어: <span class="highlight">{{ totalClearCount }}</span> 회
                        </div>
                    </div>
                </div>
            </section>

            <!-- 2. 나의 여정 (클리어 리스트) -->
            <section class="journey-section">
                <h3 class="section-title">
                    나의 여정 <span class="count">{{ eraProgressMap.size }} / {{ erasData.length }}</span>
                    <span class="sub-text">(클릭하여 문제표 확인)</span>
                </h3>

                <div class="era-grid">
                    <div v-for="era in erasData" :key="era.id" class="era-item" :class="{ clear: getClearCount(era.id) > 0 }" @click="openQuizLog(era)">
                        <div class="era-info">
                            <span class="era-type" :class="era.type">{{ era.type === 'OT' ? '구약' : '신약' }}</span>
                            <h4 class="era-title">{{ era.title }}</h4>
                        </div>

                        <div class="status-badge-area">
                            <!-- [수정] 횟수 대신 티어 문구 표시 -->
                            <span v-if="getClearCount(era.id) > 0" class="tier-text" :class="'tier-' + Math.min(getClearCount(era.id), 5)">
                                {{ getEraTierName(getClearCount(era.id)) }}
                            </span>
                            <span v-else class="locked"> <span class="icon">🔒</span> 잠김 </span>
                        </div>
                    </div>
                </div>
            </section>

            <!-- 3. 계정 관리 -->
            <section class="account-section">
                <button class="withdraw-btn" @click="handleWithdrawal">회원 탈퇴</button>
            </section>
        </div>

        <!-- 로딩 화면 -->
        <div v-else class="loading-screen">
            <p>Loading...</p>
        </div>

        <!-- 문제표 모달 -->
        <transition name="fade">
            <div v-if="isQuizLogOpen" class="quiz-log-overlay" @click.self="closeQuizLog">
                <div class="quiz-log-modal">
                    <div class="modal-header">
                        <h3>{{ selectedEraForLog.title }} 문제표</h3>
                        <button class="close-btn" @click="closeQuizLog">✕</button>
                    </div>
                    <div class="modal-body custom-scroll">
                        <div v-if="selectedEraForLog.quiz && selectedEraForLog.quiz.length > 0" class="quiz-list">
                            <div v-for="quiz in selectedEraForLog.quiz" :key="quiz.id" class="quiz-item" :class="{ solved: isQuizSolved(selectedEraForLog.id, quiz.id) }">
                                <div class="quiz-status">
                                    {{ isQuizSolved(selectedEraForLog.id, quiz.id) ? '✅ 해결됨' : '🔒 잠김' }}
                                </div>
                                <div class="quiz-content">
                                    <p class="question" v-if="isQuizSolved(selectedEraForLog.id, quiz.id)">{{ quiz.question }}</p>
                                    <p class="question locked-text" v-else>문제를 풀어서 잠금을 해제하세요.</p>

                                    <div v-if="isQuizSolved(selectedEraForLog.id, quiz.id)" class="answer">정답: {{ quiz.options[quiz.answerIndex] }}</div>
                                </div>
                            </div>
                        </div>
                        <div v-else class="no-data">등록된 문제가 없습니다.</div>
                    </div>
                </div>
            </div>
        </transition>
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

/* 티어별 색상 정의 */
$tier-1: #94a3b8; /* 입문자 (회색) */
$tier-2: #60a5fa; /* 탐험가 (파랑) */
$tier-3: #a78bfa; /* 숙련자 (보라) */
$tier-4: #f87171; /* 전문가 (빨강) */
$tier-5: #fbbf24; /* 마스터 (골드) */

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

            @include mobile {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                gap: 6px;
            }

            .email {
                font-size: 0.875rem;
                color: $text-secondary;
                margin-bottom: 0.5rem;
            }

            .nickname-display {
                display: flex;
                align-items: center;
                gap: 0.75rem;

                @include mobile {
                    width: auto;
                    display: inline-block;
                    justify-content: center;
                    position: relative;
                }

                h2 {
                    font-size: 1.75rem;
                    font-weight: 700;
                    margin: 0;
                    @include mobile {
                        font-size: 16px;
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
                        font-size: 12px;
                        padding: 2px 6px;
                        position: absolute;
                        right: 0;
                        top: 50%;
                        transform: translate(100%, -50%);
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

/* 프로필 추가 스타일 */
.tier-badge {
    display: inline-block;
    background: $accent-color;
    color: white;
    padding: 0.2rem 0.6rem;
    border-radius: 0.5rem;
    font-size: 0.75rem;
    font-weight: 700;
    margin-bottom: 0.5rem;

    @include mobile {
        margin-bottom: 8px;
        font-size: 12px;
        padding: 5px 10px;
    }
}
.stats {
    margin-top: 1rem;
    font-size: 0.9rem;
    color: $text-secondary;
    @include mobile {
        font-size: 14px;
    }
    .highlight {
        color: $gold-color;
        font-weight: 700;
        font-size: 1.1rem;
        @include mobile {
            font-size: 14px;
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
                font-size: 14px;
            }
        }
        .sub-text {
            font-size: 0.8rem;
            color: $text-secondary;
            font-weight: normal;
            margin-left: 0.5rem;

            @include mobile {
                font-size: 12px;
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
            cursor: pointer;

            @include mobile {
                padding: 18px 16px;
            }

            /* 클리어 상태 스타일 */
            &.clear {
                border-color: $gold-color;
                background: linear-gradient(135deg, rgba($gold-color, 0.1) 0%, rgba(255, 255, 255, 0.03) 100%);
                box-shadow: 0 0 15px rgba($gold-color, 0.15);
            }

            &:hover {
                transform: translateY(-3px);
                border-color: $accent-color;
            }

            &:not(.clear) {
                opacity: 0.5;
                .status-badge-area .locked {
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
                        font-size: 12px;
                    }

                    &.OT {
                        color: #67e8f9;
                        background: rgba(6, 182, 212, 0.1);
                    }
                    &.NT {
                        color: #fda4af;
                        background: rgba(244, 63, 94, 0.1);
                    }
                }

                .era-title {
                    font-size: 1rem;
                    margin: 0.5rem 0 0;
                    font-weight: 600;

                    @include mobile {
                        font-size: 14px;
                    }
                }
            }

            /* [수정] 상태 표시 영역 (티어 텍스트) */
            .status-badge-area {
                position: absolute;
                bottom: 0.75rem;
                right: 0.75rem;

                @include mobile {
                    bottom: 14px;
                    right: 8px;
                }

                .tier-text {
                    font-size: 0.8rem;
                    font-weight: 700;
                    padding: 0.2rem 0.5rem;
                    border-radius: 0.3rem;
                    background: rgba(0, 0, 0, 0.5);

                    @include mobile {
                        font-size: 12px;
                    }

                    /* 티어별 색상 적용 */
                    &.tier-1 {
                        color: $tier-1;
                        border: 1px solid $tier-1;
                    }
                    &.tier-2 {
                        color: $tier-2;
                        border: 1px solid $tier-2;
                    }
                    &.tier-3 {
                        color: $tier-3;
                        border: 1px solid $tier-3;
                    }
                    &.tier-4 {
                        color: $tier-4;
                        border: 1px solid $tier-4;
                    }
                    &.tier-5 {
                        color: $tier-5;
                        border: 1px solid $tier-5;
                        box-shadow: 0 0 10px rgba($tier-5, 0.3);
                    }
                }

                .locked {
                    font-size: 0.8rem;
                    color: $text-secondary;
                    @include mobile {
                        font-size: 12px;
                    }
                    .icon {
                        margin-right: 2px;
                    }
                }
            }
        }
    }
}

/* 문제표 모달 스타일 */
.quiz-log-overlay {
    position: fixed;
    inset: 0;
    z-index: 200;
    background: rgba(0, 0, 0, 0.8);
    backdrop-filter: blur(5px);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1rem;
}
.quiz-log-modal {
    background: #1e293b;
    width: 100%;
    max-width: 600px;
    max-height: 80vh;
    border-radius: 1rem;
    border: 1px solid $border-color;
    display: flex;
    flex-direction: column;
}
.modal-header {
    padding: 1.5rem;
    border-bottom: 1px solid $border-color;
    display: flex;
    justify-content: space-between;
    align-items: center;
    h3 {
        margin: 0;
        font-size: 1.25rem;

        @include mobile {
            font-size: 14px;
        }
    }
    .close-btn {
        background: none;
        border: none;
        color: $text-secondary;
        font-size: 1.5rem;
        cursor: pointer;

        @include mobile {
            font-size: 14px;
        }
        &:hover {
            color: white;
        }
    }
}
.modal-body {
    max-height: 70vh;
    padding: 1.5rem;
    overflow-y: auto;

    &::-webkit-scrollbar {
        width: 3px;
    }

    &::-webkit-scrollbar-track {
        background: transparent; /* 스크롤바 뒷 배경 색상 */
    }

    &::-webkit-scrollbar-thumb {
        background: rgba($color: $ot-color, $alpha: 1);
        border-radius: 12px 12px 12px 12px;
    }
}
.quiz-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}
.quiz-item {
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid $border-color;
    border-radius: 0.5rem;
    padding: 1rem;
    &.solved {
        border-color: $accent-color;
        background: rgba($accent-color, 0.05);
    }
    .quiz-status {
        font-size: 0.75rem;
        margin-bottom: 0.5rem;
        color: $text-secondary;
        @include mobile {
            font-size: 12px;
        }
    }
    .question {
        margin: 0 0 0.5rem;
        font-weight: 500;
        @include mobile {
            font-weight: 400;
            font-size: 14px;
            line-height: 1.5;
        }
        &.locked-text {
            color: $text-secondary;
            font-style: italic;

            @include mobile {
                font-size: 12px;
            }
        }
    }
    .answer {
        font-size: 0.9rem;
        color: #4ade80;
        font-weight: 600;

        @include mobile {
            font-size: 14px;
        }
    }
}
.no-data {
    text-align: center;
    color: $text-secondary;
    padding: 2rem;
    @include mobile {
        font-size: 12px;
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
            font-size: 12px;
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

.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}
</style>

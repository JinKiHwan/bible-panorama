<script setup>
defineEmits(['enter']);
</script>

<template>
  <div class="intro-overlay">
    <div class="intro-overlay-wrap">
      <div class="content">
        <h1 class="logo">BIBLE PANORAMA</h1>
        <p class="subtitle">성경의 흐름을 한눈에</p>
        <button class="enter-btn" @click="$emit('enter')">입장하기</button>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.intro-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  background-color: #020617; /* 메인 배경색과 동일하게 */
  z-index: 9999; /* 최상위 레벨 */
  color: white;
  &-wrap {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    z-index: 0;
    &::before {
      content: '';
      width: 100%;
      height: 100%;
      position: absolute;
      left: 0;
      top: 0;
      background-image: url('/img/genesis_01.webp');
      background-repeat: no-repeat;
      background-position: center center;
      background-size: cover;
      opacity: 0.15;
      z-index: -1;
    }
  }
}

.content {
  text-align: center;
  animation: fadeIn 1s ease-out;

  .logo {
    font-family: 'Noto Serif KR', serif;
    font-size: 3rem;
    font-weight: 700;
    margin-bottom: 1rem;
    background-image: url('/img/common/gradient.webp');
    background-repeat: no-repeat;
    background-position: center center;
    background-size: cover;
    background-clip: text;
    -webkit-background-clip: text;
    color: transparent;

    @include mobile {
      font-size: min(34px, 8vw);
    }
  }

  .subtitle {
    font-size: 1.2rem;
    color: #94a3b8;
    margin-bottom: 3rem;
    font-weight: 300;
    @include mobile {
      font-size: min(14px, 3.5vw);
    }
  }

  .enter-btn {
    padding: 1rem 3rem;
    font-size: 1.1rem;
    font-weight: 600;
    color: #020617;
    background: #e2e8f0;
    border: none;
    border-radius: 9999px;
    cursor: pointer;
    transition: all 0.3s;

    @include mobile {
      font-size: min(16px, 3.5vw);
    }

    &:hover {
      background: white;
      transform: scale(1.05);
      box-shadow: 0 0 20px rgba(255, 255, 255, 0.3);
    }
  }
}

// @keyframes fadeIn {
//   from {
//     opacity: 0;
//     transform: translateY(20px);
//   }
//   to {
//     opacity: 1;
//     transform: translateY(0);
//   }
// }
</style>

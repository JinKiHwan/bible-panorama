<script setup>
defineEmits(['openPrivacy', 'openTerms']);
</script>

<template>
  <footer class="app-footer">
    <div class="footer-inner">
      <div class="copyright">&copy; 2026 <strong>Bible Panorama</strong>. All rights reserved.</div>
      <div class="legal-links">
        <button @click="$emit('openPrivacy')">개인정보처리방침</button>
        <span class="divider">|</span>
        <button @click="$emit('openTerms')">이용약관</button>
      </div>
    </div>
  </footer>
</template>

<style lang="scss" scoped>
@use 'sass:color';

.app-footer {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  z-index: 30; /* MainCard(10)보다 위, BookListPanel(50)보다 아래 */
  padding: 1rem 1.5rem;
  background: transparent; /* 배경 투명 (글자만 둥둥) */

  /* 모바일에서는 배경을 살짝 깔아 가독성 확보 */
  @include mobile {
    background: linear-gradient(to top, rgba(2, 6, 23, 0.9), transparent);
    padding: 1rem;
  }

  .footer-inner {
    max-width: 100%;
    margin: 0 auto;
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    font-size: 0.7rem;
    color: rgba(255, 255, 255, 0.3);

    @include mobile {
      flex-direction: column-reverse;
      align-items: center;
      gap: 0.5rem;
      font-size: 12px;
    }
  }

  .copyright {
    font-family: 'Noto Serif KR', serif;
    strong {
      color: rgba(255, 255, 255, 0.5);
      font-weight: 600;
    }
  }

  .legal-links {
    display: flex;
    align-items: center;
    gap: 0.5rem;

    button {
      background: transparent;
      border: none;
      color: rgba(255, 255, 255, 0.4);
      font-size: 0.7rem;
      cursor: pointer;
      padding: 0;
      transition: color 0.2s;

      @include mobile() {
        font-size: 12px;
      }

      &:hover {
        color: white;
        text-decoration: underline;
      }
    }

    .divider {
      color: rgba(255, 255, 255, 0.1);
      font-size: 0.6rem;
    }
  }
}
</style>

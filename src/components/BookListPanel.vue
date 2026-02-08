<script setup>
defineProps({
  isVisible: Boolean,
  currentEra: Object,
  selectedBook: Object,
});

const emit = defineEmits(['close', 'selectBook']);
</script>

<template>
  <div class="bottom-panel" :class="{ show: isVisible }">
    <div class="panel-inner">
      <div class="panel-header">
        <div class="header-text">
          <h3>📚 {{ currentEra.mainStream }}</h3>
          <p>이 시대의 역사적 배경 속에서 기록된 예언서, 시가서, 서신서들입니다.</p>
        </div>
        <button @click="$emit('close')" class="close-btn">
          <svg class="close-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>

      <div class="books-grid-wrapper custom-scroll">
        <div v-if="currentEra.relatedBooks.length > 0" class="books-grid">
          <div v-for="book in currentEra.relatedBooks" :key="book.name" class="book-card" :class="{ selected: selectedBook && selectedBook.name === book.name }" @click="$emit('selectBook', book)">
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

  <!-- 오버레이는 부모에서 처리하거나 여기서 포함해도 됨. 여기서는 Panel 안에 포함하지 않고 별도로 두는게 좋으나, 
       기존 구조상 오버레이는 뷰포트 전체를 덮어야 하므로 부모 컴포넌트에 두는 것이 맞습니다. -->
</template>

<style lang="scss" scoped>
@use 'sass:color';

.bottom-panel {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 60vh;
  background-color: $bg-color;
  border-top: 1px solid $border-color;
  z-index: 50;
  box-shadow: 0 -10px 40px rgba(0, 0, 0, 0.5);
  visibility: hidden;
  opacity: 0;
  transform: translateY(100%);
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);

  .light & {
    filter: invert(1);
    background-color: #111;
  }
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
    @include mobile {
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
        margin: 0 0 1rem;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        @include mobile {
          font-size: 22px;
        }
      }
      p {
        color: $text-secondary;
        font-size: 0.875rem;
        margin: 0.25rem 0 0 0;
        @include mobile {
          margin-top: 10px;
          font-size: 14px;
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
    &::-webkit-scrollbar {
      width: 5px;
    }
    &::-webkit-scrollbar-track {
      background: transparent;
    }
    &::-webkit-scrollbar-thumb {
      background: rgba($color: $ot-color, $alpha: 1);
      border-radius: 12px;
    }
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

      .light & {
        background-color: rgba(53, 53, 53, 0.5);
      }
      &.selected {
        border-color: $accent-color;
        background-color: #1e293b;

        .light & {
          background-color: rgba(53, 53, 53, 0.1);
        }
        .book-bg-icon {
          opacity: 0.1;
        }
        h4 {
          color: white;
        }
        .book-category span {
          background-color: rgba($accent-color, 0.3);
          color: color.adjust($accent-color, $lightness: 20%);
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
          color: color.adjust($accent-color, $lightness: 20%);
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
            font-size: 14px;
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
      font-size: 14px;
    }
    .empty-icon {
      font-size: 1.875rem;
      margin-bottom: 0.5rem;
      @include mobile {
        font-size: 14px;
      }
    }
    p {
      margin: 0;
      &.sub-text {
        font-size: 0.75rem;
        margin-top: 0.25rem;
        @include mobile {
          font-size: 14px;
        }
      }
    }
  }
}
</style>

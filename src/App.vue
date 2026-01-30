<script setup>
import { RouterView } from 'vue-router';

// 나중에 페이지 전환 효과(GSAP)를 위해 남겨둔 코드라면 그대로 두셔도 됩니다.
// import { useGsap } from '@/composables/useGsap';
// const { pageTransition } = useGsap();

const onEnter = (el, done) => {
  //pageTransition(el, done);
  done();
};
</script>

<template>
  <div class="app-container">
    <RouterView v-slot="{ Component }">
      <transition @enter="onEnter" :css="false" mode="out-in">
        <component :is="Component" />
      </transition>
    </RouterView>
  </div>
</template>

<style lang="scss">
.app-container {
  width: 100%;
  min-height: 100vh;
  position: relative;
  overflow: hidden;
}
</style>

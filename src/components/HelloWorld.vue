<script setup>
import { ref } from 'vue';

defineProps({
  msg: String,
});

const count = ref(0);
</script>

<template>
  <div>
    <p class="abc">aa</p>
  </div>
</template>

<style lang="scss" scoped>
.abc {
  color: #f00;

  @include mobile {
    color: yellow;
  }
}
.read-the-docs {
  color: #888;
}
</style>

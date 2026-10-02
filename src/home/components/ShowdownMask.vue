<script setup lang="ts">
import { onMounted, ref } from 'vue'

const display = ref(true)

onMounted(() => {
  display.value = false
})
</script>

<template>
  <Transition name="showdown-mask">
    <div v-if="display" class="showdown-mask"></div>
  </Transition>
</template>

<style scoped lang="scss">
.showdown-mask {
  position: fixed;
  inset: 0;
  z-index: 24;
  pointer-events: none;
  background-color: var(--color-main);

  &-leave-active {
    transition: opacity 0.5s ease-out;
  }

  &-leave-to {
    opacity: 0;
  }
}
</style>

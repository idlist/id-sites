<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    expand?: boolean
  }>(),
  {
    expand: false,
  },
)

const cssHeight = computed(() => props.expand ? '100lvh' : '100svh')
</script>

<template>
  <section class="page-full">
    <slot></slot>
  </section>
</template>

<style scoped lang="scss">
.page-full {
  width: 100%;
  height: 100vh;
  height: v-bind("cssHeight");

  min-height: 400px;
}
</style>

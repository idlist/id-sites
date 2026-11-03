<script setup lang="ts">
defineProps<{
  bold?: boolean
}>()
</script>

<template>
  <span :class="['no-wrap', { bold }]">
    <slot></slot>
  </span>
</template>

<style scoped lang="scss">
.no-wrap {
  white-space: nowrap;
}

.bold {
  font-weight: bold;
}
</style>

<script setup lang="ts">
import IconExternalLink from '@assets/icons/external-link.svg?component'

defineProps<{
  href?: string
}>()
</script>

<template>
  <div class="external-link">
    <a :href="href" target="_blank" rel="noopener noreferrer">
      <slot></slot>
    </a>
    <div class="icon"><IconExternalLink /></div>
  </div>
</template>

<style scoped lang="scss">
.external-link {
  display: inline-flex;
  align-items: center;

  > .icon {
    width: 1.5rem;
    height: 1.5rem;
  }
}
</style>

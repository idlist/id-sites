<script setup lang="ts">
import IconDoubleDown from '@assets/double-down.svg?component'
</script>

<template>
  <section class="home-bleed">
    <div class="icon"><IconDoubleDown /></div>
    <div class="prompt">MORE</div>
  </section>
</template>

<style scoped lang="scss">
.home-bleed {
  height: auto;
  min-height: calc(100lvh - 100svh);
  padding: 1rem 0;

  display: grid;
  align-items: center;
  justify-items: center;
  row-gap: 0.5rem;

  > .icon {
    width: 5rem;
  }

  > .prompt {
    font-size: 1.25rem;
    font-family: var(--font-unique);
    letter-spacing: 0.5rem;
    transform: translateX(0.25rem);
  }
}
</style>

<script setup lang="ts">
import IconDoubleDown from '@assets/double-down.svg?component'
import { m } from 'virtual:i18n'
</script>

<template>
  <section class="home-bleed">
    <div class="icon"><IconDoubleDown /></div>
    <div class="prompt">{{ m.homeMore() }}</div>
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
  row-gap: 0.75rem;

  > .icon {
    width: 7.5rem;
    animation: nudge 1.5s linear infinite;
  }

  > .prompt {
    font-size: 1.2rem;
    font-family: var(--font-unique);
    letter-spacing: 0.3em;
    transform: translateX(0.15em);
  }
}

@keyframes nudge {
  0% {
    transform: translateY(0);
    animation-timing-function: ease-out;
  }
  12% {
    transform: translateY(0.75rem);
    animation-timing-function: cubic-bezier(0.55, 0.06, 0.66, 0.9);
  }
  24% {
    transform: translateY(0);
  }
  30% {
    transform: translateY(0);
    animation-timing-function: ease-out;
  }
  42% {
    transform: translateY(0.75rem);
    animation-timing-function: cubic-bezier(0.55, 0.06, 0.66, 0.9);
  }
  54% {
    transform: translateY(0);
  }
  100% {
    transform: translateY(0);
  }
}

@media (prefers-reduced-motion: reduce) {
  .home-bleed > .icon {
    animation: none;
  }
}
</style>

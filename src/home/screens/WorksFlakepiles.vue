<script setup lang="ts">
import PageWorks from '@home/components/PageWorks.vue'
</script>

<template>
  <PageWorks>
    <div class="works-flakepiles">Flakepiles</div>
  </PageWorks>
</template>

<style scoped lang="scss">
.works-flakepiles {
  width: 100%;
  height: 100%;

  background-color: var(--color-main-deep);
  padding: 1rem;
  display: flex;
  align-items: center;
  justify-content: start;

  border-radius: 0.5rem 0 0 0.5rem;

  @media (max-aspect-ratio: 1/1) {
    align-items: start;
    border-radius: 0.5rem 0.5rem 0 0;
  }
}
</style>

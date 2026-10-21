<script setup lang="ts">
import PageCard from '@home/components/PageCard.vue'
</script>

<template>
  <PageCard>
    <div class="works-flakepiles">Flakepiles</div>
  </PageCard>
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

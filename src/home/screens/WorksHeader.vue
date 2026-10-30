<script setup lang="ts">
import WorksBulb from '@home/motions/WorksBulb.vue'
import { m } from 'virtual:i18n'
</script>

<template>
  <section class="works-header">
    <div class="content">
      <WorksBulb />
      <h2 class="id-section-title">{{ m.sectionWorks() }}</h2>
    </div>
  </section>
</template>

<style scoped lang="scss">
.works-header {
  display: flex;
  align-items: center;
  justify-content: center;

  padding: 4rem 1rem;

  > .content {
    display: grid;
    grid-template-columns: auto;
    align-items: center;
    justify-items: center;
    row-gap: 1rem;
  }
}

.works-title {
  font-size: 1.5rem;
  font-family: var(--font-unique);
  letter-spacing: 0.25rem;
}
</style>

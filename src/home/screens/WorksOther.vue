<script setup lang="ts">
import { m } from 'virtual:i18n'
</script>

<template>
  <section class="works-other">
    <div class="content">
      <h2 class="id-section-title">{{ m.sectionWorksOther() }}</h2>
      <div></div>
    </div>
  </section>
</template>

<style scoped lang="scss">
.works-other {
  display: flex;
  align-items: center;
  justify-content: center;

  min-height: max(80vh, 400px);
  min-height: max(80svh, 400px);
  padding: 2rem 0;

  > .content {
    max-width: 800px;
  }
}
</style>

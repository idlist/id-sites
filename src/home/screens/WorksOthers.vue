<script setup lang="ts">
import { m } from 'virtual:i18n'
</script>

<template>
  <section class="works-others">
    <div class="content">
      <h2 class="id-section-title">{{ m.sectionWorksOther() }}</h2>

      <div>
        <div>
          <code>npm-san-check</code>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped lang="scss">
.works-others {
  display: flex;
  align-items: center;
  justify-content: center;

  min-height: max(60vh, 400px);
  min-height: max(60svh, 400px);
  padding: 6rem 0;

  > .content {
    max-width: 800px;
  }
}
</style>

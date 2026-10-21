<script setup lang="ts">
import PageWorks from '@home/components/PageWorks.vue'
import WorksBadge from '../components/WorksBadge.vue'
</script>

<template>
  <PageWorks>
    <div class="works-flakepiles">
      <div class="works-content">
        <h2 class="title">Flakepiles</h2>

        <div class="badges">
          <WorksBadge color="#6bb5ff">Web Frontend</WorksBadge>
          <WorksBadge color="#b690fd">Obsidian Plugin</WorksBadge>
        </div>

        <div class="id-typeface">
          <p>
            An Obsidian plugin to collect small notes, stickies, code snippets or more in a single file, and manage them
            in a masonry layout with horizontal or vertical flow.
          </p>
        </div>

        <div></div>
      </div>
    </div>
  </PageWorks>
</template>

<style scoped lang="scss">
.works-flakepiles {
  width: 100%;
  height: 100%;

  display: flex;
  align-items: center;
  justify-content: start;
  background-color: var(--color-main-deep);

  padding: 1rem;
  border-radius: 0.5rem 0 0 0.5rem;

  @media (max-aspect-ratio: 3/4) {
    border-radius: 0.5rem 0.5rem 0 0;
  }

  @media (max-width: 640px) {
    padding: 0.5rem;
  }
}

.works-content {
  > .badges {
    display: flex;
    column-gap: 0.75rem;
    row-gap: 0.5rem;
  }

  > .title {
    font-family: var(--font-unique);
    font-weight: normal;
    font-size: 2rem;
    letter-spacing: 0.1rem;

    @media (max-width: 768px) {
      font-size: 1.5rem;
      letter-spacing: 0.075rem;
    }
  }
}
</style>

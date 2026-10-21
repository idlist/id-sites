<script setup lang="ts">
import BubbleRect20 from './BubbleRect20.vue'
</script>

<template>
  <section class="page-card">
    <div class="page-card-sticky">
      <BubbleRect20 class="fullheight">
        <div class="page-card-content">
          <div>
            <slot name="image"></slot>
          </div>
          <div></div>
          <slot></slot>
        </div>
      </BubbleRect20>
    </div>
  </section>
</template>

<style scoped lang="scss">
.page-card {
  height: 120vh;
  height: 120lvh;

  position: relative;
  display: flex;
  justify-content: center;
}

.page-card-sticky {
  position: sticky;

  --least-height: min(400px, 100lvh);
  --adaptive-top: calc((100vh - var(--least-height)) / 2);

  top: min(1rem, var(--adaptive-top));
  top: min(calc((100vh - 100svh + 2rem) / 2), var(--adaptive-top));
  height: calc(100vh - 2rem);
  height: calc(100svh - 2rem);

  width: 100%;
  max-width: 1080px;
  min-height: var(--least-height);

  padding: 1rem;

  > .fullheight {
    height: 100%;
  }
}

.page-card-content {
  width: 100%;
  height: 100%;

  display: grid;
  grid-template-columns: 1fr max-content 2fr;

  @media (max-aspect-ratio: 1/1) {
    grid-template-columns: auto;
    grid-template-rows: 1fr max-content 2fr;
  }
}
</style>

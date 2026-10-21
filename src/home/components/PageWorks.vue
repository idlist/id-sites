<script setup lang="ts">
import BubbleRect20 from './BubbleRect20.vue'
import BubbleSepH from './BubbleSepH.vue'
import BubbleSepV from './BubbleSepV.vue'
</script>

<template>
  <section class="page-works">
    <div class="page-works-sticky">
      <BubbleRect20 class="fullheight">
        <div class="page-works-layout">
          <div>
            <slot name="image"></slot>
          </div>

          <BubbleSepV class="sep-v" />
          <BubbleSepH class="sep-h" />

          <slot></slot>
        </div>
      </BubbleRect20>
    </div>
  </section>
</template>

<style scoped lang="scss">
.page-works {
  height: 150vh;
  height: 150lvh;

  position: relative;
  display: flex;
  justify-content: center;
}

.page-works-sticky {
  position: sticky;

  --least-height: 400px;
  --adaptive-top: calc((100vh - var(--least-height)) / 2);

  top: min(1rem, var(--adaptive-top));
  top: min(calc((100vh - 100svh + 2rem) / 2), var(--adaptive-top));
  height: calc(100vh - 2rem);
  height: calc(100svh - 2rem);

  width: 100%;
  max-width: 1200px;
  min-height: var(--least-height);

  padding: 1rem;

  > .fullheight {
    height: 100%;
  }
}

.page-works-layout {
  width: 100%;
  height: 100%;

  display: grid;
  grid-template-columns: 1fr max-content 2fr;

  > .sep-h {
    display: none;
  }

  @media (max-aspect-ratio: 1/1) {
    grid-template-columns: auto;
    grid-template-rows: 1fr max-content 2fr;

    > .sep-v {
      display: none;
    }

    > .sep-h {
      display: block;
    }
  }
}
</style>

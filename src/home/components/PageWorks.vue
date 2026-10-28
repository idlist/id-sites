<script setup lang="ts">
import { useMediaQuery } from '@vueuse/core'
import BubbleRect20 from './BubbleRect20.vue'
import BubbleSepH from './BubbleSepH.vue'
import BubbleSepV from './BubbleSepV.vue'

const isPortrait = useMediaQuery('(max-aspect-ratio: 3/4)')
</script>

<template>
  <section class="page-works">
    <div class="page-works-sticky">
      <BubbleRect20 class="fullheight">
        <div class="page-works-layout-portrait" v-if="isPortrait">
          <slot name="image"><div></div></slot>
          <BubbleSepH />
          <slot></slot>
        </div>

        <div class="page-works-layout-landscape" v-else>
          <slot name="image"><div></div></slot>
          <BubbleSepV />
          <slot></slot>
        </div>
      </BubbleRect20>
    </div>
  </section>
</template>

<style scoped lang="scss">
.page-works {
  height: 120vh;
  height: 120lvh;

  position: relative;
  display: flex;
  justify-content: center;
}

.page-works-sticky {
  position: sticky;

  --least-height: 400px;
  --least-top: calc((100vh - var(--least-height)) / 2);

  top: min(1rem, var(--least-top));
  top: min(calc((100vh - 100svh + 2rem) / 2), var(--least-top));
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

%page-works-layout {
  display: grid;
  width: 100%;
  height: 100%;
}

.page-works-layout-landscape {
  @extend %page-works-layout;
  grid-template-columns: 1fr max-content 2fr;
}

.page-works-layout-portrait {
  @extend %page-works-layout;
  grid-template-rows: 1fr max-content 2fr;
}
</style>

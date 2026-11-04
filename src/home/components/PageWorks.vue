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
        <div class="page-works-portrait" v-if="isPortrait">
          <div class="top">
            <slot name="top"></slot>
          </div>

          <BubbleSepH />

          <div class="bottom">
            <slot></slot>
          </div>
        </div>

        <div class="page-works-landscape" v-else>
          <div class="left">
            <slot name="left"></slot>
          </div>

          <BubbleSepV />

          <div class="right">
            <slot></slot>
          </div>
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

  --w-max: 1200px;
  --h-min: 400px;
  --h-max: 960px;

  --h: calc(100vh - 32px);
  --h: calc(100svh - 32px);
  --h-elastic: min(var(--h), var(--h-max));

  --top-elastic: calc((100vh - var(--h-elastic)) / 2);
  --top-min: calc((100vh - var(--h-min)) / 2);

  top: min(var(--top-elastic), var(--top-min));

  width: 100%;
  max-width: var(--w-max);

  height: var(--h);
  min-height: var(--h-min);
  max-height: var(--h-max);

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

.page-works-portrait {
  @extend %page-works-layout;
  grid-template-rows: 1fr max-content 2fr;
  row-gap: 1px;

  > .top {
    overflow: hidden;
    border-radius: 0 0 0.5rem 0.5rem;
  }

  > .bottom {
    overflow: hidden;
    border-radius: 0.5rem 0.5rem 0 0;
  }
}

.page-works-landscape {
  @extend %page-works-layout;
  grid-template-columns: 1fr max-content 2fr;
  column-gap: 1px;

  > .left {
    overflow: hidden;
    border-radius: 0 0.5rem 0.5rem 0;
  }

  > .right {
    overflow: hidden;
    border-radius: 0.5rem 0 0 0.5rem;
  }
}
</style>

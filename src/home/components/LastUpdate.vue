<script setup lang="ts">
import { lastUpdate, yearCopyright } from '@src/meta.g'
import { m } from 'virtual:i18n'
import { computed } from 'vue'
import BubbleRect16 from './BubbleRect16.vue'

const yearBegin = 2026
const yearRange = computed(() =>
  yearCopyright === yearBegin
    ? `${yearBegin}`
    : `${yearBegin} - ${yearCopyright}`
)
</script>

<template>
  <div class="last-update">
    <BubbleRect16>
      <div class="last-update-inner">
        <span>i'DLisT © {{ yearRange }}</span>

        <div class="sep">
          <svg width="2" height="1.25rem" class="sep-line">
            <line x1="1" y1="0" x2="1" y2="100%" />
          </svg>
        </div>

        <span>{{ m.lastUpdate() }}{{ lastUpdate }}</span>
      </div>
    </BubbleRect16>
  </div>
</template>

<style scoped lang="scss">
.last-update {
  position: absolute;
  bottom: 1rem;
  left: 1rem;
  right: 1rem;

  display: flex;
  justify-content: center;
}

.last-update-inner {
  display: flex;
  flex-direction: row;

  align-items: center;
  justify-content: center;
  padding: 0.25rem 0.5rem;

  text-align: center;
  font-size: 0.875rem;
  color: var(--color-sub-2);
  background-color: var(--color-main-deep);

  @media (max-width: 800px) {
    flex-direction: column;
  }

  > .sep {
    padding: 0 0.5rem;

    @media (max-width: 800px) {
      display: none;
    }
  }
}

.sep-line {
  overflow: visible;

  stroke: currentColor;
  stroke-linecap: round;
  stroke-width: 1.5px;
}
</style>

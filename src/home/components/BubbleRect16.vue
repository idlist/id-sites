<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    dark?: boolean
    noClip?: boolean
  }>(),
  {
    dark: false,
    noClip: false,
  },
)

const useNoClip = computed(() => props.noClip ? '-no-clip' : '')

// This value does not need responsiveness.
const useDark = props.dark ? '-dark' : ''
</script>

<template>
  <div class="bubble-rect-16" :class="useDark">
    <div class="inner">
      <div class="prevent-overflow" :class="useNoClip">
        <slot></slot>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.bubble-rect-16 {
  min-width: 32px;
  min-height: 32px;

  border-width: 2px;
  border-image-source: url("@assets/bubble-rect-16-light.svg");
  border-image-slice: 25%;
  border-image-width: 16px;
  border-image-outset: 1px;
  border-image-repeat: stretch;

  &.-dark {
    border-image-source: url("@assets/bubble-rect-16-dark.svg");
  }

  > .inner {
    width: 100%;
    height: 100%;
    padding: 4px;
  }

  > .inner > .prevent-overflow {
    width: 100%;
    height: 100%;
    border-radius: 12px;
    overflow: hidden;
  }

  > .inner > .prevent-overflow.-no-clip {
    overflow: visible;
  }
}
</style>

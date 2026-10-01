<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    dark?: boolean
  }>(),
  {
    dark: false,
  },
)

// This value does not need responsiveness.
const useDark = props.dark ? '-dark' : ''
</script>

<template>
  <div class="bubble-40">
    <svg class="frame" :class="useDark" viewBox="0 0 40 40">
      <!-- A 10 degree arc drawn from the top center. -->
      <path
        d="M 20 0 A 20 20 0 0 1 23.4730 0.3038"
        transform="rotate(55 20 20)"
        vector-effect="non-scaling-stroke"
      />
      <!-- A 320 degree arc drawn from the top center. -->
      <path
        d="M 20 0 A 20 20 0 1 1 7.1442 4.6791"
        transform="rotate(80 20 20)"
        vector-effect="non-scaling-stroke"
      />
    </svg>

    <div class="inner">
      <div class="prevent-overflow">
        <slot></slot>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.bubble-40 {
  position: relative;
  width: 40px;
  height: 40px;

  background-color: transparent;

  > .frame {
    position: absolute;
    width: 100%;
    height: 100%;
    overflow: visible;

    stroke: var(--color-sub);
    stroke-width: 2px;
    stroke-linecap: round;
    fill: none;

    pointer-events: none;
  }

  > .frame.-dark {
    stroke: var(--color-main);
  }

  > .inner {
    width: 100%;
    height: 100%;
    padding: 4px;
  }

  > .inner > .prevent-overflow {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    overflow: hidden;
  }
}
</style>

<script setup lang="ts">
defineProps<{
  color?: string
}>()
</script>

<template>
  <div class="works-badge">
    <svg class="frame" width="100%" height="24px">
      <path d="M 3.5147 3.5147 A 12 12 0 0 0 12 24" />
      <g class="bottomline">
        <line x1="12" y1="24" x2="16" y2="24" />
        <line x1="22" y1="24" x2="100%" y2="24" />
      </g>
    </svg>

    <div class="text">
      <slot></slot>
    </div>
  </div>
</template>

<style scoped lang="scss">
.works-badge {
  position: relative;
  color: v-bind("color ?? 'inherit'");

  > .text {
    padding: 0.125rem 0.25rem 0.125rem 0.375rem;
    font-family: var(--font-unique);
    font-size: 0.875rem;
  }

  > .frame {
    position: absolute;
    inset: 0;
    color: currentColor;

    stroke: currentColor;
    stroke-linecap: round;
    stroke-width: 2px;

    overflow: visible;
    fill: none;
  }

  > .frame > .bottomline {
    transform-origin: center;
    transform: scaleX(-1) translateX(-12px);
  }
}
</style>

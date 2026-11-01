<script setup lang="ts">
import IconBulb from '@assets/icons/bulb.svg?component'
</script>

<template>
  <div class="works-bulb">
    <div class="bulb"><IconBulb /></div>
    <svg class="bulb-ray">
      <line class="ray ray-1" x1="12" y1="32" x2="0" y2="32" />
      <line class="ray ray-2" x1="12" y1="32" x2="0" y2="32" />
      <line class="ray ray-3" x1="12" y1="32" x2="0" y2="32" />
      <line class="ray ray-4" x1="12" y1="32" x2="0" y2="32" />
      <line class="ray ray-5" x1="12" y1="32" x2="0" y2="32" />
    </svg>
  </div>
</template>

<style scoped lang="scss">
.works-bulb {
  width: 64px;
  height: 64px;

  position: relative;

  > .bulb {
    width: 40px;
    height: 40px;

    position: absolute;
    bottom: 6px;
    left: 50%;
    transform: translateX(-50%);
  }

  > .bulb > svg {
    stroke-width: 1px;
  }
}

.bulb-ray {
  position: absolute;
  width: 100%;
  height: 100%;

  stroke: currentColor;
  stroke-width: 2.5px;
  stroke-linecap: round;

  > .ray {
    transform-box: view-box;
    transform-origin: 32px 32px;
    animation: shine 2s ease-out infinite;
  }

  > .ray-1 {
    transform: rotate(0deg);
    animation-delay: 0s;
  }

  > .ray-2 {
    transform: rotate(45deg);
    animation-delay: 0.2s;
  }

  > .ray-3 {
    transform: rotate(90deg);
    animation-delay: 0.4s;
  }

  > .ray-4 {
    transform: rotate(135deg);
    animation-delay: 0.6s;
  }

  > .ray-5 {
    transform: rotate(180deg);
    animation-delay: 0.8s;
  }
}

@keyframes shine {
  0% {
    stroke-dasharray: 0, 16;
    stroke-dashoffset: 0;
  }
  25% {
    stroke-dasharray: 12, 16;
    stroke-dashoffset: 0;
  }
  50%, 100% {
    stroke-dasharray: 0, 16;
    stroke-dashoffset: -12;
  }
}
</style>

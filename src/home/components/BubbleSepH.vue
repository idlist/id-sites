<template>
  <div class="bubble-sep-h">
    <svg width="100%" height="2" class="line">
      <line x1="0" y1="1" x2="18" y2="1" />
      <line x1="24" y1="1" x2="28" y2="1" />
      <line x1="34" y1="1" x2="100%" y2="1" />
    </svg>
  </div>
</template>

<style scoped lang="scss">
.bubble-sep-h {
  width: 100%;
  padding: 2px;

  > .line {
    overflow: visible;

    stroke: currentColor;
    stroke-linecap: round;
    stroke-width: 2px;
    transform: scaleX(-1);
  }
}
</style>

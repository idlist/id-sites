<template>
  <div class="bubble-sep-v">
    <svg width="2" height="100%" class="line">
      <line x1="1" y1="0" x2="1" y2="18" />
      <line x1="1" y1="24" x2="1" y2="28" />
      <line x1="1" y1="34" x2="1" y2="100%" />
    </svg>
  </div>
</template>

<style scoped lang="scss">
.bubble-sep-v {
  height: 100%;
  padding: 2px;

  > .line {
    overflow: visible;

    stroke: currentColor;
    stroke-linecap: round;
    stroke-width: 2px;
  }
}
</style>

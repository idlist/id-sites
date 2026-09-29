<template>
  <div class="bubble-rect-20">
    <div class="inner">
      <div class="prevent-overflow">
        <slot></slot>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.bubble-rect-20 {
  min-width: 40px;
  min-height: 40px;

  border-width: 2px;
  border-image-source: url("@assets/bubble-rect-20.svg");
  border-image-slice: 31.25%;
  border-image-width: 20px;
  border-image-outset: 1px;
  border-image-repeat: stretch;

  > .inner {
    width: 100%;
    height: 100%;
    padding: 4px;
  }

  > .inner > .prevent-overflow {
    width: 100%;
    height: 100%;
    border-radius: 16px;
    overflow: hidden;
  }
}
</style>

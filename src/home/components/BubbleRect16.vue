<script setup lang="ts">
withDefaults(
  defineProps<{
    noClip?: boolean
  }>(),
  {
    noClip: false,
  },
)
</script>

<template>
  <div class="bubble-rect-16">
    <div class="inner">
      <div class="prevent-overflow">
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

  > .inner {
    width: 100%;
    height: 100%;
    padding: 4px;
  }

  > .inner > .prevent-overflow {
    width: 100%;
    height: 100%;
    border-radius: 12px;
    overflow: v-bind("noClip ? 'visible' : 'hidden'");
  }
}
</style>

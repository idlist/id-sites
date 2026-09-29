<template>
  <div class="dot-background" aria-hidden></div>
</template>

<style scoped lang="scss">
.dot-background {
  position: fixed;
  inset: 0;

  background-image: radial-gradient(
    circle,
    var(--color-main-dots) 1px,
    color-mix(in srgb, var(--color-main-dots) 0%, transparent) 3px
  );
  background-size: 32px 32px;

  pointer-events: none;
  z-index: -32;
}
</style>

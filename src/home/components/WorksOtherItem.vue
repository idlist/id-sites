<script setup lang="ts">
import BubbleRect16 from './BubbleRect16.vue'
</script>

<template>
  <div class="works-other-item">
    <BubbleRect16>
      <div class="item-name">
        <slot name="name"></slot>
      </div>
    </BubbleRect16>

    <div class="id-typeface -nomargin item-desc">
      <slot></slot>
    </div>

    <div class="item-links">
      <slot name="links"></slot>
    </div>
  </div>
</template>

<style scoped lang="scss">
.works-other-item {
  display: grid;
  grid-template-columns: auto;
  justify-items: center;
  row-gap: 0.5rem;
}

.item-name {
  padding: 0 0.5rem;
  color: var(--color-main);
  background-color: var(--color-sub);

  font-family: var(--font-unique);
}

.item-desc {
  text-align: center;
  background-color: var(--color-main);
  padding: 0.25rem 0.5rem;
  border-radius: 0.5rem;
}

.item-links {
  display: flex;
  align-items: center;
  justify-content: center;

  flex-wrap: wrap;
  column-gap: 0.5rem;
  font-size: 0.875rem;
}
</style>

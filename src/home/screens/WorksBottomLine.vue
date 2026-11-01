<script setup lang="ts">
import IconStar from '@assets/icons/star-four-points.svg?component'
import { range } from 'remeda'

const nOfStars = 5
</script>

<template>
  <section class="works-bottom-line">
    <div class="star" v-for="i of range(0, nOfStars)" :key="i">
      <IconStar />
    </div>
  </section>
</template>

<style scoped lang="scss">
.works-bottom-line {
  padding: 2rem 0;

  display: flex;
  align-items: center;
  justify-content: center;
  column-gap: 1.25rem;

  > .star {
    width: 1.5rem;
    height: 1.5rem;
  }
}
</style>

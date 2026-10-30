<script setup lang="ts">
import LastUpdate from '@home/components/LastUpdate.vue'
import FooterSpheres from '@home/motions/FooterSpheres.vue'
import { useElementSize } from '@vueuse/core'
import { computed, type StyleValue, useTemplateRef } from 'vue'
import { FooterBleed, getCenterRadius } from '../designs/footer'

const $footer = useTemplateRef('$footer')
const footerSize = useElementSize($footer)

const contentStyle = computed<StyleValue>(() => {
  const w = footerSize.width.value
  const h = footerSize.height.value

  const centerRadius = getCenterRadius(w, h)
  const centerDiameter = centerRadius * 2

  return {
    width: `${centerDiameter}px`,
    height: `${centerDiameter}px`,
  }
})

// Does not need reactivity as FooterBleed is a constant.
const pxFooterBleed = `${FooterBleed}px`
</script>

<template>
  <section class="footer-screen" ref="$footer">
    <div class="id-typeface content" :style="contentStyle">
      <div>
        <p>
          This site is designed and developed by <b>i'DLisT</b> from <b>Spherical Vaccum.</b>
        </p>
        <p>
          <b>Spherical Vacuum</b> is a small studio aiming for personalized interactive experiences.
        </p>
      </div>
    </div>

    <LastUpdate />
    <FooterSpheres />
  </section>
</template>

<style scoped lang="scss">
.footer-screen {
  position: relative;
  width: 100%;
  height: calc(100vh + v-bind("pxFooterBleed"));
  height: calc(100lvh + v-bind("pxFooterBleed"));
  min-height: 400px;
  padding-top: v-bind("pxFooterBleed");

  display: flex;
  align-items: center;
  justify-content: center;

  > .content {
    padding: 0 4rem 0 2rem;

    display: flex;
    align-items: center;
    justify-content: center;
  }

  > .content > p {
    margin: 0;
  }
}
</style>

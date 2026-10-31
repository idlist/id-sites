<script setup lang="ts">
import IconSphericalVacuum from '@assets/spherical-vacuum.png?url'
import LastUpdate from '@home/components/LastUpdate.vue'
import { CenterMinRadius, FooterBleed, getCenterRadius } from '@home/designs/footer'
import FooterSpheres from '@home/motions/FooterSpheres.vue'
import { useI18nComponent } from '@src/home/locales/i18n'
import { useElementBounding, useIntersectionObserver } from '@vueuse/core'
import { computed, ref, type StyleValue, useTemplateRef } from 'vue'

const activate = ref(false)
const ActivationRatio = 0.8

const $footer = useTemplateRef('$footer')
const bounding = useElementBounding($footer)

const { stop } = useIntersectionObserver($footer, ([entry]) => {
  if ((entry?.intersectionRatio ?? 0) >= ActivationRatio) {
    activate.value = true
    stop()
  }
})

const contentStyle = computed<StyleValue>(() => {
  const w = bounding.width.value
  const h = bounding.height.value

  const centerRadius = getCenterRadius(w, h)
  const centerDiameter = centerRadius * 2

  return {
    width: `${centerDiameter}px`,
    height: `${centerDiameter}px`,
  }
})

const FooterPromo = useI18nComponent('FooterPromo')

// Does not need reactivity as values involved are constants.
const pxFooterBleed = `${FooterBleed}px`
const pxMinHeight = `${FooterBleed + 2 * CenterMinRadius}px`
</script>

<template>
  <section class="footer-screen" ref="$footer">
    <div class="content" :style="contentStyle">
      <div class="footer-layout">
        <div class="icon">
          <img :src="IconSphericalVacuum" alt="Spherical Vacuum icon">
        </div>

        <div class="id-typeface text">
          <FooterPromo />
        </div>
      </div>
    </div>

    <LastUpdate />
    <FooterSpheres
      :width="bounding.width.value"
      :height="bounding.height.value"
      :activate="activate"
    />
  </section>
</template>

<style scoped lang="scss">
.footer-screen {
  width: 100%;
  height: calc(100vh + v-bind("pxFooterBleed"));
  height: calc(100lvh + v-bind("pxFooterBleed"));
  min-height: v-bind("pxMinHeight");
  padding-top: v-bind("pxFooterBleed");

  position: relative;
  overflow: hidden;

  display: flex;
  align-items: center;
  justify-content: center;

  > .content {
    display: flex;
    align-items: center;
    justify-content: center;
  }
}

.footer-layout {
  width: 70.7%;

  > .icon {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  > .icon > img {
    width: 60%;
    max-width: 16rem;
  }

  > .text {
    text-align: center;
  }
}
</style>

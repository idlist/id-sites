<script setup lang="ts">
import IconSphericalVacuum from '@assets/spherical-vacuum.svg?url'
import LastUpdate from '@home/components/LastUpdate.vue'
import { FooterBleed, getCenterRadius } from '@home/designs/footer'
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

// Does not need reactivity as FooterBleed is a constant.
const pxFooterBleed = `${FooterBleed}px`
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
    <FooterSpheres :activate="activate" />
  </section>
</template>

<style scoped lang="scss">
.footer-screen {
  position: relative;
  width: 100%;
  height: calc(100vh + v-bind("pxFooterBleed"));
  height: calc(100lvh + v-bind("pxFooterBleed"));
  min-height: calc(400px + v-bind("pxFooterBleed"));
  padding-top: v-bind("pxFooterBleed");

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

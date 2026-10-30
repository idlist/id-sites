<script setup lang="ts">
import LastUpdate from '@home/components/LastUpdate.vue'
import FooterSpheres from '@home/motions/FooterSpheres.vue'
</script>

<template>
  <section class="footer-screen">
    <div class="id-typeface content">
      <p>
        This site is designed and developed by <b>i'DLisT</b> from <b>Spherical Vaccum.</b>
      </p>
      <p>
        <b>Spherical Vacuum</b> is a small studio aiming for personalized interactive experiences.
      </p>
    </div>

    <LastUpdate />
    <FooterSpheres />
  </section>
</template>

<style scoped lang="scss">
.footer-screen {
  --footer-bleed: 80px;

  position: relative;
  width: 100%;
  height: calc(100vh + var(--footer-bleed));
  height: calc(100lvh + var(--footer-bleed));
  min-height: 400px;

  display: flex;
  align-items: center;
  justify-content: center;

  > .content {
    max-width: 1200px;
    padding: var(--footer-bleed) 4rem 0 2rem;
  }

  > .content > p {
    margin: 0;
  }
}
</style>

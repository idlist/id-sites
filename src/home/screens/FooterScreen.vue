<script setup lang="ts">
import LastUpdate from '@home/components/LastUpdate.vue'
import PageFull from '@home/components/PageFull.vue'
import FooterSpheres from '@home/motions/FooterSpheres.vue'
</script>

<template>
  <PageFull expand class="footer-screen">
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
  </PageFull>
</template>

<style scoped lang="scss">
.footer-screen {
  display: flex;
  align-items: center;
  justify-content: center;

  position: relative;

  > .content {
    max-width: 1200px;
    padding: 0 4rem 0 2rem;
  }

  > .content > p {
    margin: 0;
  }
}
</style>

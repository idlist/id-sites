<script setup lang="ts">
import PageFull from '@home/components/PageFull.vue'
</script>

<template>
  <PageFull expand class="footer-screen">
    <div class="id-typeface content">
      <p>This personal site is designed and developed by i'DLisT from Spherical Vaccum.</p>
      <p>Spherical Vacuum is a small studio</p>
    </div>
  </PageFull>
</template>

<style scoped lang="scss">
.footer-screen {
  display: flex;
  align-items: center;
  justify-content: center;

  > .content {
    max-width: 1200px;
  }

  > .content > p {
    margin: 0;
  }
}
</style>

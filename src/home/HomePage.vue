<script setup lang="ts">
import { m } from 'virtual:i18n'
import BackgroundDots from './components/BackgroundDots.vue'
import NavOverlay from './components/NavOverlay.vue'
</script>

<template>
  <BackgroundDots />
  <div>{{ m.hello({ name: 'idlist' }) }}</div>
  <NavOverlay />
</template>

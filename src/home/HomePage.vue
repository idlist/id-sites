<script setup lang="ts">
import { m } from 'virtual:i18n'
import NavOverlay from './components/NavOverlay.vue'
</script>

<template>
  <div>{{ m.hello({ name: 'idlist' }) }}</div>
  <NavOverlay />
</template>

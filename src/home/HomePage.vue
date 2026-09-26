<script setup lang="ts">
import { locale, m } from 'virtual:i18n'

const toggle = () => {
  locale.value = locale.value === 'en' ? 'zh-Hans' : 'en'
}
</script>

<template>
  <div>{{ m.hello({ name: 'you' }) }}</div>
  <button @click="toggle">switch</button>
</template>

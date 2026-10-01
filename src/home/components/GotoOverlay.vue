<script setup lang="ts">
import { detectLocale } from '@client/detect-locale.ts'
import { useLocalStorage } from '@vueuse/core'
import { locale, type SupportedLocales } from 'virtual:i18n'
import { onBeforeMount } from 'vue'
import GotoOverlayCore from './GotoOverlayCore.vue'

const localeStorage = useLocalStorage<SupportedLocales>('locale', tryGetInitialLocale())

function goto() {
  switch (locale.value) {
    case 'zh-Hans':
      window.location.href = '/notes/zh'
      break
    default:
      window.location.href = '/notes/en'
  }
}

function updateLocale(newLocale: SupportedLocales) {
  locale.value = newLocale
  localeStorage.value = newLocale
}

function tryGetInitialLocale() {
  let localeDetected = detectLocale()

  // Because this site only supports en & zh-Hans, the logic becomes:
  // language tag starts with zh => zh-Hans
  // other situations => en
  // This is a hard-coded solution.
  if (localeDetected.startsWith('zh')) return 'zh-Hans'
  return 'en'
}

onBeforeMount(() => {
  locale.value = localeStorage.value
})
</script>

<template>
  <GotoOverlayCore @goto="goto" @update-locale="updateLocale" />
</template>

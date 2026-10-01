<script setup lang="ts">
import { detectLocale } from '@client/detect-locale.ts'
import { useLocalStorage } from '@vueuse/core'
import { locale, type SupportedLocales, supportedLocales } from 'virtual:i18n'
import { onBeforeMount } from 'vue'
import GotoOverlayCore from './GotoOverlayCore.vue'

const localeStorage = useLocalStorage<SupportedLocales>('locale', tryDetectLocale())

function goto() {
  switch (locale.value) {
    case 'zh':
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

function tryDetectLocale() {
  let localeDetected = detectLocale(locale.value)

  // Because this site only supports en & zh, the logic becomes:
  // language tag starts with zh => zh
  // other situations => en
  // This is a hard-coded solution.
  if (localeDetected.startsWith('zh')) return 'zh'
  return 'en'
}

onBeforeMount(() => {
  if (!supportedLocales.has(localeStorage.value)) {
    localeStorage.value = tryDetectLocale()
  }

  locale.value = localeStorage.value
})
</script>

<template>
  <GotoOverlayCore @goto="goto" @update-locale="updateLocale" />
</template>

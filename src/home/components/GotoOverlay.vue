<script setup lang="ts">
import { guessLocale } from '@src/client/guess-locale.ts'
import { useLocalStorage } from '@vueuse/core'
import { locale, type SupportedLocales, supportedLocales } from 'virtual:i18n'
import { onBeforeMount } from 'vue'
import GotoOverlayCore from './GotoOverlayCore.vue'

const localeStorage = useLocalStorage<SupportedLocales>('locale', tryGuessLocale())

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

function tryGuessLocale() {
  let localeGuessed = guessLocale(locale.value)

  // Because this site only supports en & zh, the logic becomes:
  // language tag starts with zh => zh
  // other situations => en
  // This is a hard-coded solution.
  if (localeGuessed.startsWith('zh')) return 'zh'
  return 'en'
}

onBeforeMount(() => {
  if (!supportedLocales.has(localeStorage.value)) {
    localeStorage.value = tryGuessLocale()
  }

  locale.value = localeStorage.value
})
</script>

<template>
  <GotoOverlayCore @goto="goto" @update-locale="updateLocale" />
</template>

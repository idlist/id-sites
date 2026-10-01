<script setup lang="ts">
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

function tryGetLocaleFromBrowserArray(): string | null {
  const languages = navigator.languages
  if (!languages) return null
  if (!languages.length) return null
  return languages[0]
}

function tryGetLocaleFromBrowser(): string | null {
  const language = navigator.language
  if (!language) return null
  return language
}

function tryGetInitialLocale() {
  // Because this site only supports en & zh-Hans, the logic becomes:
  // language tag starts with zh => zh-Hans
  // other situations => en
  // This is a hard-coded solution.

  let initial = tryGetLocaleFromBrowserArray()
  if (!initial) initial = tryGetLocaleFromBrowser()
  if (!initial) initial = locale.value // Default locale

  if (initial.startsWith('zh')) return 'zh-Hans'
  return 'en'
}

onBeforeMount(() => {
  locale.value = localeStorage.value
})
</script>

<template>
  <GotoOverlayCore @goto="goto" @update-locale="updateLocale" />
</template>

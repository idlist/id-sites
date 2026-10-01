<script setup lang="ts">
import GotoOverlayCore from '@home/components/GotoOverlayCore.vue'
import { useLocalStorage } from '@vueuse/core'
import { locale, type SupportedLocales } from 'virtual:i18n'
import { onBeforeMount } from 'vue'

const props = withDefaults(
  defineProps<{
    locale: SupportedLocales
    localePageMap?: Partial<Record<SupportedLocales, string>>
  }>(),
  {
    localePageMap: () => ({}),
  },
)

const localeStorage = useLocalStorage<SupportedLocales>('locale', props.locale)

function goto() {
  window.location.href = `/`
}

function updateLocale(newLocale: SupportedLocales) {
  if (!props.localePageMap) return
  if (newLocale === localeStorage.value) return

  const destination = props.localePageMap[newLocale]
  if (!destination) return

  localeStorage.value = newLocale
  window.location.href = destination
}

onBeforeMount(() => {
  locale.value = localeStorage.value
})
</script>

<template>
  <GotoOverlayCore where="notes" @goto="goto" @update-locale="updateLocale" />
</template>

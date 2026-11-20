<script setup lang="ts">
import GotoOverlayCore from '@home/components/GotoOverlayCore.vue'
import { useLocalStorage } from '@vueuse/core'
import { locale as currentLocale, type SupportedLocale } from 'virtual:i18n'
import { onBeforeMount } from 'vue'

const props = withDefaults(
  defineProps<{
    locale: SupportedLocale
    localePageMap?: Partial<Record<SupportedLocale, string>>
  }>(),
  {
    localePageMap: () => ({}),
  },
)

const localeStorage = useLocalStorage<SupportedLocale>('locale', props.locale)

function goto() {
  window.location.href = `/`
}

function updateLocale(newLocale: SupportedLocale) {
  if (!props.localePageMap) return
  if (newLocale === localeStorage.value) return

  const destination = props.localePageMap[newLocale]
  if (!destination) return

  localeStorage.value = newLocale
  window.location.href = destination
}

onBeforeMount(() => {
  currentLocale.value = localeStorage.value
})
</script>

<template>
  <GotoOverlayCore where="notes" @goto="goto" @update-locale="updateLocale" />
</template>

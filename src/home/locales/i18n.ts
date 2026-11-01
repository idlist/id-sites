import { locale } from 'virtual:i18n'
import { type Component, computed } from 'vue'

const baseDir = '/src/home/locales'
const component = import.meta.glob('/src/home/locales/**/*.vue', {
  import: 'default',
  eager: true,
})

export function useI18nComponent(name: string) {
  return computed(() => {
    const lang = locale.value
    const path = `${baseDir}/${lang}/${name}.${lang}.vue`
    return component[path] as Component
  })
}

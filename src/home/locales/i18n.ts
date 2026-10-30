import { locale } from 'virtual:i18n'
import { computed } from 'vue'

const baseDir = '/src/home/locales'
const components = import.meta.glob('/src/home/locales/**/*.vue', {
  import: 'default',
  eager: true,
})

export function useI18nComponent(name: string) {
  return computed(() => {
    const lang = locale.value
    return components[`${baseDir}/${lang}/${name}.${lang}.vue`]
  })
}

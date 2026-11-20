import { locale } from 'virtual:i18n'
import { type Component, computed } from 'vue'

const baseDir = '/src/home/locales'

const components = import.meta.glob([
  '/src/home/locales/**/*.vue',
  '/src/home/locales/**/*.vmd',
], {
  import: 'default',
  eager: true,
})

type I18nComponentExtension = 'vue' | 'vmd'

export function useI18nComponent(name: string, ext: I18nComponentExtension = 'vue') {
  return computed(() => {
    const lang = locale.value
    const path = `${baseDir}/${lang}/${name}.${lang}.${ext}`
    return components[path] as Component
  })
}

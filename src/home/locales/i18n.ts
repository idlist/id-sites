import { locale } from 'virtual:i18n'
import { type Component, computed } from 'vue'

const baseDir = '/src/home/locales'
const vueComponent = import.meta.glob('/src/home/locales/**/*.vue', {
  import: 'default',
  eager: true,
})
const vmdComponent = import.meta.glob('/src/home/locales/**/*.vmd', {
  import: 'default',
  eager: true,
})

type I18nComponentExtension = 'vue' | 'vmd'

export function useI18nComponent(name: string, ext: I18nComponentExtension = 'vue') {
  return computed(() => {
    const lang = locale.value
    const path = `${baseDir}/${lang}/${name}.${lang}.${ext}`

    switch (ext) {
      case 'vue':
        return vueComponent[path] as Component
      case 'vmd':
        return vmdComponent[path] as Component
    }
  })
}

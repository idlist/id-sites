import type { AstroInstance, MDXInstance } from 'astro'
import type { SupportedLocales } from 'virtual:i18n'

const baseDir = '/src/layouts/locales'
const components = import.meta.glob('/src/layouts/locales/**/*', {
  eager: true,
})

export function useI18nAstroComponent(lang: SupportedLocales, name: string) {
  const path = `${baseDir}/${lang}/${name}.${lang}.astro`
  const instance = components[path] as AstroInstance
  return instance.default
}

export function useI18nMdxComponent(lang: SupportedLocales, name: string) {
  const path = `${baseDir}/${lang}/${name}.${lang}.mdx`
  const instance = components[path] as MDXInstance<any>
  return instance.default
}

import type { AstroInstance, MDXInstance } from 'astro'
import type { SupportedLocale } from 'virtual:i18n/notes'

const baseDir = '/src/layouts/locales'
const components = import.meta.glob([
  '/src/layouts/locales/**/*.astro',
  '/src/layouts/locales/**/*.mdx',
], {
  eager: true,
})

type I18nComponentExtension = 'astro' | 'mdx'

export function useI18nComponent(
  lang: SupportedLocale,
  name: string,
  extension: I18nComponentExtension = 'astro',
) {
  const path = `${baseDir}/${lang}/${name}.${lang}.${extension}`
  switch (extension) {
    case 'astro':
      return (components[path] as AstroInstance).default
    case 'mdx':
      return (components[path] as MDXInstance<any>).default
  }
}

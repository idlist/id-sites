import type { AstroInstance, MDXInstance } from 'astro'
import type { SupportedLocales } from 'virtual:i18n'

const baseDir = '/src/layouts/locales'
const component = import.meta.glob('/src/layouts/locales/**/*', {
  eager: true,
})

type I18nComponentExtension = 'astro' | 'mdx'

export function useI18nComponent(
  lang: SupportedLocales,
  name: string,
  extension: I18nComponentExtension = 'astro',
) {
  const path = `${baseDir}/${lang}/${name}.${lang}.${extension}`
  switch (extension) {
    case 'astro':
      return (component[path] as AstroInstance).default
    case 'mdx':
      return (component[path] as MDXInstance<any>).default
  }
}

import { type MessageCollection, setupMessages } from '@virtual-i18n/static'
import { defineMiddleware } from 'astro:middleware'
import { allLocales, type SupportedLocales } from 'virtual:i18n'

const localeFiles: string[] = [
  'notes',
]

export const onRequest = defineMiddleware((_, next) => {
  setupMessages(() => {
    const localeModules = import.meta.glob('/src/locales/*.json', {
      eager: true,
      import: 'default',
    }) as Record<string, Record<string, string>>

    const collection: MessageCollection = {}

    for (const localeFile of localeFiles) {
      for (const suffix of allLocales) {
        const json = localeModules[`/src/locales/${localeFile}.${suffix}.json`]
        if (!json) continue

        if (!(suffix in collection)) collection[suffix] = {}

        Object.assign(collection[suffix as SupportedLocales]!, json)
      }
    }

    return collection
  })

  return next()
})

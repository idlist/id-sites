import { tokenize } from '@virtual-i18n/tokenizer'
import type { SupportedLocales } from 'virtual:i18n'
import { numSlot, oneOtherSlot, type SimpleI18nSlot, strSlot } from './slots'

const localeFiles: string[] = [
  'notes',
]

const messageCollection: Record<SupportedLocales, Record<string, string>> = {
  en: {},
  zh: {},
}

const localeModules = import.meta.glob('/src/locales/*.json', {
  eager: true,
  import: 'default',
}) as Record<string, Record<string, string>>

for (const localeFile of localeFiles) {
  for (const suffix of Object.keys(messageCollection)) {
    const json = localeModules[`/src/locales/${localeFile}.${suffix}.json`]
    if (!json) continue

    Object.assign(messageCollection[suffix as SupportedLocales], json)
  }
}

const slotHandlers: Record<string, SimpleI18nSlot> = {}
slotHandlers[strSlot.id] = strSlot
slotHandlers[numSlot.id] = numSlot
slotHandlers[oneOtherSlot.id] = oneOtherSlot

export function useI18n(locale: SupportedLocales) {
  const messages = messageCollection[locale]

  const m = (key: string, values?: Record<string, unknown>): string => {
    const message = messages[key]
    if (message === undefined) return key

    let translated = ''

    for (const token of tokenize(message)) {
      if (token.type === 'text') {
        translated += token.text
      }

      if (token.type === 'slot') {
        if (!values) {
          translated += key
          continue
        }

        const handler = slotHandlers[token.slotType] ?? strSlot
        const value = values[token.slotName]
        if (!value) {
          translated += key
          continue
        }

        let segment = handler.translate({
          key,
          value,
          branches: token.branches,
        })

        // # refers to the value itself.
        segment = segment.replace(/#/g, `${value}`)
        translated += segment
      }
    }

    return translated
  }

  return { m }
}

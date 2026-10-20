import type { SupportedLocales } from 'virtual:i18n'
import { numSlot, oneOtherSlot, type StaticI18nSlot, strSlot } from './slots.static'
import { tokenize } from './tokenizer'

export type MessageCollection = Partial<Record<SupportedLocales, Record<string, string>>>

const messageCollection: MessageCollection = {}

export function setupMessages(setup: () => MessageCollection) {
  Object.assign(messageCollection, setup())
}

const slotHandlers: Record<string, StaticI18nSlot> = {}
slotHandlers[strSlot.id] = strSlot
slotHandlers[numSlot.id] = numSlot
slotHandlers[oneOtherSlot.id] = oneOtherSlot

export function addSlotHandler(handler: StaticI18nSlot) {
  slotHandlers[handler.id] = handler
}

export function useI18n(locale: SupportedLocales) {
  const m = (key: string, values?: Record<string, unknown>): string => {
    const message = messageCollection[locale]?.[key]
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

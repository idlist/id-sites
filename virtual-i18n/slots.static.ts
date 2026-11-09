interface TranslateOptions<V, T extends readonly string[]> {
  key: string
  value: V
  branches: Partial<Record<T[number], string>>
}

export interface StaticI18nSlot<V = any, T extends readonly string[] = string[]> {
  id: string
  branches?: T
  translate: (options: TranslateOptions<V, T>) => string
}

export function defineSlot<V = any, const T extends string[] = string[]>(
  slot: StaticI18nSlot<V, T>,
): StaticI18nSlot {
  return slot
}

export const strSlot = defineSlot<string>({
  id: 'str',
  translate: ({ value }) => value,
})

export const numSlot = defineSlot<number>({
  id: 'num',
  translate: ({ value }) => `${value}`,
})

export const oneOtherSlot = defineSlot<number>({
  id: 'one-other',
  branches: ['one', 'other'],
  translate: ({ key, value, branches }) => {
    const oneText = branches.one ?? key
    const otherText = branches.other ?? key
    return value === 1 ? oneText : otherText
  },
})

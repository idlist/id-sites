interface SlotTypeOptions<T extends readonly string[]> {
  branches: Partial<Record<T[number], string>>
}

interface SlotCodeOptions<T extends readonly string[]> {
  key: string
  name: string
  branches: Partial<Record<T[number], string>>
}

export interface CustomI18nSlot<T extends readonly string[] = string[]> {
  id: string
  branches?: T
  generateType: (options: SlotTypeOptions<T>) => string
  generateCode: (options: SlotCodeOptions<T>) => string
}

export function defineSlot<const T extends string[]>(
  slot: CustomI18nSlot<T>,
): CustomI18nSlot {
  return slot
}

export const strSlot = defineSlot({
  id: 'str',
  generateType: () => 'string',
  generateCode: ({ name }) => /* ts */ `\${params.${name}}`,
})

export const numSlot = defineSlot({
  id: 'num',
  generateType: () => 'number',
  generateCode: ({ name }) => /* ts */ `\${params.${name}}`,
})

export const oneOtherSlot = defineSlot({
  id: 'one-other',
  branches: ['one', 'other'],
  generateType: () => 'number',
  generateCode: ({ key, name, branches }) => {
    const oneText = branches.one ?? key
    const otherText = branches.other ?? key
    return /* ts */ `\${params.${name} === 1 ? \`${oneText}\` : \`${otherText}\`}`
  },
})

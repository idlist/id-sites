// biome-ignore-all lint/suspicious/noTemplateCurlyInString: The assertions target code templates.
import { describe, expect, it } from 'vitest'
import { defineSlot, numSlot, oneOtherSlot, strSlot } from './slots'

describe('defineSlot', () => {
  it('returns the slot as is', () => {
    const slot = defineSlot({
      id: 'custom',
      generateType: () => 'string',
      generateCode: () => 'code',
    })

    expect(slot.id).toBe('custom')
    expect(slot.generateType({ branches: {} })).toBe('string')
    expect(slot.generateCode({ key: 'key', name: 'name', branches: {} }))
      .toBe('code')
  })

  it('keeps the optional branches as is', () => {
    const slot = defineSlot({
      id: 'custom',
      branches: ['one', 'other'],
      generateType: () => 'number',
      generateCode: () => 'code',
    })

    expect(slot.branches).toEqual(['one', 'other'])
  })
})

describe('strSlot', () => {
  it('has the id "str"', () => {
    expect(strSlot.id).toBe('str')
  })

  it('requires no branch', () => {
    expect(strSlot.branches).toBeUndefined()
  })

  it('generates the type "string"', () => {
    expect(strSlot.generateType({ branches: {} })).toBe('string')
  })

  it('generates code that inserts the slot value', () => {
    expect(strSlot.generateCode({ key: 'key', name: 'name', branches: {} }))
      .toBe('${params.name}')
  })
})

describe('numSlot', () => {
  it('has the id "num"', () => {
    expect(numSlot.id).toBe('num')
  })

  it('requires no branch', () => {
    expect(numSlot.branches).toBeUndefined()
  })

  it('generates the type "number"', () => {
    expect(numSlot.generateType({ branches: {} })).toBe('number')
  })

  it('generates code that inserts the slot value', () => {
    expect(numSlot.generateCode({ key: 'key', name: 'name', branches: {} }))
      .toBe('${params.name}')
  })
})

describe('oneOtherSlot', () => {
  it('has the id "one-other"', () => {
    expect(oneOtherSlot.id).toBe('one-other')
  })

  it('requires the branches "one" and "other"', () => {
    expect(oneOtherSlot.branches).toEqual(['one', 'other'])
  })

  it('generates the type "number"', () => {
    expect(oneOtherSlot.generateType({ branches: {} })).toBe('number')
  })

  it('generates code that branches by the slot value', () => {
    expect(oneOtherSlot.generateCode({
      key: 'key',
      name: 'name',
      branches: { one: 'ONE', other: 'OTHER' },
    })).toBe('${params.name === 1 ? `ONE` : `OTHER`}')
  })

  it('falls back to the key when the branch "one" is missing', () => {
    expect(oneOtherSlot.generateCode({
      key: 'key',
      name: 'name',
      branches: { other: 'OTHER' },
    })).toBe('${params.name === 1 ? `key` : `OTHER`}')
  })

  it('falls back to the key when the branch "other" is missing', () => {
    expect(oneOtherSlot.generateCode({
      key: 'key',
      name: 'name',
      branches: { one: 'ONE' },
    })).toBe('${params.name === 1 ? `ONE` : `key`}')
  })

  it('falls back to the key when both branches are missing', () => {
    expect(oneOtherSlot.generateCode({
      key: 'key',
      name: 'name',
      branches: {},
    })).toBe('${params.name === 1 ? `key` : `key`}')
  })
})

import { describe, expect, it } from 'vitest'
import { type SlotToken, type TextToken, tokenize } from './tokenizer'

function text(content: string): TextToken {
  return { type: 'text', text: content }
}

function slot(
  slotName: string,
  slotType = 'str',
  branches: Record<string, string> = {},
): SlotToken {
  return { type: 'slot', slotName, slotType, branches }
}

describe('tokenize', () => {
  it('returns no tokens for an empty string', () => {
    expect(tokenize('')).toEqual([])
  })

  it('returns a single text token when there is no slot', () => {
    expect(tokenize('text')).toEqual([text('text')])
  })

  it('splits a text and a slot', () => {
    expect(tokenize('text {a}')).toEqual([text('text '), slot('a')])
  })

  it('splits a slot and a text', () => {
    expect(tokenize('{a} text')).toEqual([slot('a'), text(' text')])
  })

  it('splits a slot surrounded by text', () => {
    expect(tokenize('lorem {a} ipsum')).toEqual([
      text('lorem '),
      slot('a'),
      text(' ipsum'),
    ])
  })

  it('splits consecutive slots without text between them', () => {
    expect(tokenize('{a}{b}')).toEqual([slot('a'), slot('b')])
  })

  it('splits multiple slots separated by text', () => {
    expect(tokenize('{a} text {b}')).toEqual([
      slot('a'),
      text(' text '),
      slot('b'),
    ])
  })

  it('defaults the slot type to "str" when it is omitted', () => {
    expect(tokenize('{name}')).toEqual([slot('name', 'str')])
  })

  it('parses an explicit slot type', () => {
    expect(tokenize('{count:num}')).toEqual([slot('count', 'num')])
  })
})

describe('tokenize escaping', () => {
  it('reads {{ as a single {', () => {
    expect(tokenize('{{a')).toEqual([text('{a')])
  })

  it('reads }} as a single }', () => {
    expect(tokenize('a}}')).toEqual([text('a}')])
  })

  it('reads {{ and }} without starting a slot', () => {
    expect(tokenize('{{text}}')).toEqual([text('{text}')])
  })

  it('keeps an unpaired single } as text', () => {
    expect(tokenize('a } b')).toEqual([text('a } b')])
  })

  it('escapes a pair of braces spanning both delimiters', () => {
    expect(tokenize('{{}}')).toEqual([text('{}')])
  })
})

describe('tokenize empty slots', () => {
  it('retains an empty {} as text', () => {
    expect(tokenize('a {} b')).toEqual([text('a '), text('{} b')])
  })

  it('retains a whitespace-only {  } as text', () => {
    expect(tokenize('a {  } b')).toEqual([text('a '), text('{  } b')])
  })
})

describe('tokenize unclosed slots', () => {
  it('retains an unclosed { as text', () => {
    expect(tokenize('{unclosed')).toEqual([text('{unclosed')])
  })

  it('retains the text before an unclosed {', () => {
    expect(tokenize('a {unclosed')).toEqual([text('a '), text('{unclosed')])
  })

  it('keeps a single { inside a slot', () => {
    expect(tokenize('a {b {c} d')).toEqual([
      text('a '),
      slot('b {c'),
      text(' d'),
    ])
  })
})

describe('tokenize branches', () => {
  it('parses branches of a typed slot', () => {
    expect(tokenize('{count:one-other|one:# item|other:# items}')).toEqual([
      slot('count', 'one-other', { one: '# item', other: '# items' }),
    ])
  })

  it('accepts single branch in test environment', () => {
    expect(tokenize('{a:b|one:first}')).toEqual([
      slot('a', 'b', { one: 'first' }),
    ])
  })

  it('trims the branch name', () => {
    expect(tokenize('{a:b|  one :first}')).toEqual([
      slot('a', 'b', { one: 'first' }),
    ])
  })

  it('keeps the branch string as is', () => {
    expect(tokenize('{a:b|one: first }')).toEqual([
      slot('a', 'b', { one: ' first ' }),
    ])
  })

  it('ignores a branch without a colon', () => {
    expect(tokenize('{a:b|noColon}')).toEqual([slot('a', 'b')])
  })

  it('keeps an empty branch string', () => {
    expect(tokenize('{a:b|x:}')).toEqual([slot('a', 'b', { x: '' })])
  })

  it('keeps a colon inside the branch string', () => {
    expect(tokenize('{a:b|x:1:2}')).toEqual([slot('a', 'b', { x: '1:2' })])
  })
})

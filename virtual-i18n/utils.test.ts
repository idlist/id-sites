import { describe, expect, it } from 'vitest'
import { code, codelines, joinText, rewriteIndent } from './utils'

describe('joinText', () => {
  it('returns an empty string when there is no argument', () => {
    expect(joinText()).toBe('')
  })

  it('joins strings', () => {
    expect(joinText('a', 'b', 'c')).toBe('abc')
  })

  it('joins string arrays', () => {
    expect(joinText(['a', 'b'], ['c'])).toBe('abc')
  })

  it('joins mixed strings and string arrays', () => {
    expect(joinText('a', ['b', 'c'], 'd')).toBe('abcd')
  })
})

describe('rewriteIndent', () => {
  it('replaces the common indentation with the given indentation', () => {
    const lines = [
      '  a',
      '  b',
      '    c',
    ]
    const expected = [
      '  a',
      '    b',
      '      c',
    ]

    expect(rewriteIndent(lines, 4)).toEqual(expected)
  })

  it('keeps the first line as is', () => {
    const lines = [
      '  a',
      '  b',
    ]
    const expected = [
      '  a',
      '    b',
    ]

    expect(rewriteIndent(lines, 4)).toEqual(expected)
  })

  it('keeps empty lines as is', () => {
    const lines = [
      'a',
      '',
      'b',
    ]
    const expected = [
      'a',
      '',
      '    b',
    ]

    expect(rewriteIndent(lines, 4)).toEqual(expected)
  })

  it('turns whitespace-only lines into empty lines', () => {
    const lines = [
      'a',
      '   ',
      '  b',
    ]
    const expected = [
      'a',
      '',
      '    b',
    ]

    expect(rewriteIndent(lines, 4)).toEqual(expected)
  })

  it('ignores whitespace-only lines when detecting the common indentation', () => {
    const lines = [
      '',
      '      b',
      '    ',
      '        c',
    ]
    const expected = [
      '',
      '    b',
      '',
      '      c',
    ]

    expect(rewriteIndent(lines, 4)).toEqual(expected)
  })

  it('returns a new array', () => {
    const lines = ['a', 'b']

    expect(rewriteIndent(lines, 4)).not.toBe(lines)
    expect(lines).toEqual(['a', 'b'])
  })
})

describe('code', () => {
  it('removes a single leading newline if present', () => {
    const template = code`
foo`
    const expected = 'foo'

    expect(template).toBe(expected)
  })

  it('interpolates values', () => {
    const template = code`a ${'b'} c`
    const expected = 'a b c'

    expect(template).toBe(expected)
  })

  it('interpolates array values', () => {
    const template = code`a ${['b', 'c']}`
    const expected = 'a b\nc'

    expect(template).toBe(expected)
  })

  it('interpolates mixed values and array values', () => {
    const template = code`${'a'} ${['b', 'c']} ${'d'}`
    const expected = 'a b\nc d'

    expect(template).toBe(expected)
  })

  it('re-indents a multi-line string when it is at the start of a line', () => {
    const template = code`a
    ${'x\n  y'}`
    const expected = `a
    x
    y`

    expect(template).toBe(expected)
  })

  it('re-indents multi-line values of an array when it is at the start of a line', () => {
    const template = code`a
    ${['x', 'y']}`
    const expected = `a
    x
    y`

    expect(template).toBe(expected)
  })

  it('does not re-indent values that is not at the start of a line', () => {
    const template = code`a   ${'x\n  y'}`
    const expected = `a   x
  y`

    expect(template).toBe(expected)
  })
})

describe('codelines', () => {
  it('returns the same output as code without trailing whitespace', () => {
    const template = codelines`
  foo
  bar  
`
    const expected = '  foo\n  bar'

    expect(template).toBe(expected)
  })

  it('keeps leading whitespace', () => {
    const template = codelines`  foo`
    const expected = '  foo'

    expect(template).toBe(expected)
  })
})

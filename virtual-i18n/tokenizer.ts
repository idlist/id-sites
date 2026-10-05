/*
 * Grammar:
 * {{ - A single {
 * }} - A single }
 * {slot} - A slot
 * {slot:type} - A typed slot
 * {slot:type|branch1:string1|branch2:string2...}
 *   - A typed slot whose result branches by the value of the slot,
 *     inside which # can be used to refer the value itself (like # items)
 *
 * The tokenizer is to split texts and slots.
 * It does not convert slot value into the type and process the # symbol.
 * # or | literals cannot be used inside a branch.
 */

export interface TextToken {
  type: 'text'
  text: string
}

export interface SlotToken {
  type: 'slot'
  slotName: string
  slotType: string
  branches: Record<string, string>
}

export type Token = TextToken | SlotToken

function parseSlotToken(input: string): SlotToken {
  const parts = input.split('|')
  const [header, ...rawBranches] = parts
  const [slotName, slotType = 'str'] = header.split(':').map(s => s.trim())
  const branches: Record<string, string> = {}

  for (const branch of rawBranches) {
    const colonIndex = branch.indexOf(':')
    if (colonIndex === -1) continue

    const branchName = branch.slice(0, colonIndex).trim()
    const branchString = branch.slice(colonIndex + 1)
    branches[branchName] = branchString
  }

  return {
    type: 'slot',
    slotName,
    slotType,
    branches,
  }
}

export function tokenize(input: string): Token[] {
  const tokens: Token[] = []
  let cursor = 0
  let buffer = ''
  let state: 'text' | 'slot' = 'text'

  const tryPushText = () => {
    if (!buffer.length) return
    tokens.push({ type: 'text', text: buffer })
    buffer = ''
  }

  while (cursor < input.length) {
    const char = input[cursor]
    const nextChar = cursor + 1 < input.length ? input[cursor + 1] : ''

    // {{ -> {.
    if (char === '{' && nextChar === '{') {
      buffer += '{'
      cursor += 2
      continue
    }

    // }} -> }.
    if (char === '}' && nextChar === '}') {
      buffer += '}'
      cursor += 2
      continue
    }

    // The starting of the slot, single {.
    if (char === '{') {
      // If text, start a slot.
      if (state === 'text') {
        tryPushText()
        cursor++ // Skip the single {
        state = 'slot'
        continue
      }

      // If is already in a slot, retain {
      if (state === 'slot') {
        buffer += '{'
        cursor++
        continue
      }
    }

    // The ending of the slot, single }.
    if (char === '}') {
      // Unpaired leftover single }.
      if (state === 'text') {
        buffer += '}'
        cursor++
        continue
      }

      if (state === 'slot') {
        cursor++ // Skip the single }
        state = 'text'

        // Does not support empty {}.
        // Empty {} will be retained as text.
        if (!buffer.trim().length) {
          buffer = `{${buffer}}`
          continue
        }

        const slotToken = parseSlotToken(buffer)
        tokens.push(slotToken)
        buffer = ''
        continue
      }
    }

    // Other characters.
    buffer += char
    cursor++
  }

  if (state === 'slot') {
    buffer = `{${buffer}`
  }
  tryPushText()

  return tokens
}

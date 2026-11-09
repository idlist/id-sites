export function joinText(...text: (string | string[])[]): string {
  return text.flat().join('')
}

export function rewriteIndent(lines: string[], indent: number): string[] {
  let oldIndent: number = Infinity

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i]
    if (line.trim() === '') continue

    const lineIndent = /^ */.exec(line)![0].length
    oldIndent = Math.min(oldIndent, lineIndent)
  }

  if (!Number.isFinite(oldIndent)) {
    oldIndent = 0
  }

  const indentSpaces = ' '.repeat(indent)

  return lines.map((line, index) => {
    if (line.trim() === '') return ''
    if (index === 0) return line
    return indentSpaces + line.slice(oldIndent)
  })
}

export function code(text: TemplateStringsArray, ...values: unknown[]): string {
  const content = text.reduce((prev, chunk, index) => {
    if (index >= values.length) return prev + chunk

    const head = prev + chunk
    const isLineStart = /(?:^|\n) *$/.test(head)

    let indentToInherit = 0
    if (isLineStart) {
      indentToInherit = / *$/.exec(chunk)![0].length
    }

    const rawValue = values[index]
    let valueLines = (Array.isArray(rawValue) ? rawValue : [rawValue])
      .flatMap(val => `${val}`.split('\n'))

    if (isLineStart && valueLines.length > 1) {
      valueLines = rewriteIndent(valueLines, indentToInherit)
    }

    return head + valueLines.join('\n')
  }, '')

  return content.replace(/^\n/, '')
}

export function codelines(text: TemplateStringsArray, ...values: unknown[]): string {
  return code(text, ...values).trimEnd()
}

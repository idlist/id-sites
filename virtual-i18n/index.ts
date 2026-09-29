import fs from 'node:fs'
import path from 'node:path'
import { type Logger, normalizePath, type Plugin } from 'vite'
import { type CustomI18nSlot, numSlot, oneOtherSlot, strSlot } from './slots'
import { type Token, tokenize } from './tokenizer'
import { joinLines, joinText } from './utils'

export interface PluginOptions {
  localeRoot?: string
  localeFiles: Record<string, string[]>
  defaultLocale?: string
  dtsEmitPath?: string
  customSlotHandlers?: CustomI18nSlot[]
}

type LangTokensMap = Record<string, Token[]>
type MessagesMap = Map<string, LangTokensMap>

const defaultDtsEmitPath = './src/virtual-i18n.d.ts'

const validKeyPattern = /^[A-Za-z_$][\w$]*$/

const escapeMessage = (message: string): string =>
  message
    .replace(/\\/g, '\\\\')
    .replace(/`/g, '\\`')
    .replace(/\$\{/g, '\\${')

const compileBranches = (
  name: string,
  branches: Record<string, string>,
): Record<string, string> => {
  const escapedBranches: Record<string, string> = {}

  for (const [branchName, branchString] of Object.entries(branches)) {
    escapedBranches[branchName] = escapeMessage(branchString)
      .replace(/#/g, () => `\${params.${name}}`)
  }

  return escapedBranches
}

const viteVirtualI18n = (options: PluginOptions): Plugin => {
  const virtualModuleId = 'virtual:i18n'
  const resolvedModuleId = `\0${virtualModuleId}`

  let logger: Logger
  let configRoot = ''
  let localeRoot = ''
  let dtsFullPath = ''
  let defaultLocale = ''
  let filesToWatch: string[] = []
  let messagesMapCache: MessagesMap

  // Setup slot handlers.
  const slotHandlers: Record<string, CustomI18nSlot> = {}
  slotHandlers[strSlot.id] = strSlot
  slotHandlers[numSlot.id] = numSlot
  slotHandlers[oneOtherSlot.id] = oneOtherSlot

  if (options.customSlotHandlers) {
    for (const handler of options.customSlotHandlers) {
      slotHandlers[handler.id] = handler
    }
  }

  const collectMessages = (): MessagesMap => {
    const rawMessages: Record<string, Record<string, unknown>> = {}

    for (const [lang, files] of Object.entries(options.localeFiles)) {
      rawMessages[lang] = {}

      for (const filePath of files) {
        const fullPath = path.resolve(localeRoot, filePath)
        if (!fs.existsSync(fullPath)) {
          logger.error(`File "${filePath}" does not exist.`)
          continue
        }

        const fileContent = fs.readFileSync(fullPath, 'utf8')
        try {
          const json = JSON.parse(fileContent)
          Object.assign(rawMessages[lang], json)
        } catch {
          logger.error(`File "${filePath}" contains invalid JSON.`)
        }
      }
    }

    const messagesCollected: MessagesMap = new Map()

    for (const [lang, json] of Object.entries(rawMessages)) {
      for (const [key, message] of Object.entries(json)) {
        // Verify if the key is valid.
        if (!validKeyPattern.test(key)) {
          logger.warn(`In "${lang}": key "${key}" is not a valid identifier. Skipped.`)
          continue
        }

        // Verify if the message is a string.
        if (typeof message !== 'string') {
          logger.warn(`In "${lang}": key "${key}"'s content is not a string. Skipped.`)
          continue
        }

        const tokens = tokenize(message)
        const langTokensMap = messagesCollected.getOrInsert(key, {})
        langTokensMap[lang] = tokens

        // Verify slot tokens.
        for (const token of tokens) {
          if (token.type !== 'slot') continue

          // Verify if the handler exists.
          const handler = slotHandlers[token.slotType]
          if (!handler) {
            logger.warn(joinText(
              `In "${lang}", key "${key}": `,
              `slot type "${token.slotType}" is not registered.`,
            ))
            continue
          }

          // Verify if the branches requried by a slot type is fulfilled.
          if (!handler.branches) continue
          const branchesMissing = handler.branches.filter(name => !token.branches[name])
          if (branchesMissing.length) {
            logger.warn(joinText(
              `In "${lang}", key "${key}": `,
              `slot type "${token.slotType}" is missing the branch(es) "`,
              branchesMissing.join('", "'),
              '".',
            ))
          }
        }
      }
    }

    return messagesCollected
  }

  const generateVirtualJs = (messagesMap: MessagesMap): string => {
    const functionTemplates: string[] = []

    for (const [key, langTokensMap] of messagesMap.entries()) {
      const branchTemplates: string[] = []

      for (const [lang, tokens] of Object.entries(langTokensMap)) {
        const template: string[] = []

        for (const token of tokens) {
          if (token.type === 'text') {
            const textEscaped = escapeMessage(token.text)
            template.push(textEscaped)
          }

          if (token.type === 'slot') {
            const handler = slotHandlers[token.slotType] ?? strSlot

            const slotTemplate = handler.generateCode({
              key,
              name: token.slotName,
              branches: compileBranches(token.slotName, token.branches),
            })
            template.push(slotTemplate)
          }
        }

        branchTemplates.push(joinText(
          `      case '${lang}': `,
          'return `',
          template.join(''),
          '`',
        ))
      }

      functionTemplates.push(joinLines(
        `  ${key}: (params) => {`,
        '    switch (locale.value) {',
        ...branchTemplates,
        `      default: return '${key}'`,
        '    }',
        '  },',
      ))
    }

    return joinLines(
      `import { ref } from 'vue'`,
      '',
      `export const locale = ref('${defaultLocale}')`,
      '',
      'export const m = {',
      ...functionTemplates,
      '}',
      '',
    )
  }

  const generateDts = (messagesMap: MessagesMap): string => {
    const dtsTemplates: string[] = []

    for (const [key, langTokensMap] of messagesMap.entries()) {
      const slotTypeMap = new Map<string, Set<string>>()

      for (const tokens of Object.values(langTokensMap)) {
        for (const token of tokens) {
          if (token.type !== 'slot') continue

          const handler = slotHandlers[token.slotType] ?? strSlot
          const typeString = handler.generateType({
            branches: token.branches,
          })

          const slotType = slotTypeMap.getOrInsert(token.slotName, new Set())
          slotType.add(typeString)
        }
      }

      const paramsDefs = [...slotTypeMap]
        .map(([name, types]) => `${name}: ${[...types].join(' | ')}`)
        .join(', ')

      dtsTemplates.push(joinText(
        `    ${key}: `,
        paramsDefs ? `(params: { ${paramsDefs} })` : '()',
        ` => string,`,
      ))
    }

    const locales = Object.keys(options.localeFiles).map(lang => `'${lang}'`)

    return joinLines(
      '// Generated by vue-virtual-i18n',
      '',
      `declare module '${virtualModuleId}' {`,
      `  import type { Ref } from 'vue'`,
      '',
      '  export type GeneralVirtualMessage = (...args: unknown[]) => string',
      '',
      `  export const locale: Ref<${locales.join(' | ')}>`,
      '',
      '  export const m: {',
      ...dtsTemplates,
      '  }',
      '}',
      '',
    )
  }

  const emitDts = (dts: string) => {
    fs.mkdirSync(path.dirname(dtsFullPath), { recursive: true })
    fs.writeFileSync(dtsFullPath, dts, 'utf8')
  }

  const getFilesToWatch = (): string[] => {
    const filePaths: string[] = []

    for (const files of Object.values(options.localeFiles)) {
      for (const filePath of files) {
        const fullPath = path.resolve(localeRoot, filePath)
        if (!fs.existsSync(fullPath)) continue
        filePaths.push(normalizePath(fullPath))
      }
    }

    return filePaths
  }

  const resolveDefaultLocale = (): string => {
    const availableLocales = Object.keys(options.localeFiles)

    if (!availableLocales.length) {
      logger.warn('No locales are provided.')
      return ''
    }
    if (!options.defaultLocale) {
      return availableLocales[0]
    }
    if (availableLocales.includes(options.defaultLocale)) {
      return options.defaultLocale
    }

    logger.warn(joinText(
      `Default locale "${options.defaultLocale}" is not in localeFiles. `,
      `Falling back to the first locale (${availableLocales[0]}).`,
    ))
    return availableLocales[0]
  }

  return {
    name: 'vue-virtual-i18n',
    enforce: 'pre',

    configResolved(config) {
      logger = config.logger

      if (config.configFile) {
        configRoot = path.dirname(config.configFile)
      } else {
        configRoot = config.root
      }

      if (options.localeRoot) {
        localeRoot = normalizePath(path.resolve(configRoot, options.localeRoot))
      }

      filesToWatch = getFilesToWatch()
      defaultLocale = resolveDefaultLocale()

      const dtsPath = options.dtsEmitPath ?? defaultDtsEmitPath
      dtsFullPath = normalizePath(path.resolve(configRoot, dtsPath))

      messagesMapCache = collectMessages()
      const dts = generateDts(messagesMapCache)
      emitDts(dts)
    },

    resolveId(id) {
      if (id === virtualModuleId) return resolvedModuleId
    },

    load(id) {
      if (id !== resolvedModuleId) return

      for (const filePath of filesToWatch) {
        this.addWatchFile(filePath)
      }

      return generateVirtualJs(messagesMapCache)
    },

    handleHotUpdate({ file, server }) {
      const fullPath = normalizePath(path.resolve(localeRoot, file))
      if (!filesToWatch.includes(fullPath)) return

      messagesMapCache = collectMessages()
      const dts = generateDts(messagesMapCache)
      emitDts(dts)

      const thisModule = server.moduleGraph.getModuleById(resolvedModuleId)
      if (!thisModule) return
      return [thisModule]
    },
  }
}

export default viteVirtualI18n

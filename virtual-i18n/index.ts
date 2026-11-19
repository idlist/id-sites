import fs from 'node:fs'
import path from 'node:path'
import { type Logger, normalizePath, type Plugin } from 'vite'
import { numSlot, oneOtherSlot, strSlot, type VirtualI18nSlot } from './slots.virtual'
import { type Token, tokenize } from './tokenizer'
import { code, codelines, joinText } from './utils'

interface LocaleOptions {
  type?: 'vue' | 'static'
  folder: string
  defaultLocale: string
}

interface InstanceOptions extends LocaleOptions {
  namespace: string
}

export interface PluginOptions extends Partial<LocaleOptions> {
  instances?: InstanceOptions[]
  dtsEmitPath?: string
  customSlotHandlers?: VirtualI18nSlot[]
}

interface LocaleInstance {
  type: 'vue' | 'static'
  folder: string
  defaultLocale: string
  namespace: string
}

type AvailableLocalesPerInstance = Record<string, Set<string>>

type LangTokensRecord = Record<string, Token[]>
type Messages = Map<string, LangTokensRecord>
type MessagesPerInstance = Map<string, Messages>

type InstanceMap = Map<string, LocaleInstance>
type SlotHandlerRecord = Record<string, VirtualI18nSlot>

interface MessageContext {
  availableLocalesPerInstance: AvailableLocalesPerInstance
  messagesPerInstance: MessagesPerInstance
  filesToWatch: string[]
}

const defaultDtsEmitPath = './src/virtual-i18n.d.ts'

const validKeyPattern = /^[A-Za-z_$][\w$]*$/

function escapeMessage(message: string): string {
  return message
    .replace(/\\/g, '\\\\')
    .replace(/`/g, '\\`')
    .replace(/\$\{/g, '\\${')
}

function escapeBranches(
  branches: Record<string, string>,
  name: string,
): Record<string, string> {
  const escapedBranches: Record<string, string> = {}

  for (const [branchName, branchString] of Object.entries(branches)) {
    escapedBranches[branchName] = escapeMessage(branchString)
      .replace(/#/g, () => `\${params.${name}}`)
  }

  return escapedBranches
}

function loadMessageContext(
  logger: Logger,
  configRoot: string,
  instanceMap: InstanceMap,
  slotHandlers: SlotHandlerRecord,
): MessageContext {
  const availableLocalesPerInstance: AvailableLocalesPerInstance = {}
  const messagesPerInstance: MessagesPerInstance = new Map()
  const filesToWatch: string[] = []

  for (const instance of instanceMap.values()) {
    const availableLocales = new Set<string>()
    const rawJsons: Record<string, Record<string, unknown>> = {}

    const instanceRoot = path.resolve(configRoot, instance.folder)
    if (!fs.existsSync(instanceRoot)) {
      logger.warn(`Folder "${instance.folder}" does not exist. Skipped.`)
      continue
    }

    // Subfolders are only for grouping, so the whole folder is walked through.
    const entries = fs.readdirSync(instanceRoot, { recursive: true, withFileTypes: true })

    for (const entry of entries) {
      if (!entry.isFile()) continue
      if (!entry.name.endsWith('.json')) continue

      // A locale is taken from the second-to-last suffix,
      // or from the file name if the name carries a single suffix, e.g. "en.json".
      const stem = path.parse(entry.name).name
      const lang = stem.includes('.') ? stem.split('.').at(-1)! : stem

      const filePath = path.resolve(entry.parentPath, entry.name)

      let json: unknown
      try {
        json = JSON.parse(fs.readFileSync(filePath, 'utf8'))
      } catch {
        logger.warn(`File "${normalizePath(filePath)}" is not valid JSON. Skipped.`)
        continue
      }

      if (json === null || typeof json !== 'object' || Array.isArray(json)) {
        logger.warn(`File "${normalizePath(filePath)}" is not a JSON object. Skipped.`)
        continue
      }

      rawJsons[lang] ??= {}
      Object.assign(rawJsons[lang], json)

      // TODO: collect available loacles
    }

    availableLocalesPerInstance[instance.namespace] = availableLocales
    const messages = messagesPerInstance.getOrInsert(instance.namespace, new Map())

    for (const [lang, json] of Object.entries(rawJsons)) {
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
        const langTokensMap = messages.getOrInsert(key, {})
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
  }

  return {
    availableLocalesPerInstance,
    messagesPerInstance,
    filesToWatch,
  }
}

function generateJs(
  instance: LocaleInstance,
  messages: Messages,
  slotHandlers: SlotHandlerRecord,
  availableLocales: Set<string>,
): string {
  switch (instance.type) {
    case 'vue':
      return generateJsForVue(instance, messages, slotHandlers, availableLocales)
    case 'static':
      return generateJsForStatic(instance, messages, slotHandlers, availableLocales)
  }
}

function generateJsForVue(
  instance: LocaleInstance,
  messages: Messages,
  slotHandlers: SlotHandlerRecord,
  availableLocales: Set<string>,
): string {
  const functionTemplates: string[] = []

  for (const [key, langTokensMap] of messages.entries()) {
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
            branches: escapeBranches(token.branches, token.slotName),
          })
          template.push(slotTemplate)
        }
      }

      branchTemplates.push(codelines /* ts */`
case '${lang}': return \`${joinText(template)}\`
`)
    }

    functionTemplates.push(codelines /* ts */`
${key}: (params) => {
  switch (locale.value) {
    ${branchTemplates}
    default: return '${key}'
  }
},
`)
  }

  const locales = availableLocales.values().map(lang => `'${lang}'`).toArray()

  return code /* ts */`
import { ref } from 'vue'

export const locale = ref('${instance.defaultLocale}')

export const supportedLocales = new Set([${locales.join(', ')}])

export const allLocales = new Set([${locales.join(', ')}])

export function toMessage(stringOrMessage) {
  if (typeof stringOrMessage === 'string') {
    return stringOrMessage
  } else {
    return stringOrMessage()
  }
}

export const m = {
  ${functionTemplates}
}
`
}

function generateJsForStatic(
  instance: LocaleInstance,
  messages: Messages,
  slotHandlers: SlotHandlerRecord,
  availableLocales: Set<string>,
): string {
  // TODO
  return ''
}

function generateDtsOld(
  messages: Messages,
  slotHandlers: SlotHandlerRecord,
  availableLocales: Set<string>,
  virtualModuleId: string,
): string {
  const dtsTemplates: string[] = []

  for (const [key, langTokensRecord] of messages.entries()) {
    const slotTypeMap = new Map<string, Set<string>>()

    for (const tokens of Object.values(langTokensRecord)) {
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

    dtsTemplates.push(codelines /* ts */`
${key}: ${paramsDefs ? `(params: { ${paramsDefs} })` : '()'} => string,
`)
  }

  const locales = availableLocales.values().map(lang => `'${lang}'`).toArray()

  return code /* ts */`
// Generated by vue-virtual-i18n

declare module '${virtualModuleId}' {
  import type { Ref } from 'vue'

  export type GeneralVirtualMessage = (...args: unknown[]) => string

  export type SupportedLocales = ${locales.join(' | ')}

  export const locale: Ref<SupportedLocales>

  export const supportedLocales: Set<string>

  export const allLocales: Set<SupportedLocales>

  export function toMessage(stringOrMessage: string | GeneralVirtualMessage): string

  export const m: {
    ${dtsTemplates}
  }
}
`
}

function generateDts(
  virtualModuleId: string,
  context: MessageContext,
  instanceMap: InstanceMap,
  slotHandlers: SlotHandlerRecord,
): string {
  // TODO
  return ''
}

function viteVirtualI18n(options: PluginOptions): Plugin {
  const virtualModuleId = 'virtual:i18n'
  const resolvedModuleId = `\0${virtualModuleId}`
  const virtualSubmodulePrefix = `${virtualModuleId}/`
  const resolvedSubmodulePrefix = `\0${virtualSubmodulePrefix}`

  let logger: Logger
  let configRoot = ''
  let dtsFullPath = ''
  let context: MessageContext | null = null

  /** @deprecated */
  let messagesCache: Messages

  const instanceMap: InstanceMap = new Map()

  // Setup main namespace if both root folder and root default locale are not null.
  if (options.folder != null && options.defaultLocale != null) {
    instanceMap.set('', {
      type: options.type ?? 'vue',
      folder: options.folder,
      defaultLocale: options.defaultLocale,
      namespace: '',
    })
  }

  // Setup instances.
  if (options.instances != null) {
    for (const instance of options.instances) {
      instanceMap.set(instance.namespace, {
        ...instance,
        type: instance.type ?? 'vue',
      })
    }
  }

  // Setup slot handlers.
  const slotHandlers: Record<string, VirtualI18nSlot> = {}
  slotHandlers[strSlot.id] = strSlot
  slotHandlers[numSlot.id] = numSlot
  slotHandlers[oneOtherSlot.id] = oneOtherSlot

  if (options.customSlotHandlers != null) {
    for (const handler of options.customSlotHandlers) {
      slotHandlers[handler.id] = handler
    }
  }

  const emitDts = (dts: string) => {
    fs.mkdirSync(path.dirname(dtsFullPath), { recursive: true })
    fs.writeFileSync(dtsFullPath, dts, 'utf8')
  }

  return {
    name: 'vite-virtual-i18n',
    enforce: 'pre',

    configResolved(config) {
      logger = config.logger
      configRoot = config.configFile ? path.dirname(config.configFile) : config.root

      const dtsPath = options.dtsEmitPath ?? defaultDtsEmitPath
      dtsFullPath = normalizePath(path.resolve(configRoot, dtsPath))

      context = loadMessageContext(logger, configRoot, instanceMap, slotHandlers)
      const dts = generateDts(virtualModuleId, context, instanceMap, slotHandlers)
      emitDts(dts)
    },

    resolveId(id) {
      if (id === virtualModuleId) {
        return resolvedModuleId
      } else {
        if (!id.startsWith(virtualSubmodulePrefix)) return

        const maybeName = id.slice(virtualSubmodulePrefix.length)
        if (maybeName === '') return
        if (!instanceMap.has(maybeName)) return

        return `${resolvedSubmodulePrefix}/${maybeName}`
      }
    },

    load(id) {
      if (context == null) return

      if (id === resolvedModuleId) {
        for (const filePath of context.filesToWatch) {
          this.addWatchFile(filePath)
        }

        return generateJs(
          instanceMap.get('')!,
          context.messagesPerInstance.get('')!,
          slotHandlers,
          context.availableLocalesPerInstance[''],
        )
      } else {
        if (!id.startsWith(resolvedSubmodulePrefix)) return

        const maybeName = id.slice(resolvedSubmodulePrefix.length)
        if (maybeName === '') return

        const instance = instanceMap.get(maybeName)
        if (instance == null) return

        for (const filePath of context.filesToWatch) {
          this.addWatchFile(filePath)
        }

        return generateJs(
          instance,
          context.messagesPerInstance.get(maybeName)!,
          slotHandlers,
          context.availableLocalesPerInstance[maybeName],
        )
      }
    },

    handleHotUpdate({ file, server }) {
      if (context == null) return

      const fullPath = normalizePath(path.resolve(configRoot, file))
      if (!context.filesToWatch.includes(fullPath)) return

      context = loadMessageContext(logger, configRoot, instanceMap, slotHandlers)
      const dts = generateDts(virtualModuleId, context, instanceMap, slotHandlers)
      emitDts(dts)

      const thisModule = server.moduleGraph.getModuleById(resolvedModuleId)
      if (!thisModule) return
      return [thisModule]
    },
  }
}

export default viteVirtualI18n

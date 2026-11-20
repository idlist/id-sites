import fs, { type Dirent } from 'node:fs'
import path from 'node:path'
import { type Logger, type ModuleNode, normalizePath, type Plugin } from 'vite'
import { numSlot, oneOtherSlot, strSlot, type VirtualI18nSlot } from './slots.virtual'
import { type Token, tokenize } from './tokenizer'
import { code, codelines, joinText } from './utils'

type LocaleType = 'vue' | 'static'

interface LocaleOptions {
  type?: LocaleType
  folder: string
  defaultLocale?: string
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
  namespace: string
  type: LocaleType
  folder: string
  defaultLocale?: string
}

type SupportedLocalesPerInstance = Record<string, Set<string>>

type LangTokensRecord = Record<string, Token[]>
type Messages = Map<string, LangTokensRecord>
type MessagesPerInstance = Map<string, Messages>

type InstanceMap = Map<string, LocaleInstance>
type SlotHandlerRecord = Record<string, VirtualI18nSlot>

interface MessageContext {
  supportedLocalesPerInstance: SupportedLocalesPerInstance
  messagesPerInstance: MessagesPerInstance
  filesToWatch: string[]
}

const defaultDtsEmitPath = 'virtual-i18n.d.ts'

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

function getInstanceName(instance: LocaleInstance) {
  return instance.namespace === '' ? 'main instance' : `instance "${instance.namespace}"`
}

function appendNamespace(id: string, instance: LocaleInstance) {
  return instance.namespace === '' ? id : `${id}/${instance.namespace}`
}

interface LoadFromEntryResult {
  filePath: string
  lang: string
  json: unknown
}

function tryLoadFromEntry(
  logger: Logger,
  instance: LocaleInstance,
  entry: Dirent,
): LoadFromEntryResult | undefined {
  if (!entry.isFile()) return
  if (!entry.name.endsWith('.json')) return

  const fileName = path.parse(entry.name).name
  const lang = fileName.includes('.') ? fileName.split('.').at(-1)! : fileName

  const filePath = path.resolve(entry.parentPath, entry.name)
  const normalizedFilePath = normalizePath(filePath)
  let json: unknown

  try {
    json = JSON.parse(fs.readFileSync(filePath, 'utf8'))
  } catch {
    const hint = joinText(
      `In ${getInstanceName(instance)}: `,
      `File ${normalizedFilePath} is not a valid JSON. Skipped.`,
    )
    logger.warn(hint)
    return
  }

  // We do not check schema on JSON.
  // Basic checks like `json == null` or `typeof json` are still schema checks.
  return { filePath: normalizedFilePath, lang, json }
}

function tryTokenizeMessage(
  logger: Logger,
  slotHandlers: SlotHandlerRecord,
  instance: LocaleInstance,
  lang: string,
  key: string,
  message: unknown,
) {
  const hintPrefix = `In ${getInstanceName(instance)} - "${lang}"`

  // Verify if the key is valid.
  if (!validKeyPattern.test(key)) {
    logger.warn(`${hintPrefix}: key "${key}" is not a valid identifier. Skipped.`)
    return
  }

  // Verify if the message is a string.
  if (typeof message !== 'string') {
    logger.warn(`${hintPrefix}: key "${key}"'s content is not a string. Skipped.`)
    return
  }

  const tokens = tokenize(message)

  // Verify slot tokens.
  for (const token of tokens) {
    if (token.type !== 'slot') continue

    // Verify if the handler exists.
    const handler = slotHandlers[token.slotType]
    if (!handler) {
      logger.warn(joinText(
        `${hintPrefix}, key "${key}": `,
        `slot type "${token.slotType}" is not registered.`,
      ))
      continue
    }

    // Verify if the branches requried by a slot type is fulfilled.
    if (!handler.branches) continue
    const branchesMissing = handler.branches.filter(name => !token.branches[name])
    if (branchesMissing.length) {
      logger.warn(joinText(
        `${hintPrefix}, key "${key}": `,
        `slot type "${token.slotType}" is missing the branch(es) "`,
        branchesMissing.join('", "'),
        '".',
      ))
    }
  }

  return tokens
}

function loadMessageContext(
  logger: Logger,
  configRoot: string,
  instanceMap: InstanceMap,
  slotHandlers: SlotHandlerRecord,
): MessageContext {
  const supportedLocalesPerInstance: SupportedLocalesPerInstance = {}
  const messagesPerInstance: MessagesPerInstance = new Map()
  const filesToWatch: string[] = []

  for (const instance of instanceMap.values()) {
    const supportedLocales = new Set<string>()
    const rawJsons: Record<string, Record<string, unknown>> = {}

    const root = path.resolve(configRoot, instance.folder)
    if (!fs.existsSync(root)) {
      const hint = joinText(
        `In ${getInstanceName(instance)} :`,
        `Folder "${instance.folder}" does not exist. Skipped.`,
      )
      logger.warn(hint)
      continue
    }

    const entries = fs.readdirSync(root, { recursive: true, withFileTypes: true })

    for (const entry of entries) {
      const result = tryLoadFromEntry(logger, instance, entry)
      if (result == null) continue

      rawJsons[result.lang] ??= {}
      Object.assign(rawJsons[result.lang], result.json)

      supportedLocales.add(result.lang)
      filesToWatch.push(result.filePath)
    }

    supportedLocalesPerInstance[instance.namespace] = supportedLocales
    const messages = messagesPerInstance.getOrInsert(instance.namespace, new Map())

    for (const [lang, json] of Object.entries(rawJsons)) {
      for (const [key, message] of Object.entries(json)) {
        const tokens = tryTokenizeMessage(
          logger,
          slotHandlers,
          instance,
          lang,
          key,
          message,
        )
        if (tokens == null) continue

        const langTokensMap = messages.getOrInsert(key, {})
        langTokensMap[lang] = tokens
      }
    }
  }

  return {
    supportedLocalesPerInstance,
    messagesPerInstance,
    filesToWatch,
  }
}

const switchTargets: Record<LocaleType, string> = {
  vue: 'locale.value',
  static: 'locale',
}

function generateJsInCommon(supportedLocales: Set<string>) {
  const localeValues = supportedLocales.values()
    .map(lang => `'${lang}'`)
    .toArray()
    .join(', ')

  return codelines`
export const allLocales = new Set([${localeValues}])

export const supportedLocales = new Set([${localeValues}])

export function toMessage(stringOrMessage) {
  if (typeof stringOrMessage === 'string') {
    return stringOrMessage
  } else {
    return stringOrMessage()
  }
}`
}

function generateMessageFunctions(
  messages: Messages,
  slotHandlers: SlotHandlerRecord,
  type: LocaleType,
) {
  const target = switchTargets[type]
  const tmplFunctions: string[] = []

  for (const [key, langTokensRecord] of messages.entries()) {
    const tmplBranches: string[] = []

    for (const [lang, tokens] of Object.entries(langTokensRecord)) {
      const tmplValues: string[] = []

      for (const token of tokens) {
        if (token.type === 'text') {
          const escapedMessage = escapeMessage(token.text)
          tmplValues.push(escapedMessage)
        }

        if (token.type === 'slot') {
          const handler = slotHandlers[token.slotType] ?? strSlot

          const tmplSlot = handler.generateCode({
            key,
            name: token.slotName,
            branches: escapeBranches(token.branches, token.slotName),
          })
          tmplValues.push(tmplSlot)
        }
      }

      tmplBranches.push(codelines`
case '${lang}': return \`${joinText(tmplValues)}\`
`)
    }

    tmplFunctions.push(codelines`
${key}: (params) => {
  switch (${target}) {
    ${tmplBranches}
    default: return '${key}'
  }
},
`)
  }

  return tmplFunctions
}

function generateJs(
  instance: LocaleInstance,
  messages: Messages,
  slotHandlers: SlotHandlerRecord,
  supportedLocales: Set<string>,
): string {
  switch (instance.type) {
    case 'vue':
      return generateJsForVue(instance, messages, slotHandlers, supportedLocales)
    case 'static':
      return generateJsForStatic(messages, slotHandlers, supportedLocales)
  }
}

function generateJsForVue(
  instance: LocaleInstance,
  messages: Messages,
  slotHandlers: SlotHandlerRecord,
  supportedLocales: Set<string>,
): string {
  const tmplCommon = generateJsInCommon(supportedLocales)
  const tmplMessages = generateMessageFunctions(messages, slotHandlers, 'vue')
  const tmplLocale = instance.defaultLocale!

  return code`
import { ref } from 'vue'

${tmplCommon}

export const locale = ref('${tmplLocale}')

export const m = {
  ${tmplMessages}
}
`
}

function generateJsForStatic(
  messages: Messages,
  slotHandlers: SlotHandlerRecord,
  supportedLocales: Set<string>,
): string {
  const tmplCommon = generateJsInCommon(supportedLocales)
  const tmplMessages = generateMessageFunctions(messages, slotHandlers, 'static')

  return code`
${tmplCommon}

export function useI18n(locale) {
  return {
    m: {
      ${tmplMessages}
    }
  }
}
`
}

function generateDtsInCommon(supportedLocales: Set<string>) {
  const localeTypes = supportedLocales.values()
    .map(lang => `'${lang}'`)
    .toArray()
    .join(' | ')

  return codelines`
export type VirtualMessage = (...args: unknown[]) => string

export type SupportedLocale = ${localeTypes}

export const allLocales: Set<SupportedLocale>

export const supportedLocales: Set<string>

export function toMessage(stringOrMessage: string | VirtualMessage): string
`
}

function generateDtsForMessages(messages: Messages, slotHandlers: SlotHandlerRecord) {
  const dtsFunctions: string[] = []

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

    const paramsDefs = slotTypeMap.entries()
      .map(([name, types]) => `${name}: ${[...types].join(' | ')}`)
      .toArray()
      .join(', ')

    dtsFunctions.push(codelines`
${key}: ${paramsDefs ? `(params: { ${paramsDefs} })` : '()'} => string,
`)
  }

  return dtsFunctions
}

function generateDts(
  virtualModuleId: string,
  context: MessageContext,
  instanceMap: InstanceMap,
  slotHandlers: SlotHandlerRecord,
): string {
  const dtsModules: string[] = []

  for (const instance of instanceMap.values()) {
    const id = appendNamespace(virtualModuleId, instance)

    const messages = context.messagesPerInstance.get(instance.namespace)!
    const locales = context.supportedLocalesPerInstance[instance.namespace]

    switch (instance.type) {
      case 'vue':
        dtsModules.push(generateDtsForVue(id, slotHandlers, messages, locales))
        break
      case 'static':
        dtsModules.push(generateDtsForStatic(id, slotHandlers, messages, locales))
        break
    }
  }

  return code`
// Generated by vue-virtual-i18n

${dtsModules}
`
}

function generateDtsForVue(
  virtualModuleId: string,
  slotHandlers: SlotHandlerRecord,
  messages: Messages,
  supportedLocales: Set<string>,
) {
  const dtsCommon = generateDtsInCommon(supportedLocales)
  const dtsMessages = generateDtsForMessages(messages, slotHandlers)

  return code`
declare module '${virtualModuleId}' {
  import type { Ref } from 'vue'

  ${dtsCommon}

  export const locale: Ref<SupportedLocale>

  export const m: {
    ${dtsMessages}
  }
}
`
}

function generateDtsForStatic(
  virtualModuleId: string,
  slotHandlers: SlotHandlerRecord,
  messages: Messages,
  supportedLocales: Set<string>,
) {
  const dtsCommon = generateDtsInCommon(supportedLocales)
  const dtsMessages = generateDtsForMessages(messages, slotHandlers)

  return code`
declare module '${virtualModuleId}' {
  ${dtsCommon}

  interface MessageCollection {
    m: {
      ${dtsMessages}
    }
  }

  export function useI18n(locale: SupportedLocale): MessageCollection
}
`
}

function resolveInstances(logger: Logger, options: PluginOptions) {
  const instanceMap: InstanceMap = new Map()

  // Setup main namespace if both root folder and root default locale are not null.
  if (options.folder != null) {
    const type = options.type ?? 'vue'

    if (type === 'vue' && options.defaultLocale == null) {
      logger.warn(joinText(
        'In main instance: ',
        '"defaultLocale" is not provided when the type of the instance is "vue". ',
        'Skipped.',
      ))
    } else {
      instanceMap.set('', {
        type,
        folder: options.folder,
        defaultLocale: options.defaultLocale,
        namespace: '',
      })
    }
  }

  // Setup instances.
  if (options.instances != null) {
    for (const instance of options.instances) {
      const type = instance.type ?? 'vue'

      if (type === 'vue' && instance.defaultLocale == null) {
        logger.warn(joinText(
          `In instance "${instance.namespace}": `,
          '"defaultLocale" is not provided when the type of the instance is "vue". ',
          'Skipped.',
        ))
        continue
      }

      if (instanceMap.has(instance.namespace)) {
        logger.warn(joinText(
          'Duplicated namespaces "',
          instance.namespace,
          '" in the plugin configuration. Skipped the later one.',
        ))
        continue
      }

      instanceMap.set(instance.namespace, {
        ...instance,
        type,
      })
    }
  }

  if (instanceMap.size === 0) {
    logger.warn('No instances are configured.')
  }

  return instanceMap
}

function viteVirtualI18n(options: PluginOptions): Plugin {
  const virtualModuleId = 'virtual:i18n'
  const resolvedModuleId = `\0${virtualModuleId}`

  let logger: Logger
  let configRoot = ''
  let dtsFullPath = ''
  let context: MessageContext | null = null
  let instanceMap: InstanceMap = new Map()

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
      instanceMap = resolveInstances(logger, options)

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
        if (!id.startsWith(`${virtualModuleId}/`)) return

        const maybeName = id.slice(virtualModuleId.length + 1)
        if (maybeName === '') return
        if (!instanceMap.has(maybeName)) return

        return `${resolvedModuleId}/${maybeName}`
      }
    },

    load(id) {
      if (context == null) return

      if (id === resolvedModuleId) {
        const mainInstance = instanceMap.get('')
        if (mainInstance == null) return

        for (const filePath of context.filesToWatch) {
          this.addWatchFile(filePath)
        }

        return generateJs(
          mainInstance,
          context.messagesPerInstance.get('')!,
          slotHandlers,
          context.supportedLocalesPerInstance[''],
        )
      } else {
        if (!id.startsWith(`${resolvedModuleId}/`)) return

        const maybeName = id.slice(resolvedModuleId.length + 1)
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
          context.supportedLocalesPerInstance[maybeName],
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

      const modulesToInvalidate: ModuleNode[] = []

      // Invalidate all modules.
      for (const instance of instanceMap.values()) {
        const id = appendNamespace(resolvedModuleId, instance)
        const thisModule = server.moduleGraph.getModuleById(id)
        if (thisModule == null) continue

        modulesToInvalidate.push(thisModule)
      }

      return modulesToInvalidate
    },
  }
}

export default viteVirtualI18n

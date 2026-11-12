// Inspired by https://github.com/lin-stephanie/satteri-callouts

import type { ElementContent } from 'hast'
import { type Child, h } from 'hastscript'
import { defineHastPlugin } from 'satteri'

/** Matches the callout marker. */
const markerPattern = /^\[!([\w-]+)\](?:\s+(.*))?$/

/**
 * Convert blockquotes that start with `> [!type] title` into a callout block.
 *
 * Generated structure using Vue's template syntax:
 *
 * ```vue
 * <template>
 *   <div :class="['id-callout', type]">
 *     <div class="header">
 *       <div class="icon" aria-hidden="true">
 *         <img :src="`/assets/${type}`" alt="" />
 *       </div>
 *
 *       <div class="title">
 *         {{ title }}
 *       </div>
 *     </div>
 *
 *     <div class="content">
 *       <slot />
 *     </div>
 *   </div>
 * </template>
 * ````
 *
 * Does not check the value of `type`.
 * Does not support collapsible callouts.
 */
export const callouts = defineHastPlugin({
  name: 'callouts',
  element: {
    filter: ['blockquote'],
    visit(node, ctx) {
      const filtered = node.children.filter((child) => !isBlankText(child))
      const [firstLine, ...content] = filtered
      if (!firstLine) return

      if (firstLine.type !== 'element') return
      if (firstLine.tagName !== 'p') return

      const maybeMarker = firstLine.children[0]
      if (maybeMarker?.type !== 'text') return

      const match = markerPattern.exec(maybeMarker.value)
      if (!match) return

      const [, rawType, rawTitle] = match
      const type = rawType.trim()
      const typeClass = type.toLowerCase()
      const title = [
        rawTitle ? rawTitle : type,
        ...firstLine.children.slice(1),
      ]

      const callout = createCallout(typeClass, title, content)
      ctx.replaceNode(node, callout)
    },
  },
})

function isBlankText(child: ElementContent) {
  return child.type === 'text' && child.value.trim() === ''
}

function createCallout(type: string, title: Child, content: Child) {
  return (
    h('div', { class: ['id-callout', type] }, [
      h('div', { class: ['header'] }, [
        h('div', { class: ['icon'], 'aria-hidden': true }, [
          h('img', { src: `/assets/${type}.svg`, alt: '' }),
        ]),
        h('div', { class: ['title'] }, title),
      ]),
      h('div', { class: ['content'] }, content),
    ])
  )
}

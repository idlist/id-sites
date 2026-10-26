// https://satteri.bruits.org/docs/plugins/#hast-plugins

import { defineHastPlugin } from 'satteri'

export const externalLinks = defineHastPlugin({
  name: 'external-links',
  element: {
    filter: ['a'],
    visit(node, ctx) {
      const href = node.properties.href
      if (href != null && href.startsWith('http')) {
        ctx.setProperty(node, 'target', '_blank')
        ctx.setProperty(node, 'rel', 'noopener noreferrer')
      }
    },
  },
})

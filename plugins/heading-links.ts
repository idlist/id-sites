import type { Element } from 'hast'
import { defineHastPlugin } from 'satteri'

export const headingLinks = defineHastPlugin({
  name: 'heading-links',
  element: {
    filter: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
    visit(node, ctx) {
      const id = node.properties.id
      if (!id) return

      const icon: Element = {
        type: 'element',
        tagName: 'img',
        properties: {
          src: '/assets/link.svg',
          alt: '',
          'aria-hidden': true,
        },
        children: [],
      }

      const anchor: Element = {
        type: 'element',
        tagName: 'a',
        properties: {
          href: `#${id}`,
          class: ['heading-link'],
        },
        children: [icon],
      }

      ctx.insertChildAt(node, node.children.length, anchor)
    },
  },
})

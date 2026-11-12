import { h } from 'hastscript'
import { defineHastPlugin } from 'satteri'

export const headingAnchors = defineHastPlugin({
  name: 'heading-anchors',
  element: {
    filter: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
    visit(node, ctx) {
      const id = node.properties.id
      if (!id) return

      const anchor = createAnchor(id)
      ctx.insertChildAt(node, node.children.length, anchor)
    },
  },
})

function createAnchor(id: string) {
  return (
    h('a', { href: `#${id}`, class: ['id-heading-anchor'] }, [
      h('img', { src: '/assets/link.svg', alt: '', 'aria-hidden': true }),
    ])
  )
}

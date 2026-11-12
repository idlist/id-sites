import { h } from 'hastscript'
import { defineHastPlugin } from 'satteri'

export const wrapTable = defineHastPlugin({
  name: 'wrap-table',
  element: {
    filter: ['table'],
    visit(node, ctx) {
      const classes = node.properties.className ?? []
      const wrapper = h('div', { class: ['id-table', ...classes] })

      ctx.wrapNode(node, wrapper)
      ctx.setProperty(node, 'class', undefined)
    },
  },
})

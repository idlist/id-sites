import { satteri, satteriHeadingIdsPlugin as headingIds } from '@astrojs/markdown-satteri'
import mdx from '@astrojs/mdx'
import vue from '@astrojs/vue'
import { defineConfig } from 'astro/config'
import path from 'node:path'
import markdown from 'unplugin-vue-markdown/vite'
import svgLoader from 'vite-svg-loader'
import { callouts, externalLinks, headingAnchors, wrapTable } from './satteri-plugins'
import virtualI18n from './virtual-i18n'

const licenseNotice = `
// Check the licenses of bundled dependencies at: https://idl.ist/third-party-licenses.md
`.trim()

function toAbsolute(relative: string) {
  return path.resolve(import.meta.dirname, relative)
}

// https://astro.build/config
export default defineConfig({
  site: 'https://idl.ist',
  build: {
    format: 'directory',
  },
  server: {
    host: true,
  },
  markdown: {
    shikiConfig: {
      theme: 'one-light',
    },
    processor: satteri({
      features: {
        attributes: true,
      },
      hastPlugins: [
        externalLinks,
        headingIds(),
        headingAnchors,
        wrapTable,
        callouts,
      ],
    }),
  },
  vite: {
    resolve: {
      alias: {
        '@assets': toAbsolute('src/assets'),
      },
    },
    build: {
      license: {
        fileName: 'third-party-licenses.md',
      },
      rolldownOptions: {
        output: {
          postBanner: licenseNotice,
        },
      },
    },
    plugins: [
      svgLoader({ svgo: false }),
      virtualI18n({
        localeRoot: 'src/locales',
        localeFiles: {
          en: ['home.en.json'],
          zh: ['home.zh.json'],
        },
        defaultLocale: 'en',
      }),
      markdown({
        include: [/\.vmd$/],
      }),
    ],
  },
  integrations: [
    vue({
      include: [/\.vue$/, /\.vmd$/],
    }),
    mdx(),
  ],
})

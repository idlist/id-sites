import mdx from '@astrojs/mdx'
import vue from '@astrojs/vue'
import { defineConfig } from 'astro/config'
import path from 'node:path'
import svgLoader from 'vite-svg-loader'
import vueVirtualI18n from './virtual-i18n'

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
  vite: {
    resolve: {
      alias: {
        '@assets': toAbsolute('src/assets'),
      },
    },
    plugins: [
      svgLoader({ svgo: false }),
      vueVirtualI18n({
        localeRoot: 'src/locales',
        localeFiles: {
          en: ['home.en.json'],
          zh: ['home.zh.json'],
        },
        defaultLocale: 'en',
      }),
    ],
  },
  integrations: [
    vue(),
    mdx(),
  ],
})

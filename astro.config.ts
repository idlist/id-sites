import vue from '@astrojs/vue'
import { defineConfig } from 'astro/config'
import path from 'node:path'
import vueVirtualI18n from './virtual-i18n'

const toAbsolute = (relative: string) => {
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
      vueVirtualI18n({
        localeRoot: 'src/locales',
        localeFiles: {
          en: ['home.en.json'],
          'zh-Hans': ['home.zh.json'],
        },
        defaultLocale: 'zh-Hans',
      }),
    ],
  },
  integrations: [vue()],
})

import vue from '@astrojs/vue'
import { defineConfig } from 'astro/config'
import vueVirtualI18n from './virtual-i18n'

// https://astro.build/config
export default defineConfig({
  site: 'https://idl.ist',
  build: {
    format: 'directory',
  },
  vite: {
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

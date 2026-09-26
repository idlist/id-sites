import { defineConfig } from 'vitest/config'

// https://vitest.dev/config
export default defineConfig({
  test: {
    environment: 'node',
    include: ['virtual-i18n/**/*.test.ts'],
  },
})

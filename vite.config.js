import { resolve } from 'node:path'
import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        hy: resolve(import.meta.dirname, 'index.html'),
        ru: resolve(import.meta.dirname, 'ru/index.html'),
        en: resolve(import.meta.dirname, 'en/index.html'),
      },
    },
  },
})

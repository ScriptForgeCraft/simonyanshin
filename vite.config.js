import { resolve } from 'node:path'
import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        hy: resolve(import.meta.dirname, 'index.html'),
        ru: resolve(import.meta.dirname, 'ru/index.html'),
        en: resolve(import.meta.dirname, 'en/index.html'),
        projectsHy: resolve(import.meta.dirname, 'projects/index.html'),
        projectsRu: resolve(import.meta.dirname, 'ru/projects/index.html'),
        projectsEn: resolve(import.meta.dirname, 'en/projects/index.html'),
        aboutHy: resolve(import.meta.dirname, 'about/index.html'),
        aboutRu: resolve(import.meta.dirname, 'ru/about/index.html'),
        aboutEn: resolve(import.meta.dirname, 'en/about/index.html'),
        equipmentHy: resolve(import.meta.dirname, 'equipment/index.html'),
        equipmentRu: resolve(import.meta.dirname, 'ru/equipment/index.html'),
        equipmentEn: resolve(import.meta.dirname, 'en/equipment/index.html'),
        contactHy: resolve(import.meta.dirname, 'contact/index.html'),
        contactRu: resolve(import.meta.dirname, 'ru/contact/index.html'),
        contactEn: resolve(import.meta.dirname, 'en/contact/index.html'),
      },
    },
  },
})

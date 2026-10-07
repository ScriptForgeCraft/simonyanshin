import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    VitePWA({
      // Use Workbox's generated service worker.  It is rebuilt with a revisioned
      // precache manifest on every production build, so a deployment cannot leave
      // visitors on an incompatible HTML/CSS/JS version.
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      manifest: false,
      includeAssets: ['favicon.svg', 'brand/favicon.ico', 'robots.txt'],
      workbox: {
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: true,
        globPatterns: [
          '**/*.{html,js,css,ico,svg,webmanifest}',
        ],
        // Keep the install lightweight: the application shell is available
        // offline immediately, while all photos and PDFs enter their dedicated
        // runtime caches only after a visitor actually requests them.
        // This is a multi-page site, not an SPA. Each published HTML page is
        // precached, so falling unknown URLs back to the Armenian home page
        // would be misleading (and can mask a real 404).
        navigateFallback: null,
        runtimeCaching: [
          {
            urlPattern: ({ url, request }) => (
              url.origin === self.location.origin && (
                request.destination === 'image'
                || /\/portfolio\/.+\.(?:avif|jpe?g|png|webp)$/i.test(url.pathname)
              )
            ),
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'simonyanshin-images',
              cacheableResponse: { statuses: [0, 200] },
              expiration: {
                maxEntries: 350,
                maxAgeSeconds: 60 * 60 * 24 * 90,
              },
            },
          },
          {
            urlPattern: ({ url }) => (
              url.origin === self.location.origin && url.pathname.endsWith('.pdf')
            ),
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'simonyanshin-documents',
              cacheableResponse: { statuses: [0, 200] },
              expiration: {
                maxEntries: 12,
                maxAgeSeconds: 60 * 60 * 24 * 30,
              },
            },
          },
        ],
      },
      devOptions: {
        enabled: false,
      },
    }),
  ],
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

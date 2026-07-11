export default defineNuxtConfig({
  compatibilityDate: '2025-01-01',
  devtools: { enabled: false },
  // better-sqlite3 is a native module — keep it external to the Nitro bundle
  nitro: {
    externals: {
      inline: [],
    },
    moduleSideEffects: ['better-sqlite3'],
  },
  app: {
    head: {
      htmlAttrs: { lang: 'th' },
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1, viewport-fit=cover' },
      ],
    },
  },
})

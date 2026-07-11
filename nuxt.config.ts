export default defineNuxtConfig({
  compatibilityDate: '2025-01-01',
  devtools: { enabled: false },
  runtimeConfig: {
    public: {
      // โดเมนสาธารณะ (เช่น https://loveletter.up.railway.app) — ตั้งผ่าน env NUXT_PUBLIC_SITE_URL
      // ถ้าว่างจะ fallback ไปใช้ host ของ request (สะดวกตอน dev)
      siteUrl: '',
    },
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

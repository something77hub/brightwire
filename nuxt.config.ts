// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },

  modules: [
    '@nuxtjs/tailwindcss',
    '@nuxtjs/google-fonts',
  ],

  googleFonts: {
    families: {
      'Playfair Display': {
        wght: [400, 500, 600, 700],
      },
      'Roboto': {
        wght: [300, 400, 500, 700],
      },
    },
    display: 'swap',
  },

  app: {
    head: {
      title: 'BrightWire - Good News Daily',
      htmlAttrs: {
        lang: 'en',
      },
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Your daily dose of positive news. Uplifting stories about heroes, innovations, planet wins, and solutions from around the world.' },
        { name: 'robots', content: 'index, follow' },
        { name: 'author', content: 'BrightWire' },
        { name: 'theme-color', content: '#f59e0b' },
        // Open Graph
        { property: 'og:type', content: 'website' },
        { property: 'og:site_name', content: 'BrightWire' },
        { property: 'og:title', content: 'BrightWire - Good News Daily' },
        { property: 'og:description', content: 'Your daily dose of positive news. Uplifting stories about heroes, innovations, planet wins, and solutions.' },
        { property: 'og:locale', content: 'en_US' },
        { property: 'og:image', content: 'https://www.brightwire.news/og-image.png' },
        { property: 'og:image:width', content: '1200' },
        { property: 'og:image:height', content: '630' },
        { property: 'og:url', content: 'https://www.brightwire.news' },
        // Twitter
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:site', content: '@BrightWireDaily' },
        { name: 'twitter:title', content: 'BrightWire - Good News Daily' },
        { name: 'twitter:description', content: 'Your daily dose of positive news. Uplifting stories from around the world.' },
        { name: 'twitter:image', content: 'https://www.brightwire.news/og-image.png' },
      ],
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
        { rel: 'alternate', type: 'application/rss+xml', title: 'BrightWire RSS Feed', href: '/feed.xml' },
        { rel: 'sitemap', type: 'application/xml', href: '/api/sitemap.xml' },
      ],
      script: [
        // CookieYes - Cookie Consent Banner (loads first)
        {
          src: 'https://cdn-cookieyes.com/client_data/01329f7abb14b50a131b9071e848309c/script.js',
          id: 'cookieyes',
          type: 'text/javascript',
        },
        // Google Analytics (GA4) - Loads after consent via CookieYes
        {
          src: 'https://www.googletagmanager.com/gtag/js?id=G-JJRV5NLZ9D',
          async: true,
          'data-cookieyes': 'cookieyes-analytics', // CookieYes will manage this
        },
        {
          innerHTML: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-JJRV5NLZ9D');
          `,
          type: 'text/javascript',
          'data-cookieyes': 'cookieyes-analytics',
        },
        // Google Ads Conversion Tracking
        {
          src: 'https://www.googletagmanager.com/gtag/js?id=AW-17845884555',
          async: true,
        },
        {
          innerHTML: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'AW-17845884555');
          `,
          type: 'text/javascript',
        },
      ],
    },
  },

  runtimeConfig: {
    // Server-only keys
    anthropicApiKey: process.env.ANTHROPIC_API_KEY,
    mongodbUri: process.env.MONGODB_URI,
    adminSecret: process.env.ADMIN_SECRET,
    ayrshareApiKey: process.env.AYRSHARE_API_KEY,
    heygenApiKey: process.env.HEYGEN_API_KEY,
    heygenAvatarId: process.env.HEYGEN_AVATAR_ID,

    // Public keys (available on client)
    public: {
      siteUrl: process.env.SITE_URL || 'https://brightwire.news',
      cloudinaryCloud: process.env.CLOUDINARY_CLOUD_NAME || 'demo',
      // Google Ad Manager - set your network code to enable
      // Find it at: Google Ad Manager > Admin > Global Settings > Network code
      gamNetworkCode: process.env.GAM_NETWORK_CODE || '',
      // Pusher for real-time updates
      pusherKey: process.env.PUSHER_KEY || '',
      pusherCluster: process.env.PUSHER_CLUSTER || 'us2',
    },
  },

  nitro: {
    preset: 'vercel',
    vercel: {
      config: {
        functions: {
          // All API functions get 300s timeout
          'api/**': {
            maxDuration: 300,
          },
        },
      },
    },
  },

  routeRules: {
    // Don't cache homepage - needs fresh stories
    '/': { swr: false },
    // Cache article pages for 1 hour (content doesn't change)
    '/article/**': { swr: 3600 },
    // Don't cache stories API
    '/api/stories': { swr: false },
    '/api/stories/**': { swr: false },
    // Don't cache today page
    '/api/today': { swr: false },
  },

  compatibilityDate: '2024-12-01',
})

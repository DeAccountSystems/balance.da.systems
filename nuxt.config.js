import Vue from 'vue'
import * as Integrations from '@sentry/integrations'
import abcConfig from './abc.config'
import { resolve } from 'path'

export default {
  // Disable server-side rendering: https://go.nuxtjs.dev/ssr-mode
  ssr: false,
  srcDir: 'src/',
  server: {
    host: abcConfig.host,
    port: abcConfig.port
  },

  // Global page headers: https://go.nuxtjs.dev/config-head
  head: {
    // titleTemplate: '%s - ' + config.appNmae,
    // title: config.appNmae,
    title: '.bit Balance',
    htmlAttrs: {
      lang: 'en'
    },
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width,height=device-height,initial-scale=1.0,maximum-scale=1.0,user-scalable=no,viewport-fit=cover' },
      { name: 'apple-mobile-web-app-capable', content: 'yes' },
      { name: 'format-detection', content: 'telephone=no' },
      // { hid: 'description', name: 'description', content: config.description },
      { hid: 'description', name: 'description', content: 'Balance for .bit' },
      { hid: 'keyword', name: 'keywords', content: '.bit, buy .bit, sell .bit, trade .bit, bit, NFT, bid .bit, .bit store, .bit market, buy domain, sell domain, purchase domain, domain name service, domain investment, DNS, blockchain domain, nervos, ckb, decentralized domain' },
      // The Open Graph protocol
      { hid: 'og:description', property: 'og:description', content: 'Balance for .bit' },
      { hid: 'og:title', property: 'og:title', content: '.bit Balance' },
      { hid: 'og:site_name', property: 'og:site_name', content: '.bit Balance' },
      { hid: 'og:type', property: 'og:type', content: 'article' },
      { hid: 'og:url', property: 'og:url', content: `https://${abcConfig.hostname}/` },
      { hid: 'og:image', property: 'og:image', content: `https://${abcConfig.hostname}/images/seo-thumbnail-image.png` },
      // Twitter
      { hid: 'twitter:card', name: 'twitter:card', content: 'summary_large_image' },
      { hid: 'twitter:site', name: 'twitter:site', content: '.bit Balance' },
      { hid: 'twitter:title', name: 'twitter:title', content: '.bit Balance' },
      { hid: 'twitter:description', name: 'twitter:description', content: 'Balance for .bit' },
      { hid: 'twitter:image', name: 'twitter:image', content: `https://${abcConfig.hostname}/images/seo-thumbnail-image.png` },
      { hid: 'twitter:image:alt', name: 'twitter:image:alt', content: '.bit Balance' }
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
    ],
    script: [{
      src: '/fonts/iconfont.js',
      async: true
    }]
  },

  // Customize the progress-bar color
  loading: { color: '#00aadd' },

  // Global CSS: https://go.nuxtjs.dev/config-css
  css: [
    '~/assets/init.scss',
    '~/assets/index.scss'
  ],

  // Plugins to run before rendering page: https://go.nuxtjs.dev/config-plugins
  plugins: [
    '~/plugins/vuex-persistedstate.ts',
    '~/plugins/i18n',
    '~/plugins/vee-validate',
    '~/plugins/services.ts',
    '~/plugins/alert.ts',
    '~/plugins/toast.ts',
    '~/plugins/wallet-sdk.ts',
    '~/plugins/url-query-parser.ts'
  ],

  // Auto import components: https://go.nuxtjs.dev/config-components
  components: true,

  // Modules for dev and build (recommended): https://go.nuxtjs.dev/config-modules
  buildModules: [
    // https://go.nuxtjs.dev/typescript
    '@nuxt/typescript-build'
  ],

  // Modules: https://go.nuxtjs.dev/config-modules
  modules: [
    // https://composition-api.nuxtjs.org/
    ['@nuxtjs/composition-api/module'],
    // https://sentry.nuxtjs.org/
    ['@nuxtjs/google-gtag', {
      id: abcConfig.googleAnalyticsId,
      debug: !abcConfig.isProd
    }],
    [
      '@nuxtjs/sentry',
      {
        dsn: abcConfig.sentryDsn,
        disabled: true,
        config: {
          autoSessionTracking: false
        },
        integrations: [new Integrations.Vue({ Vue, attachProps: true })]
      }
    ]
  ],

  // Axios module configuration: https://go.nuxtjs.dev/config-axios
  // axios: {},

  router: {
    // disable prefetching globally
    prefetchLinks: false
  },

  render: {
    // prevent preload, improve first time performance
    resourceHints: false
  },

  alias: {
    'bn.js': resolve(__dirname, './node_modules/bn.js/lib/bn.js')
  },

  // Build Configuration: https://go.nuxtjs.dev/config-build
  build: {
    extractCSS: true
  }
}

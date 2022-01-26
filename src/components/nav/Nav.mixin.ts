import { defineComponent } from '@nuxtjs/composition-api'

export default defineComponent({
  data () {
    return {
      menus: [
        // {
        //   text: this.$tt('MarketPlace'),
        //   path: '/'
        // },
        // {
        //   text: this.$tt('Stats'),
        //   path: '/stats'
        // },
        // {
        //   text: this.$tt('My'),
        //   path: '/my'
        // },
        // {
        //   text: this.$tt('FAQ'),
        //   href: this.$i18n.locale === 'zh-CN' ? 'https://talk.da.systems/t/bestdas-com/115' : 'https://talk.da.systems/t/faq-bestdas-com/116'
        // }
      ]
    }
  },
  methods: {
    isTargetPath (path: string): boolean {
      return this.$route.path.includes(path)
    }
  }
})

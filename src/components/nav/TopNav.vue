<template>
  <div>
    <div class="top-nav__container">
      <a
        class="top-nav__logo-link"
        :href="config.domain"
      >
        <img class="top-nav-mobile__logo" src="/images/components/bestdas-logo.svg" alt="logo">
      </a>
      <nav class="top-nav__menus">
        <template v-for="(menu, index) in menus">
          <nuxt-link
            v-if="menu.path"
            :key="index"
            class="top-nav__item"
            :to="menu.path"
          >
            {{ $tt(menu.text) }}
          </nuxt-link>
          <a
            v-else
            :key="index"
            class="top-nav__item"
            :target="isMobile ? '_self' : '_blank'"
            :href="menu.href"
          >
            {{ $tt(menu.text) }}
          </a>
        </template>
      </nav>
      <div class="top-nav__right-actions">
        <LangSwitcher class="top-nav__lang-switcher" />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from '@nuxtjs/composition-api'
import config from '~~/config'
import NavMixin from '~/components/nav/Nav.mixin'
import LangSwitcher from '~/components/LangSwitcher.vue'
import { mapState } from 'vuex'
import { IConnectedAccount, ME_KEYS } from '~/store/me'
import { collapseString, isMobile } from '~/modules/tools'

export default defineComponent({
  name: 'TopNav',
  components: {
    LangSwitcher
  },
  mixins: [NavMixin],
  data () {
    return {
      config
    }
  },
  computed: {
    ...mapState({
      me: ME_KEYS.namespace
    }),
    isMobile,
    connectedAccount (): IConnectedAccount {
      return this.me.connectedAccount
    }
  },
  methods: {
    collapseString,
    onConnectWallet () {
      this.$walletSdk.walletsConnect()
    }
  }
})
</script>

<style lang="scss">
@import 'src/assets/variables';

.top-nav__container {
  position: relative;
  margin: 0 auto;
  height: 86px;
  max-width: $screen_xl;
  z-index: 0;
}

.top-nav__logo-link {
  display: inline-flex;
  margin-top: 30px;
  font-size: 26px;
  font-weight: bold;
  align-items: center;
  color: $primary-font-color;
}

.top-nav__logo {
  height: 23px;
}

.top-nav__right-actions {
  float: right;
  margin-top: 24px;
  display: flex;
  align-items: center;
}

.top-nav__lang-switcher {
  margin-right: 12px;
}

.top-nav__menus {
  position: absolute;
  left: 0;
  right: 0;
  margin-top: 24px;
  text-align: center;
  z-index: -1;
}

.top-nav__item {
  margin: 0 13px;
  padding: 0 12px;
  display: inline-block;
  height: 39px;
  border-radius: 8px;
  line-height: 39px;
  font-size: $font-size-14;
  font-weight: 600;
  color: $primary-font-color;

  &:hover {
    background: rgba(7, 58, 141, 0.08);
  }
}

.top-nav__address {
  display: flex;
  align-items: center;
  font-size: $font-size-14;
  font-weight: 600;
  color: $white;
  line-height: 16px;
}

.top-nav__address__avatar {
  margin-right: 8px;
}
</style>

<template>
  <div class="top-nav-mobile">
    <a
      class="top-nav-mobile__logo-link"
      :href="config.domain"
    >
      <img class="top-nav-mobile__logo" src="/images/components/bestdas-logo.svg" alt="logo">
    </a>
    <LangSwitcher class="top-nav-mobile__lang-switcher" />
  </div>
</template>

<script lang="ts">
import { defineComponent } from '@nuxtjs/composition-api'
import config from '~~/config'
import LangSwitcher from '~/components/LangSwitcher.vue'

export default defineComponent({
  name: 'TopNavMobile',
  components: {
    LangSwitcher,
  },
  data () {
    return {
      config
    }
  }
})
</script>

<style lang="scss">
@import 'src/assets/variables';

.top-nav-mobile {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 54px;
}

.top-nav-mobile__logo-link {
  margin-left: 16px;
  display: flex;
  align-items: center;
  font-size: 18px;
  font-weight: bold;
  color: $primary-font-color;
}

.top-nav-mobile__logo {
  height: 23px;
}

.top-nav-mobile__lang-switcher {
  display: flex;
}
</style>

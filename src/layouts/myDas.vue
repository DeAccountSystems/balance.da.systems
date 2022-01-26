<template>
  <div
    :class="isMobile ? 'layout-my-das_mobile' : 'layout-my-das'"
  >
    <TopNavMobile v-if="isMobile" />
    <TopNav v-else />
    <h3
      class="layout-my-das__tips-title"
      :class="{ 'layout-my-das__tips-title_pc': !isMobile }"
    >{{ $tt('Lightweight and decentralized CKB balance management tool') }}</h3>
    <div
      class="layout-my-das__tips"
      :class="{ 'layout-my-das__tips_pc': !isMobile }"
    >{{ $tt('DAS-related income, expense, and reward records are all here') }}</div>
    <div
      :class="{
        'layout-my-das__container': !isMobile,
        'layout-my-das__container_mobile': isMobile
      }"
      :style="{ minHeight: isMobile && minHeight }"
    >
      <Nuxt />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from '@nuxtjs/composition-api'
import TopNav from '~/components/nav/TopNav.vue'
import { isMobile } from '~/modules/tools'
import TopNavMobile from '~/components/nav/TopNavMobile.vue'

export default defineComponent({
  name: 'LayoutMyDas',
  components: {
    TopNav,
    TopNavMobile
  },
  computed: {
    isMobile,
    minHeight () {
      return `${window.innerHeight - 54}px`
    }
  }
})
</script>

<style lang="scss">
@import 'src/assets/variables';

.layout-my-das {
  padding-bottom: 24px;
  min-height: calc(100vh - 24px);
  background: $background;
}

.layout-my-das__tips-title {
  font-size: 18px;
  margin: 10px 16px 5px 16px;
  color: $primary-font-color;
}

.layout-my-das__tips {
  font-size: 14px;
  margin: 0 16px 0 16px;
  color: $primary-font-color;
  opacity: 0.3;
}

.layout-my-das__tips_pc {
  text-align: center;
}

.layout-my-das__tips-title_pc {
  text-align: center;
}

.layout-my-das_mobile {
  background-image: url("/images/layouts/my-das-mobile-bg.png");
  background-repeat: no-repeat;
  background-size: 100% 186px;
}

.layout-my-das__container {
  display: flex;
  margin: 24px auto 0 auto;
  width: $pc-layout-container-width;
  min-height: $pc-layout-container-min-height;
  background: $white;
  box-shadow: $pc-layout-container-box-shadow;
  border-radius: 16px;
  border: $container-border;
  overflow: hidden;
}

.layout-my-das__container_mobile {
  display: flex;
  margin-bottom: constant(safe-area-inset-bottom);
  margin-bottom: env(safe-area-inset-bottom);
}
</style>

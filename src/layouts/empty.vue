<template>
  <div
    :class="{
      'layout-empty': !isMobile
    }"
  >
    <div
      :class="{
        'layout-empty__container': !isMobile,
        'layout-empty__container_mobile': isMobile
      }"
      :style="{ minHeight: isMobile && minHeight }"
    >
      <Nuxt />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from '@nuxtjs/composition-api'
import { isMobile } from '~/modules/tools'

export default defineComponent({
  name: 'LayoutEmpty',
  computed: {
    isMobile,
    minHeight () {
      return `${window.innerHeight}px`
    }
  }
})
</script>

<style lang="scss">
@import 'src/assets/variables';

$pc-min-heigth: calc(100vh - 48px);

.layout-empty {
  padding: 24px 0;
  min-height: $pc-min-heigth;
  background: $background;
}

.layout-empty__container {
  display: flex;
  flex-direction: column;
  margin: 0 auto;
  width: $pc-layout-container-width;
  min-height: $pc-min-heigth;
  background: $white;
  box-shadow: $pc-layout-container-box-shadow;
  border-radius: 16px;
  border: $container-border;
  overflow: hidden;
}

.layout-empty__container_mobile {
  display: flex;
  flex-direction: column;
  margin-bottom: constant(safe-area-inset-bottom);
  margin-bottom: env(safe-area-inset-bottom);
}
</style>

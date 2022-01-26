<template>
  <div class="page-my">
    <ConnectedStatus class="page-my__connected-status" />
    <Balance class="page-my__margin-top-0" />
  </div>
</template>

<script lang="ts">
import { defineComponent } from '@nuxtjs/composition-api'
import { mapState } from 'vuex'
import { ME_KEYS } from '~/store/me'
import { COMMON_KEYS } from '~/store/common'
import Balance from '~/pages/-/Balance.vue'
import ConnectedStatus from '~/pages/-/ConnectedStatus.vue'

export default defineComponent({
  name: 'Index',
  layout: 'myDas',
  components: {
    Balance,
    ConnectedStatus
  },
  computed: {
    ...mapState({
      me: ME_KEYS.namespace
    })
  },
  mounted () {
    this.$store.dispatch(COMMON_KEYS.fetchTokens)
  }
})
</script>

<style lang="scss">
.page-my {
  flex: 1;
}

.page-my__connected-status {
  margin: 22px 16px 14px 16px;
}

.page-my__margin-top-0 {
  margin-top: 0;
}
</style>

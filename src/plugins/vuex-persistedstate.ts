import { Context } from '@nuxt/types'
import createPersistedState from 'vuex-persistedstate'
import { appNmae } from '~~/config'
import { COMMON_KEYS } from '~/store/common'

export default ({ store }: Context) => {
  createPersistedState({
    key: appNmae + 'v2',
    paths: [
      COMMON_KEYS.namespace,
      'me.connectedAccount',
      'me.inviter',
      'me.channel',
      'me.ckbAddressList',
      'me.availableBalance',
      'me.transitBalance'
    ]
  })(store)
}

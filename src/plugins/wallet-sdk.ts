import { Context } from '@nuxt/types'
import { onGlobalSetup, provide } from '@nuxtjs/composition-api'
import WalletSdk from '~/modules/WalletSdk'

export const WalletSdkProvider = 'WalletSdkProvider'

export default function (context: Context, inject: Function) {
  const _walletSdk = new WalletSdk(context)
  _walletSdk.init()
  inject('walletSdk', _walletSdk)

  // provide services for composition-api
  onGlobalSetup(() => {
    provide<WalletSdk>(WalletSdkProvider, _walletSdk)
  })
}

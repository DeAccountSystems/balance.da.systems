import Vue from 'vue'
import { Services } from '~/services'
import { IAlertOptions } from '~/plugins/alert'
import WalletSdk from '~/modules/WalletSdk'

declare module 'vue/types/vue' {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  interface Vue {
    $tt: (key: string, params?: Record<string, string| number>) => string,
    $services: Services,
    $alert: (options: IAlertOptions) => void,
    $toast: (message: string, duration?: number) => void,
    $gtag: (type: string, action: string, option: { [key: string]: any }) => void,
    $walletSdk: WalletSdk,
  }
}

declare module '*.vue' {
  export default Vue
}

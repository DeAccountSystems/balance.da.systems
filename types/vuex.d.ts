import { Services } from '~/services'
import { IAlertOptions } from '~/plugins/alert'

declare module 'vuex/types/index' {
  // eslint-disable-next-line @typescript-eslint/naming-convention,@typescript-eslint/no-unused-vars
  interface Store<S> {
    $tt: (key: string, params?: Record<string, string| number>) => string,
    $services: Services,
    $alert: (options: IAlertOptions) => void,
    $toast: (message: string, duration?: number) => void,
  }
}

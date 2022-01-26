import { Context } from '@nuxt/types'
import { onGlobalSetup, provide } from '@nuxtjs/composition-api'
import { Services } from '~/services'

export const ServiceProvider = 'ServiceProvider'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function (context: Context, inject: Function) {
  const services = new Services(context)
  inject('services', services)

  // provide services for composition-api
  onGlobalSetup(() => {
    provide<Services>(ServiceProvider, services)
  })
}

import { Context } from '@nuxt/types'
import { ME_KEYS } from '~/store/me'

export default function (context: Context) {
  const { channel, inviter } = context.query
  if (channel) {
    context.store.commit(ME_KEYS.setChannel, window.decodeURIComponent(channel as string))
  }
  if (inviter) {
    context.store.commit(ME_KEYS.setInviter, window.decodeURIComponent(inviter as string))
  }
}

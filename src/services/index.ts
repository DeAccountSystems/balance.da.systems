import { Context } from '@nuxt/types'
import Common from '~/services/Common'
import Account from '~/services/Account'

export class Services {
  common: Common
  account: Account

  constructor (context: Context) {
    this.common = new Common(context)
    this.account = new Account(context)
  }
}

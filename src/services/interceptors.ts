import { Context } from '@nuxt/types'
import { AxiosError, AxiosResponse } from 'axios'
import errno from '~/constant/errno'

let upgradeNotified = false

export function onFulfilled (context: Context) {
  return (res: AxiosResponse) => {
    if (res.data) {
      if (res.data.err_no === errno.success) {
        return res.data.data
      }
      else {
        if (res.data.err_no === errno.apiErrorCodeSystemUpgrade) {
          if (!upgradeNotified) {
            context.app.$alert({
              title: context.app.$tt('Tips'),
              message: context.app.$tt('upgrade notice')
            })
          }
          upgradeNotified = true
        }
        else {
          const serverError: any = new Error(res.data.err_msg)
          serverError.code = res.data.err_no
          throw serverError
        }
      }
    }
    else {
      const serverError: any = new Error(res.data.err_msg)
      serverError.code = res.data.err_no
      throw serverError
    }
  }
}

export function onRejected (err: AxiosError) {
  if (!err.code) {
    err.code = String(err?.response?.status) || String(errno.networkError)
  }
  if (err?.response?.statusText) {
    err.message = err?.response?.statusText
  }
  throw err
}

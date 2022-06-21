import { AxiosError, AxiosResponse } from 'axios'
import { Context } from '@nuxt/types'
import errno from '~/constant/errno'

export function onFulfilled (context: Context) {
  return (res: AxiosResponse) => {
    if (res.data) {
      if (res.data.err_no === errno.success) {
        return res.data.data
      }
      else {
        if (res.data.err_no === errno.apiErrorCodeSystemUpgrade) {
          context.app.$alert({
            title: context.app.$tt('Tips'),
            message: context.app.$tt('upgrade notice')
          })
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
  err.code = String(errno.networkError)
  throw err
}
